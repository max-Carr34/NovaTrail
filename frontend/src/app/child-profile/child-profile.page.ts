import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ChildService } from '../services/child.service';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

addIcons(allIcons);

@Component({
  selector: 'app-child-profile',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './child-profile.page.html',
  styleUrls: ['./child-profile.page.scss']
})
export class ChildProfilePage implements OnInit {
  children: any[] = [];
  isLoading = false;
  errorMsg = '';

  constructor(
    private childService: ChildService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadChildren();
  }

  // Función para cargar los niños
  async loadChildren() {
    this.isLoading = true;
    this.errorMsg = '';

    this.childService.getMyChildren().subscribe({
      next: (data) => {
        this.children = data;
        this.isLoading = false;
      },
      error: async (error) => {
        this.isLoading = false;
        this.errorMsg = 'Error al cargar los niños.';

        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudieron cargar los datos. Intenta más tarde.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  // Función para regresar a la página parent-panel
  goBack() {
    this.router.navigate(['/parent-panel']);
  }

  // Función para el pull-to-refresh
  async doRefresh(event: any) {
    try {
      this.errorMsg = '';
      
      this.childService.getMyChildren().subscribe({
        next: (data) => {
          this.children = data;
          event.target.complete();
        },
        error: async (error) => {
          this.errorMsg = 'Error al actualizar los datos.';
          event.target.complete();
          
          const alert = await this.alertCtrl.create({
            header: 'Error',
            message: 'No se pudieron actualizar los datos. Intenta más tarde.',
            buttons: ['OK']
          });
          await alert.present();
        }
      });
    } catch (error) {
      event.target.complete();
      this.errorMsg = 'Error inesperado al actualizar.';
    }
  }

  // Función para obtener las iniciales del nombre
  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  }

  // Función para formatear la fecha de nacimiento
  formatBirthDate(day: number, month: number, year: number): string {
    const dayStr = day.toString().padStart(2, '0');
    const monthStr = month.toString().padStart(2, '0');
    return `${dayStr}/${monthStr}/${year}`;
  }

  // Función para calcular la edad
  calculateAge(day: number, month: number, year: number): number {
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
    
  }
  goToMedicalInfo(childId: number) {
    console.log('Clicked medical info:', childId);
  this.router.navigate(['/medical-info', childId]);
  }

  goToMedicalForm(childId: number) {
     console.log('Clicked medical form:', childId);
    this.router.navigate(['/medical-form', childId]);
  }

  // Función para mostrar detalles del niño (opcional)
  async showChildDetails(child: any) {
    const age = this.calculateAge(child.birth_day, child.birth_month, child.birth_year);
    
    const alert = await this.alertCtrl.create({
      header: `${child.first_name} ${child.last_name}`,
      message: `
        <strong>Edad:</strong> ${age} años<br>
        <strong>Género:</strong> ${child.gender}<br>
        <strong>Fecha de nacimiento:</strong> ${this.formatBirthDate(child.birth_day, child.birth_month, child.birth_year)}<br>      `,
      buttons: ['Cerrar']
    });
    
    await alert.present();
  }

  // Función para manejar errores de forma centralizada
  private async handleError(message: string, error?: any) {
    console.error('Error en ChildProfilePage:', error);
    
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    
    await alert.present();
  }
  
}