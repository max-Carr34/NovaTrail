import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MedicalRecordService } from '../services/medical-records.service';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

addIcons(allIcons);

@Component({
  selector: 'app-medical-form',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './medical-form.page.html',
  styleUrls: ['./medical-form.page.scss']
})
export class MedicalFormPage implements OnInit {
  form!: FormGroup;
  childId!: number;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private medicalService: MedicalRecordService
  ) {}

  ngOnInit() {
    this.childId = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    this.initForm();
    this.loadMedicalRecord();
  }

  initForm() {
    this.form = this.fb.group({
      has_disability: [false],
      disability_description: [''],

      requires_treatment: [false],
      treatment_description: [''],

      current_medications: [''],

      was_hospitalized: [false],
      hospitalization_details: [''],

      ambulance_transport: [false],
      ambulance_details: [''],

      surgery_recommended: [false],
      surgery_details: [''],

      psychological_treatment: [false],

      recent_medical_consult: [false],
      medical_consult_details: [''],

      recent_conditions: [''],

      known_allergies: [''],
      medication_allergies: [false],
      medication_allergies_details: [''],

      physical_limitations: [false],
      physical_limitations_details: [''],

      other_conditions: [''],

      has_seizures: [false],
      seizure_details: ['']
    });
  }

  async loadMedicalRecord() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando...' });
    await loading.present();

    this.medicalService.getByChildId(this.childId).subscribe({
      next: (record) => {
        this.form.patchValue(record);
        this.isEditMode = true;
        loading.dismiss();
      },
      error: () => {
        this.isEditMode = false;
        loading.dismiss();
      }
    });
  }

  async onSubmit() {
    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    const formData = { ...this.form.value, child_id: this.childId };

    const obs = this.isEditMode
      ? this.medicalService.updateByChildId(this.childId, formData)
      : this.medicalService.createMedicalRecord(formData);

    obs.subscribe({
      next: async () => {
        loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Guardado',
          message: 'El expediente ha sido guardado correctamente.',
          buttons: ['OK']
        });
        await alert.present();

        // Navegación según rol
        const rol = localStorage.getItem('rol');
        if (rol === 'admin') {
          this.router.navigate(['/medical-records']);
        } else {
          this.router.navigate(['/medical-info', this.childId]);
        }
      },
      error: async () => {
        loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo guardar el expediente. Intenta más tarde.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
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

  // Ayuda para mostrar campos condicionales en HTML
  get f() {
    return this.form.controls;
  }
}
