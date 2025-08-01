import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationsService } from '../services/notifications.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss']
})
export class NotificationsPage implements OnInit {
  alerts: any[] = [];
  loading = true;

  private notificationsService = inject(NotificationsService);
  private router = inject(Router);

  ngOnInit() {
    this.notificationsService.loadNotifications().subscribe({
      next: (data: any[]) => {
        this.alerts = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading notifications:', err);
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/parent-panel']);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'registro': return 'document-text-outline';
      case 'medica': return 'medkit-outline';
      case 'comunicacion': return 'chatbubbles-outline';
      case 'login': return 'log-in-outline';
      default: return 'notifications-outline';
    }
  }

  getColor(type: string): string {
    switch (type) {
      case 'registro': return 'primary';
      case 'medica': return 'danger';
      case 'comunicacion': return 'secondary';
      case 'login': return 'tertiary';
      default: return 'medium';
    }
  }

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', '');
  }
}
