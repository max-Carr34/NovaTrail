import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class ChangePasswordPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);

  form!: FormGroup;
  token: string = '';

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }
  cancel(){
    this.router.navigate(['/login']);
  }

  onSubmit() {
    if (this.form.invalid || this.form.value.newPassword !== this.form.value.confirmPassword) {
      alert('Las contraseñas no coinciden o son inválidas.');
      return;
    }

    const payload = {
      token: this.token,
      newPassword: this.form.value.newPassword
    };

    this.http.post('http://localhost:3000/api/reset-password', payload).subscribe({
      next: () => {
        alert('¡Contraseña actualizada con éxito!');
        this.router.navigate(['/login']);
      },
      error: () => {
        alert('Hubo un problema. El token puede estar vencido o inválido.');
      }
    });
  }
}

