import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, NavController, AlertController, LoadingController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { ChildService } from '../services/child.service';
import { firstValueFrom } from 'rxjs';

addIcons(allIcons);

@Component({
  selector: 'app-child-registration',
  templateUrl: './child-registration.page.html',
  styleUrls: ['./child-registration.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class ChildRegistrationPage implements OnInit {
  childForm: FormGroup;
  birthDay!: number;
  birthMonth!: number;
  birthYear!: number;
  showHelpAlert = false;

  days = Array.from({ length: 31 }, (_, i) => i + 1);
  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];
  years = Array.from({ length: new Date().getFullYear() - 2000 + 1 }, (_, i) => 2000 + i);

  childId: number | null = null;
  isEditMode = false;
  currentWordCount = 0;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private childService: ChildService,
    private route: ActivatedRoute
  ) {
    this.childForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      gender: ['', Validators.required],
      notes: [''],
      parentName: ['', Validators.required],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(\(\d{3}\)\s?|\d{3}[-\s]?)\d{3}[-\s]?\d{4}$/)
        ]
      ]
    });
  }

  ngOnInit(): void {
    this.childId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.childId) {
      this.isEditMode = true;
      this.loadChildData(this.childId);
    }
  }

  private async loadChildData(id: number) {
    const loading = await this.loadingCtrl.create({ message: 'Loading child data...' });
    await loading.present();

    this.childService.getChildById(id).subscribe({
      next: (child) => {
        this.childForm.patchValue({
          firstName: child.first_name,
          lastName: child.last_name,
          gender: child.gender,
          notes: child.notes || '',
          parentName: child.parent_name,
          phoneNumber: child.phone_number
        });

        this.birthDay = child.birth_day;
        this.birthMonth = child.birth_month;
        this.birthYear = child.birth_year;

        loading.dismiss();
      },
      error: async () => {
        loading.dismiss();
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Could not load child data.',
          buttons: ['OK']
        });
        await alert.present();
        this.navCtrl.back();
      }
    });
  }

  onNotesInput(event: any) {
    const input = event.detail.value || '';
    const words = input.trim().split(/\s+/).filter((word: string) => word.length > 0);
    this.currentWordCount = words.length;

    if (this.currentWordCount > 25) {
      const limitedText = words.slice(0, 25).join(' ');
      this.childForm.get('notes')?.setValue(limitedText);
      this.currentWordCount = 25;
    }
  }

  selectGender(gender: string) {
    this.childForm.patchValue({ gender });
  }

  goBack() {
    this.navCtrl.back();
  }

 async submitForm() {
  if (this.childForm.valid && this.birthDay && this.birthMonth && this.birthYear) {
    const loading = await this.loadingCtrl.create({
      message: this.isEditMode ? 'Updating child...' : 'Registering...'
    });
    await loading.present();

    const formData: any = {
      firstName: this.childForm.value.firstName,
      lastName: this.childForm.value.lastName,
      gender: this.childForm.value.gender,
      birthDay: this.birthDay,
      birthMonth: this.birthMonth,
      birthYear: this.birthYear,
      phoneNumber: this.childForm.value.phoneNumber,
      notes: this.childForm.value.notes || ''
    };

    if (!this.isEditMode) {
      formData.parentName = this.childForm.value.parentName;
    }

    try {
      if (this.isEditMode && this.childId) {
        await firstValueFrom(this.childService.updateChild(this.childId, formData));
      } else {
        await firstValueFrom(this.childService.createChild(formData));
      }

      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: this.isEditMode ? '✅ Child Updated!' : '✅ Registration Successful!',
        message: this.isEditMode
          ? 'The child information has been updated successfully.'
          : 'The child has been registered successfully in the system.',
        buttons: ['OK']
      });
      await alert.present();

      this.navCtrl.back();
    } catch (error) {
      await loading.dismiss();
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Something went wrong. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
    }
  } else {
    this.markFormGroupTouched();
  }
}


  private markFormGroupTouched() {
    Object.keys(this.childForm.controls).forEach(key => {
      const control = this.childForm.get(key);
      control?.markAsTouched();
    });
  }

  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.childForm.get(fieldName);
    if (!field) return false;
    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.childForm.get(fieldName);
    if (field?.hasError('required')) {
      if (fieldName === 'phoneNumber') return 'Phone number is required';
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (field?.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;
      return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
    }
    if (fieldName === 'phoneNumber' && field?.hasError('pattern')) {
      return 'Invalid phone number (e.g. 123-456-7890)';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      gender: 'Gender',
      notes: 'Notes',
      parentName: 'Parent name',
      phoneNumber: 'Phone number'
    };
    return fieldNames[fieldName] || fieldName;
  }
}
