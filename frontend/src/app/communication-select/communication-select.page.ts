import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { CommunicationService } from '../services/communication.service';
import { Router } from '@angular/router';

interface User {
  id: number;
  nombre: string;
  rol: string;
}

@Component({
  selector: 'app-communication-select',
  templateUrl: './communication-select.page.html',
  styleUrls: ['./communication-select.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CommunicationSelectPage implements OnInit {
  admins: User[] = [];
  staff: User[] = [];
  loading = false;
  errorMsg = '';

  constructor(
    private commService: CommunicationService,
    private router: Router,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  /** ✅ Cargar lista de admins y staff */
  loadUsers() {
    this.loading = true;
    this.errorMsg = '';
    this.commService.getUsers().subscribe({
      next: (res) => {
        this.admins = res.admins ?? [];
        this.staff = res.staff ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando contactos:', err);
        this.errorMsg = 'Error cargando contactos';
        this.loading = false;
      }
    });
  }

  /** ✅ Abrir chat */
  openChat(userId: number) {
    this.router.navigate(['/communication-detail', userId]);
  }

  /** ✅ Volver a la página anterior */
  goBack() {
    this.navCtrl.back(); // ✅ Se corrigió (antes faltaban los paréntesis)
  }
}
