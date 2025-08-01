import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, IonContent, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'app-communication-detail',
  templateUrl: './communication-detail.page.html',
  styleUrls: ['./communication-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class CommunicationDetailPage implements OnInit {
  receiverId!: number;
  messages: any[] = [];
  newMessage = '';
  loading = false;
  errorMsg = '';

  myUserId!: number;
  currentUserRole = '';
  usersInfo: { [key: number]: { nombre: string; correo: string; rol: string } } = {};

  @ViewChild(IonContent) private ionContent!: IonContent;  // Cambiado a IonContent

  constructor(
    private route: ActivatedRoute,
    private commService: CommunicationService,
    private alertController: AlertController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.receiverId = Number(this.route.snapshot.paramMap.get('id'));

    const usuario = localStorage.getItem('usuario') ? JSON.parse(localStorage.getItem('usuario')!) : null;
    if (usuario && usuario.id && usuario.rol) {
      this.myUserId = usuario.id;
      this.currentUserRole = usuario.rol;
    } else {
      this.errorMsg = 'Error: No se pudo cargar la sesión. Inicia sesión nuevamente.';
      return;
    }

    this.route.queryParams.subscribe(params => {
      if (params['reply']) {
        this.newMessage = `Respuesta a: "${params['reply']}" `;
      }
    });

    this.loadUsersInfo();
    this.loadMessages();
  }

  goBack() {
    this.navCtrl.back();
  }

  loadMessages() {
    this.loading = true;
    this.errorMsg = '';

    this.commService.getConversation(this.receiverId).subscribe({
      next: (res: any[]) => {
        this.messages = res;
        this.loading = false;
        this.scrollToBottom();
      },
      error: (err: any) => {
        console.error('Error cargando mensajes:', err);
        this.errorMsg = 'No se pudieron cargar los mensajes';
        this.loading = false;
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const payload = {
      receiver_id: this.receiverId,
      content: this.newMessage
    };

    this.commService.sendMessage(payload).subscribe({
      next: () => {
        this.messages.push({
          id: Date.now(),
          sender_id: this.myUserId,
          content: this.newMessage,
          created_at: new Date()
        });
        this.newMessage = '';
        this.scrollToBottom();
      },
      error: (err: any) => {
        console.error('Error enviando mensaje:', err);
        alert('Error al enviar el mensaje');
      }
    });
  }

  async confirmDelete(messageId: number) {
    const alert = await this.alertController.create({
      header: '¿Eliminar mensaje?',
      message: 'Esta acción no se puede deshacer. El mensaje será eliminado permanentemente.',
      cssClass: 'custom-delete-alert',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Eliminar',
          cssClass: 'alert-button-delete',
          handler: () => this.deleteMessage(messageId)
        }
      ]
    });

    await alert.present();
  }

  deleteMessage(messageId: number) {
    this.commService.deleteMessage(messageId).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m.id !== messageId);
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('Error eliminando mensaje:', err);
        alert('No se pudo eliminar el mensaje');
      }
    });
  }

  loadUsersInfo() {
    this.commService.getUsers().subscribe({
      next: (res) => {
        [...res.admins, ...res.staff].forEach(user => {
          this.usersInfo[user.id] = {
            nombre: user.nombre,
            correo: user.correo || '',
            rol: user.rol
          };
        });
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
      }
    });
  }

  shouldShowSenderEmail(): boolean {
    return this.currentUserRole === 'admin' || this.currentUserRole === 'staff';
  }

  getSenderEmail(senderId: number): string {
    return this.usersInfo[senderId]?.correo || '';
  }

  cancelReply() {
    this.newMessage = '';
  }

  onEnterPress(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
  }

  redirectToChat(eventTitle: string, staffId: number) {
    const replyText = encodeURIComponent(eventTitle);
    this.navCtrl.navigateForward(`/communication-detail/${staffId}?reply=${replyText}`);
  }

  private async scrollToBottom() {
    try {
      await this.ionContent.scrollToBottom(300);
    } catch (err) {
      console.warn('Scroll to bottom error:', err);
    }
  }

  trackByMsgId(index: number, item: any): number {
    return item.id;
  }
}
