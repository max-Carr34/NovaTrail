import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, NavController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-add-timeline-form',
  standalone: true,
  templateUrl: './add-timeline-form.page.html',
  styleUrls: ['./add-timeline-form.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AddTimelineFormPage implements OnInit {
  private http = inject(HttpClient);
  private toastCtrl = inject(ToastController);
  private navCtrl = inject(NavController);
  private loadingCtrl = inject(LoadingController);
  private route = inject(ActivatedRoute);

  childId!: number;

  title: string = '';
  description: string = '';
  event_date: string = '';

  isSubmitting = false;

  apiUrl = 'http://localhost:3000/api/timeline';

  ngOnInit() {
    this.childId = Number(this.route.snapshot.paramMap.get('id'));
    console.log(`Accediendo a timeline del niño con ID: ${this.childId}`);
  }

  async submit() {
    if (!this.title.trim() || !this.description.trim() || !this.event_date) {
      this.showToast('Por favor completa todos los campos obligatorios.');
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: 'Guardando evento...'
    });
    await loading.present();

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const body = {
      child_id: this.childId,
      title: this.title,
      description: this.description,
      event_date: this.event_date,
      // icon: removido porque el backend no lo acepta
    };

    this.http.post(this.apiUrl, body, { headers }).subscribe({
      next: async () => {
        await loading.dismiss();
        this.showToast('Evento agregado correctamente.');
        this.navCtrl.back();
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Error guardando evento:', err);
        this.showToast('Error al guardar el evento. Intenta de nuevo.');
        this.isSubmitting = false;
      }
    });
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom'
    });
    await toast.present();
  }
}

