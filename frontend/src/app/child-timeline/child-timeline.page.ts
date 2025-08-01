import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-child-timeline',
  standalone: true,
  templateUrl: './child-timeline.page.html',
  styleUrls: ['./child-timeline.page.scss'],
  imports: [CommonModule, IonicModule]
})
export class ChildTimelinePage implements OnInit {
  private http = inject(HttpClient);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private navCtrl = inject(NavController);
  private route = inject(ActivatedRoute);

  childId!: number;
  events: any[] = [];
  isLoading = false;
  errorMessage = '';

  private apiUrl = 'http://localhost:3000/api/timeline';

  ngOnInit() {
    this.childId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTimeline();
  }

  /** ✅ Cargar eventos */
  async loadTimeline() {
    this.isLoading = true;
    this.errorMessage = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>(`${this.apiUrl}/${this.childId}`, { headers }).subscribe({
      next: (data) => {
        this.events = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando timeline:', err);
        this.errorMessage = this.getErrorMessage(err);
        this.isLoading = false;
      }
    });
  }

  /** ✅ Redirigir al chat con el creador */
  redirectToChat(event: any) {
    const receiverId = event.creator_id;
    if (!receiverId) {
      console.error('Evento sin creator_id');
      return;
    }
    const replyText = encodeURIComponent(event.title);
    this.navCtrl.navigateForward(`/communication-detail/${receiverId}?reply=${replyText}`);
  }

  /** ✅ Retry */
  retryLoad() {
    this.loadTimeline();
  }
  goBack() {
  this.navCtrl.back();
}


  /** ✅ Mensaje de error */
  private getErrorMessage(error: any): string {
    if (error.status === 401) return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    if (error.status === 403) return 'No tienes permisos para acceder a esta información.';
    if (error.status === 404) return 'No se encontraron eventos.';
    if (error.status === 0) return 'Error de conexión. Verifica tu conexión a internet.';
    return 'Error al cargar la línea de tiempo. Inténtalo de nuevo.';
  }
}
