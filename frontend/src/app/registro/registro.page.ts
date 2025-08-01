import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule,
    RouterModule 
  ]
})
export class RegistroPage {
  usuario = {
    nombre: '',
    correo: '',
    password: ''
  };

  API_URL = 'http://localhost:3000/api/usuarios';

  constructor(
    private http: HttpClient,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async registrarUsuario() {
    // Validación de datos antes de enviar
    if (!this.usuario.nombre || !this.usuario.correo || !this.usuario.password) {
      const toast = await this.toastCtrl.create({
        message: 'Todos los campos son obligatorios',
        duration: 3000,
        color: 'warning'
      });
      return toast.present();
    }

    console.log('Datos a enviar:', this.usuario); // 🔍 Depuración de datos

    this.http.post(this.API_URL, this.usuario).subscribe({
      next: async (response) => {
        console.log('Registro exitoso:', response);

        const toast = await this.toastCtrl.create({
          message: 'Registro exitoso 🎉',
          duration: 2000,
          color: 'success'
        });
        toast.present();

        const top = await this.modalCtrl.getTop();
        if (top) {
          this.modalCtrl.dismiss();
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: async (err) => {
        console.error('Error al registrar:', err);

        const toast = await this.toastCtrl.create({
          message: 'Error al registrar: ' + (err.error?.message || err.message),
          duration: 3000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }

  async volverInicio() {
    const top = await this.modalCtrl.getTop();
    if (top) {
      this.modalCtrl.dismiss();
    } else {
      this.router.navigate(['/home']);
    }
  }
}
