import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController, LoadingController } from '@ionic/angular';
import { ChildService } from '../services/child.service';
import { HasRoleDirective } from '../directives/has-role.directive';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

// ✅ Registrar todos los íconos ANTES de la clase
addIcons(allIcons);

@Component({
  selector: 'app-children-list',
  standalone: true,
  templateUrl: './child-list.page.html',
  styleUrls: ['./child-list.page.scss'],
  imports: [CommonModule, IonicModule, HasRoleDirective]
})
export class ChildListPage implements OnInit {
  children: any[] = [];
  isLoading = false;

  private childService = inject(ChildService);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);
  private navCtrl = inject(NavController);

  ngOnInit(): void {
    this.loadChildren();
  }

  /** Cargar lista completa de niños */
  loadChildren(): void {
    this.isLoading = true;
    this.childService.getAllChildren().subscribe({
      next: (data) => {
        this.children = data;
        this.isLoading = false;
      },
      error: async (error) => {
        console.error('Error al obtener niños:', error);
        this.isLoading = false;

        let message = 'No se pudieron cargar los datos. Intenta más tarde.';
        if (error.status === 403) {
          message = 'Acceso denegado. Solo administradores o staff pueden ver esta lista.';
        }

        const alert = await this.alertCtrl.create({
          header: 'Error',
          message,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  /** Pull to refresh */
  doRefresh(event: any): void {
    this.childService.getAllChildren().subscribe({
      next: (data) => {
        this.children = data;
        event.target.complete();
      },
      error: () => {
        event.target.complete();
      }
    });
  }

  /** Navegar atrás */
  goBack(): void {
    this.navCtrl.back();
  }

  /** Navegar a registro */
  addChild(): void {
    this.navCtrl.navigateForward('/child-registration');
  }

  /** Editar niño */
  editChild(child: any): void {
    this.navCtrl.navigateForward(`/child-registration/${child.id}`);
  }

  /** Confirmación antes de eliminar */
  async confirmDelete(id: number): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: `
        <p>Deleting this child will also <strong>remove all associated records</strong> (medical info, activities, etc.).</p>
        <p>Are you sure you want to continue?</p>
      `,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteChild(id)
        }
      ]
    });
    await alert.present();
  }

  /** Eliminar niño */
  async deleteChild(id: number): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Deleting...' });
    await loading.present();

    this.childService.deleteChild(id).subscribe({
      next: () => {
        this.children = this.children.filter(c => c.id !== id);
        loading.dismiss();
      },
      error: async () => {
        loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Could not delete the child. Try again later.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}