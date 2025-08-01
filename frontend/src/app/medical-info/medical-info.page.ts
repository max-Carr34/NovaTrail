import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { MedicalRecordService } from '../services/medical-records.service';
import { ChildService } from '../services/child.service';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

// Registrar todos los íconos
addIcons(allIcons);

@Component({
  selector: 'app-medical-info',
  standalone: true,
  templateUrl: './medical-info.page.html',
  styleUrls: ['./medical-info.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule]
})
export class MedicalInfoPage implements OnInit {
  private route = inject(ActivatedRoute);
  private medicalService = inject(MedicalRecordService);
  private childService = inject(ChildService);
  private router = inject(Router);

  children: any[] = [];
  selectedChildId: number | null = null;
  record: any = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      const parsedId = Number(paramId);
      if (!isNaN(parsedId)) {
        this.selectedChildId = parsedId;
        this.loadMedicalRecord(parsedId);
      } else {
        this.errorMessage = 'ID de niño inválido.';
        this.isLoading = false;
      }
    } else {
      this.loadChildrenAndRecord();
    }
  }

  loadChildrenAndRecord() {
    const usuarioStr = localStorage.getItem('usuario');
    const rol = usuarioStr ? JSON.parse(usuarioStr).rol : null;

    if (rol === 'admin' || rol === 'staff') {
      this.childService.getAllChildren().subscribe({
        next: (children) => {
          this.children = children;
          if (children.length > 0) {
            this.selectedChildId = children[0].id;
            this.loadMedicalRecord(this.selectedChildId!);
          } else {
            this.errorMessage = 'No hay niños registrados.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.errorMessage = 'Error al obtener la lista de niños.';
          this.isLoading = false;
          console.error(err);
        }
      });
    } else {
      this.childService.getMyChildren().subscribe({
        next: (children) => {
          this.children = children;
          if (children.length > 0) {
            this.selectedChildId = children[0].id;
            this.loadMedicalRecord(this.selectedChildId!);
          } else {
            this.errorMessage = 'No tienes niños registrados.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.errorMessage = 'Error al obtener los datos del niño.';
          this.isLoading = false;
          console.error(err);
        }
      });
    }
  }

  loadMedicalRecord(childId: number) {
    if (typeof childId !== 'number' || isNaN(childId)) return;

    this.isLoading = true;
    this.medicalService.getByChildId(childId).subscribe({
      next: (record) => {
        this.record = record;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'No se pudo cargar el expediente médico.';
        this.record = null;
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onChildChange(event: any) {
    const newId = Number(event.detail.value);
    if (!isNaN(newId)) {
      this.selectedChildId = newId;
      this.loadMedicalRecord(newId);
    }
  }

  goBack() {
    const usuarioStr = localStorage.getItem('usuario');
    const rol = usuarioStr ? JSON.parse(usuarioStr).rol : null;

    if (rol === 'admin' || rol === 'staff') {
      this.router.navigate(['/medical-records']);
    } else {
      this.router.navigate(['/child-profile']);
    }
  }

  goToEdit() {
    if (this.selectedChildId !== null) {
      this.router.navigate(['/medical-form', this.selectedChildId]);
    }
  }

  canEdit(): boolean {
    const usuarioStr = localStorage.getItem('usuario');
    const rol = usuarioStr ? JSON.parse(usuarioStr).rol : null;

    return rol === 'admin' || rol === 'staff' || this.hasAnyMedicalInfo();
  }

  hasAnyMedicalInfo(): boolean {
    if (!this.record) return false;

    return (
      this.record.has_disability ||
      this.record.requires_treatment ||
      (this.record.current_medications && this.record.current_medications.trim() !== '') ||
      this.record.was_hospitalized ||
      this.record.ambulance_transport ||
      this.record.surgery_recommended ||
      this.record.psychological_treatment ||
      this.record.recent_medical_consult ||
      (this.record.recent_conditions && this.record.recent_conditions.trim() !== '') ||
      (this.record.known_allergies && this.record.known_allergies.trim() !== '') ||
      this.record.medication_allergies ||
      this.record.physical_limitations ||
      (this.record.other_conditions && this.record.other_conditions.trim() !== '') ||
      this.record.has_seizures
    );
  }
}