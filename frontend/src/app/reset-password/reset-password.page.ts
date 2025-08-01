import { Component } from '@angular/core';
import { ModalController, ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ResetPasswordPage {
  email = '';

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) {}

  /** Método llamado al enviar el formulario */
  async onRecoverPassword() {
    if (!this.email.trim()) {
      this.mostrarToast('⚠️ Enter your Email', 'warning');
      return;
    }

    try {
      await this.authService.forgotPassword(this.email).toPromise();
      await this.mostrarToast('📬 Revisa tu correo para instrucciones', 'success');
      this.cancel(); // cerrar modal
    } catch (err: any) {
      console.error('❌ Error al enviar correo:', err);
      const msg = err?.error?.message || 'Error al enviar el correo. Intenta más tarde.';
      await this.mostrarToast(`❌ ${msg}`, 'danger');
    }
  }

  goBackToLogin() {
    this.modalCtrl.dismiss(); 
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  async mostrarToast(msg: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color,
    });
    await toast.present();
  }
}
