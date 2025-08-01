import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MedicalRecordService } from '../services/medical-records.service';
import { Router } from '@angular/router';
import { HasRoleDirective } from '../directives/has-role.directive';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

addIcons(allIcons);

@Component({
  selector: 'app-medical-records',
  standalone: true,
  templateUrl: './medical-records.page.html',
  styleUrls: ['./medical-records.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HasRoleDirective
  ],
  providers: [DatePipe]
})
export class MedicalRecordsPage implements OnInit {
  private medicalService = inject(MedicalRecordService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  records: any[] = [];
  _searchTerm = '';
  isLoading = true;
  errorMessage = '';

  private searchTermChanged: Subject<string> = new Subject<string>();

  ngOnInit() {
    this.loadRecords();

    this.searchTermChanged.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this._searchTerm = searchTerm;
    });
  }

  goBack(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  get searchTerm(): string {
    return this._searchTerm;
  }

  set searchTerm(value: string) {
    this.searchTermChanged.next(value);
  }

  private loadRecords() {
    this.isLoading = true;
    this.errorMessage = '';

    this.medicalService.getAll().subscribe({
      next: (res) => {
        this.records = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando expedientes médicos:', err);
        this.errorMessage = 'Ocurrió un error al cargar los expedientes médicos. Por favor, intente de nuevo.';
        this.isLoading = false;
      }
    });
  }

  retryLoad() {
    this.loadRecords();
  }

  get filteredRecords() {
    return this.records.filter(record =>
      record.childName?.toLowerCase().includes(this._searchTerm.toLowerCase()) ||
      record.parentName?.toLowerCase().includes(this._searchTerm.toLowerCase())
    );
  }

  goToDetail(childId: number) {
    this.router.navigate(['/medical-info', childId]);
  }

  async deleteRecord(childId: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Seguro que quieres eliminar este expediente médico?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.medicalService.deleteByChildId(childId).subscribe({
              next: () => {
                this.records = this.records.filter(r => r.child_id !== childId);
                this.showToast('Expediente médico eliminado');
              },
              error: err => {
                console.error('Error al eliminar:', err);
                this.showToast('Error al eliminar expediente médico');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  trackById(index: number, item: any) {
    return item.child_id;
  }
}
