import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { firstValueFrom } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

import { ResetPasswordPage } from '../reset-password/reset-password.page';

interface LoginResponse {
  token: string;
  usuario: { id: number; nombre: string; correo: string; rol: string };
}

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule
  ],
})
export class LoginPage {
  correo = '';
  password = '';

  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  /** Inicia sesión */
  async onLogin() {
    if (!this.correo.trim() || !this.password.trim()) {
      this.mostrarMensajeError('⚠️ Please fill in all fields', 'warning');
      return;
    }

    try {
      console.log('🔍 Enviando solicitud con:', { correo: this.correo, password: this.password });

      const res: LoginResponse | null = await firstValueFrom(
        this.authService.login(this.correo, this.password)
      );

      console.log('✅ Respuesta del backend recibida:', res);

      if (res?.token && res.usuario) {
        console.log('📌 Rol recibido:', res.usuario.rol);

        await this.mostrarMensajeExito(`🎉 Welcome back, ${res.usuario.nombre}!`);

        // Cerrar modal y redirigir
        await this.cerrarModalYRedirigir(res.usuario.rol);
      } else {
        await this.mostrarMensajeError('🔐 Invalid email or password. Please try again.', 'danger');
      }
    } catch (err: any) {
      console.error('❌ Error de login:', err);
      const errorMessage = this.obtenerMensajeError(err);
      await this.mostrarMensajeError(errorMessage, 'danger');
    }
  }

  /** Cierra el modal y redirige según el rol */
  private async cerrarModalYRedirigir(rol: string) {
    const top = await this.modalCtrl.getTop();
    if (top) {
      await this.modalCtrl.dismiss(null, 'success');
    }

    let target = '/home';
    if (rol === 'admin' || rol === 'staff') {
      target = '/admin-dashboard';
    } else {
      target = '/parent-panel';
    }

    console.log(`➡ Redirigiendo a ${target}...`);
    this.router.navigate([target]);
  }

  /** Recuperar contraseña */
  async recuperarCuenta() {
    const modal = await this.modalCtrl.create({
      component: ResetPasswordPage,
    });
    await modal.present();
  }

  /** Regresa al home (botón cancelar) */
  async volverInicio() {
    const top = await this.modalCtrl.getTop();
    if (top) {
      await this.modalCtrl.dismiss(null, 'cancel');
    }
    this.router.navigate(['/home']);
  }

  /** Determina el mensaje de error */
  private obtenerMensajeError(err: any): string {
    if (err.status === 401) return '🚫 Access denied. Check your credentials.';
    if (err.status === 404) return '👤 Account not found.';
    if (err.status === 500) return '⚡ Server error. Try again later.';
    if (err.status === 0) return '🌐 Connection failed. Check your internet.';
    return err?.error?.error || err?.error?.message || '🔧 Something went wrong.';
  }

  /** Toast de éxito */
  private async mostrarMensajeExito(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: 'success',
      position: 'bottom',
      cssClass: 'custom-toast-success',
      buttons: [
        {
          side: 'end',
          icon: 'checkmark-circle',
          handler: () => console.log('Success toast dismissed'),
        },
      ],
    });
    await toast.present();
  }

  /** Toast de error */
  private async mostrarMensajeError(msg: string, color: 'danger' | 'warning' = 'danger') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 4000,
      color,
      position: 'bottom',
      cssClass: `custom-toast-${color}`,
      buttons: [
        {
          side: 'end',
          icon: color === 'danger' ? 'close-circle' : 'alert-circle',
          handler: () => console.log('Error toast dismissed'),
        },
      ],
    });
    await toast.present();
  }
}
