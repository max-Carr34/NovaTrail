import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ParentService } from '../services/parent.service';
import { ChildService } from '../services/child.service';
import { CommunicationService } from '../services/communication.service';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-communication-panel',
  templateUrl: './communication-panel.page.html',
  styleUrls: ['./communication-panel.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class CommunicationPanelPage {
  private parentService = inject(ParentService);
  private childService = inject(ChildService);
  private communicationService = inject(CommunicationService);
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  parents: any[] = [];
  admins: any[] = [];
  staff: any[] = [];
  childrenCountMap: { [key: number]: number } = {};
  loading = false;
  errorMsg = '';
  userRole = localStorage.getItem('role') || '';

  // ✅ Search
  private searchTermChanged: Subject<string> = new Subject<string>();
  _searchTerm = '';

  constructor() {
    // Configurar la búsqueda con debounce
    this.searchTermChanged.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this._searchTerm = term.toLowerCase();
    });
  }

  get searchTerm(): string {
    return this._searchTerm;
  }

  set searchTerm(value: string) {
    this.searchTermChanged.next(value);
  }

  async ionViewWillEnter() {
    this.loading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Cargando usuarios...',
    });
    await loading.present();

    try {
      this.parentService.getAllParents().subscribe({
        next: async (data) => {
          this.parents = data;
          this.childrenCountMap = {};
          await Promise.all(
            this.parents.map((parent) => this.loadChildrenCount(parent.id))
          );
        },
        error: () => {
          this.parents = [];
        },
      });

      if (this.userRole === 'admin' || this.userRole === 'staff') {
        this.communicationService.getUsers().subscribe({
          next: (data) => {
            this.admins = data.admins;
            this.staff = data.staff;
          },
          error: () => {
            this.admins = [];
            this.staff = [];
          },
        });
      }
    } catch (error) {
      console.error(error);
      this.showError('Error al cargar datos.');
    } finally {
      this.loading = false;
      await loading.dismiss();
    }
  }

  async loadChildrenCount(parentId: number): Promise<void> {
    return new Promise((resolve) => {
      this.childService.getChildrenByParentId(parentId).subscribe({
        next: (children) => {
          this.childrenCountMap[parentId] = children.length;
          resolve();
        },
        error: () => {
          this.childrenCountMap[parentId] = 0;
          resolve();
        },
      });
    });
  }

  // ✅ Filtrados
  get filteredParents() {
    return this.parents.filter(parent =>
      parent.nombre?.toLowerCase().includes(this._searchTerm) ||
      parent.correo?.toLowerCase().includes(this._searchTerm)
    );
  }

  get filteredAdmins() {
    return this.admins.filter(admin =>
      admin.nombre?.toLowerCase().includes(this._searchTerm)
    );
  }

  get filteredStaff() {
    return this.staff.filter(st =>
      st.nombre?.toLowerCase().includes(this._searchTerm)
    );
  }

  openChat(userId: number) {
    this.router.navigate(['/communication-detail', userId]);
  }

  goBack() {
    this.navCtrl.back();
  }

  private async showError(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
