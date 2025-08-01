import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Browser } from '@capacitor/browser';

// 🔄 NUEVO: Ionicons
import { addIcons } from 'ionicons';
import {
  logoFacebook,
  logoInstagram,
  logoTiktok,
  logoYoutube,
  logoWhatsapp,
  logoTwitter,
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, HttpClientModule],
})
export class HomePage {
  constructor(private modalCtrl: ModalController, private router: Router) {
    addIcons({
      logoFacebook,
      logoInstagram,
      logoTiktok,
      logoYoutube,
      logoWhatsapp,
      logoTwitter,
    });
  }

  async abrirRegistro() {
    try {
      const { RegistroPage } = await import('../registro/registro.page');
      const modal = await this.modalCtrl.create({
        component: RegistroPage,
        cssClass: 'registro-modal',
        backdropDismiss: true,
      });
      await modal.present();
    } catch (error) {
      console.error('❌ Error al abrir el registro:', error);
    }
  }

  async abrirLogin() {
    try {
      console.log('✅ abrirLogin() fue llamado');
      const { LoginPage } = await import('../login/login.page');
      const modal = await this.modalCtrl.create({
        component: LoginPage,
        cssClass: 'login-modal',
        backdropDismiss: true,
      });
      await modal.present();
    } catch (error) {
      console.error('❌ Error al abrir el login:', error);
    }
  }

  // 🔗 Método para abrir redes sociales
  async openSocialMedia(platform: string) {
    let url = '';
    switch (platform) {
      case 'facebook':
        url = 'https://www.facebook.com/NovaTrailGlobalNetwork/';
        break;
      case 'instagram':
        url = 'https://www.instagram.com/novatrail_globalnet/';
        break;
      case 'tiktok':
        url = 'https://www.tiktok.com/@odccampmexico';
        break;
      case 'youtube':
        url = 'https://www.youtube.com/@OdysseyInternationalCampMexico';
        break;
      case 'whatsapp':
        url = 'https://wa.me/1234567890?text=Hola,%20me%20interesa%20información%20sobre%20el%20campamento';
        break;
      case 'twitter':
        url = 'https://twitter.com/tu-campamento';
        break;
      case 'email':
        url = 'mailto:contactocampamento.com?subject=Consulta%20sobre%20campamento';
        break;
      case 'phone':
        url = 'tel:+1234567890';
        break;
      default:
        console.warn('⚠️ Plataforma no reconocida:', platform);
        return;
    }

    try {
      console.log('🔗 Abriendo enlace:', url);
      if (platform === 'email' || platform === 'phone') {
        window.open(url, '_self');
      } else {
        await Browser.open({
          url,
          windowName: '_blank',
          toolbarColor: '#1976d2',
          presentationStyle: 'popover',
        });
      }
    } catch (error) {
      console.error('❌ Error al abrir enlace:', error);
      window.open(url, '_blank');
    }
  }

  // 📱 Método específico para WhatsApp (alternativo)
  async contactarWhatsApp() {
    const phoneNumber = '1234567890';
    const message = 'Hola, me interesa información sobre el campamento';
    const encodedMessage = encodeURIComponent(message);

    try {
      await Browser.open({ url: `https://wa.me/${phoneNumber}?text=${encodedMessage}` });
    } catch (error) {
      console.error('❌ Error al abrir WhatsApp:', error);
      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    }
  }

  // 📧 Método para abrir email
  async enviarEmail() {
    const email = 'contactocampamento.com';
    const subject = 'Consulta sobre campamento';
    const body = 'Hola, me gustaría obtener más información sobre el campamento.';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      window.open(mailtoUrl, '_self');
    } catch (error) {
      console.error('❌ Error al abrir email:', error);
    }
  }

  // 📞 Método para llamar por teléfono
  async llamarTelefono() {
    const phoneNumber = '+1234567890';
    try {
      window.open(`tel:${phoneNumber}`, '_self');
    } catch (error) {
      console.error('❌ Error al abrir teléfono:', error);
    }
  }
}
