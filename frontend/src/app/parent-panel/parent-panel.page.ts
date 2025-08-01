import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChildService } from 'src/app/services/child.service';
import { AuthService } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

addIcons(allIcons);

interface CustomAlertButton {
  text: string;
  cssClass?: string;
  handler?: () => void;
}

@Component({
  selector: 'app-parent-panel',
  templateUrl: './parent-panel.page.html',
  styleUrls: ['./parent-panel.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class ParentPanelPage implements OnInit {
  isMenuOpen = false;
  showCustomAlert = false;
  customAlertData: {
    type?: string;
    title?: string;
    subtitle?: string;
    message?: string;
    buttons?: CustomAlertButton[];
  } | null = null;

  children: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private childService: ChildService,
  ) {}

  ngOnInit() {
    this.loadChildren();
  }

  loadChildren() {
    this.childService.getMyChildren().subscribe({
      next: (children: any[]) => {
        this.children = children;
      },
      error: (err) => {
        console.error('Error loading children:', err);
      }
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  handleMenuOption(option: string) {
    switch (option) {
      case 'profile':
        this.router.navigate(['/child-profile']);
        break;
        case 'contact':
        this.router.navigate(['/communication-select']);
        break;
      case 'medical':
        this.goToMedicalOption();
        break;
      case 'notifications':
        this.router.navigate(['/notifications']);
        break;
      case 'logout':
        this.authService.logout();
        break;
    }
    this.closeMenu();
  }

  // Nueva función que decide si crear o editar perfil niño (similar a medical)
  goToChildRegistrationOrEdit() {
    this.childService.getMyChildren().subscribe({
      next: (children: any[]) => {
        if (children.length === 0) {
          // Sin registros, ir directo a registro
          this.router.navigate(['/child-registration']);
        } else if (children.length === 1) {
          // 1 solo registro: preguntar si quiere editar o crear otro
          this.customAlertData = {
            type: 'selection',
            title: 'Child Profile Exists',
            subtitle: 'Would you like to edit the existing profile or register a new child?',
            buttons: [
              {
                text: 'Edit Profile',
                handler: () => {
                  this.router.navigate(['/child-registration', children[0].id]);
                  this.closeCustomAlert();
                }
              },
              {
                text: 'Register New Child',
                handler: () => {
                  this.router.navigate(['/child-registration']);
                  this.closeCustomAlert();
                }
              },
              {
                text: 'Cancel',
                cssClass: 'cancel-button',
                handler: () => this.closeCustomAlert()
              }
            ]
          };
          this.showCustomAlert = true;
        } else {
          // Varios registros: seleccionar cuál editar o crear nuevo
          const buttons: CustomAlertButton[] = children.map(child => ({
            text: `Edit: ${child.first_name} ${child.last_name}`,
            handler: () => {
              this.router.navigate(['/child-registration', child.id]);
              this.closeCustomAlert();
            }
          }));
          buttons.push({
            text: 'Register New Child',
            handler: () => {
              this.router.navigate(['/child-registration']);
              this.closeCustomAlert();
            }
          });
          buttons.push({
            text: 'Cancel',
            cssClass: 'cancel-button',
            handler: () => this.closeCustomAlert()
          });

          this.customAlertData = {
            type: 'selection',
            title: 'Select Child to Edit or Register New',
            buttons: buttons
          };
          this.showCustomAlert = true;
        }
      },
      error: (err) => {
        console.error('Error loading children:', err);
      }
    });
  }

  goToMedicalOption() {
    this.childService.getMyChildren().subscribe({
      next: (children: any[]) => {
        if (children.length === 0) {
          this.showSimpleAlert(
            'No Records',
            'You must register a child first before adding medical information.'
          );
        } else if (children.length === 1) {
          this.router.navigate(['/medical-info', children[0].id]);
        } else {
          this.showChildSelectionAlert(children);
        }
      },
      error: (err) => console.error('Error loading children:', err)
    });
  }

  goToMedicalSelection() {
    this.childService.getMyChildren().subscribe({
      next: (children: any[]) => {
        if (children.length === 0) {
          this.showSimpleAlert(
            'No Records',
            'You must register a child first before adding medical information.'
          );
        } else if (children.length === 1) {
          const child = children[0];
          if (child.hasMedicalRecord) {
            this.router.navigate(['/medical-info', child.id]);
          } else {
            this.router.navigate(['/medical-form', child.id]);
          }
        } else {
          const buttons: CustomAlertButton[] = children.map(child => ({
            text: `${child.first_name} ${child.last_name}`,
            handler: () => {
              if (child.hasMedicalRecord) {
                this.router.navigate(['/medical-info', child.id]);
              } else {
                this.router.navigate(['/medical-form', child.id]);
              }
              this.closeCustomAlert();
            }
          }));
          buttons.push({
            text: 'Cancel',
            cssClass: 'cancel-button',
            handler: () => this.closeCustomAlert()
          });

          this.customAlertData = {
            type: 'selection',
            title: 'Select Child',
            subtitle: 'Choose the child to view or create medical record',
            message: 'Select one of the following registered children:',
            buttons: buttons
          };
          this.showCustomAlert = true;
        }
      },
      error: (err) => console.error('Error loading children:', err)
    });
  }

  showSimpleAlert(title: string, message: string) {
    this.customAlertData = {
      type: 'simple',
      title: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: () => this.closeCustomAlert()
        }
      ]
    };
    this.showCustomAlert = true;
  }

  showChildSelectionAlert(children: any[]) {
    const buttons: CustomAlertButton[] = [
      ...children.map(child => ({
        text: `${child.first_name} ${child.last_name}`,
        handler: () => {
          this.router.navigate(['/medical-info', child.id]);
          this.closeCustomAlert();
        }
      })),
      {
        text: 'Cancel',
        cssClass: 'cancel-button',
        handler: () => this.closeCustomAlert()
      }
    ];

    this.customAlertData = {
      type: 'selection',
      title: 'Select Child',
      subtitle: 'Choose the child to view their medical information',
      message: 'Select one of the following registered children:',
      buttons: buttons
    };
    this.showCustomAlert = true;
  }

  goToTimeline() {
    this.childService.getMyChildren().subscribe({
      next: (children: any[]) => {
        if (children.length === 0) {
          this.showSimpleAlert(
            'No Children',
            'You must register a child first before viewing the timeline.'
          );
        } else if (children.length === 1) {
          this.router.navigate(['/child-timeline', children[0].id]);
        } else {
          this.showChildSelectionAlertForTimeline(children);
        }
      },
      error: (err) => console.error('Error loading children:', err)
    });
  }

  showChildSelectionAlertForTimeline(children: any[]) {
    const buttons: CustomAlertButton[] = [
      ...children.map(child => ({
        text: `${child.first_name} ${child.last_name}`,
        handler: () => {
          this.router.navigate(['/child-timeline', child.id]);
          this.closeCustomAlert();
        }
      })),
      {
        text: 'Cancel',
        cssClass: 'cancel-button',
        handler: () => this.closeCustomAlert()
      }
    ];

    this.customAlertData = {
      type: 'selection',
      title: 'Select Child',
      subtitle: 'Choose the child to view their timeline',
      message: 'Select one of the following registered children:',
      buttons: buttons
    };
    this.showCustomAlert = true;
  }

  closeCustomAlert() {
    this.showCustomAlert = false;
    this.customAlertData = null;
  }

  onCustomAlertButtonClick(button: CustomAlertButton) {
    if (button.handler) {
      button.handler();
    }
  }

  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeCustomAlert();
    }
  }
}

