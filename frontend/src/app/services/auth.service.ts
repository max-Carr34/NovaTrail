import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, tap } from 'rxjs';
import { of } from 'rxjs';
import { environment } from '../../environments/environment'; // ✅ Línea agregada para usar la URL del environment

interface LoginResponse {
  token: string;
  usuario: { id: number; nombre: string; correo: string; rol: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl; // ✅ Línea modificada: ahora usa la URL dinámica del environment
  private http = inject(HttpClient);
  private router = inject(Router);

  /** ✅ Rol reactivo */
  private roleSubject = new BehaviorSubject<string | null>(this.getUserRole());
  role$ = this.roleSubject.asObservable();

  /** ✅ Headers */
  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return new HttpHeaders(headers);
  }

  /** ✅ Iniciar sesión */
  login(correo: string, password: string) {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      { correo, password },
      { headers: this.getHeaders() }
    ).pipe(
      tap(res => {
        if (res?.token) {
          this.saveToken(res.token);
          this.saveUser(res.usuario);
          this.roleSubject.next(res.usuario.rol.trim().toLowerCase()); // ✅ Actualizamos rol reactivo
        }
      }),
      catchError(err => {
        console.error('❌ Error en login:', err);
        return of(null);
      })
    );
  }

  saveToken(token: string) {
    if (token) localStorage.setItem('token', token);
  }

  saveUser(usuario: any) {
    if (usuario && usuario.rol) {
      usuario.rol = usuario.rol.trim().toLowerCase();
      localStorage.setItem('usuario', JSON.stringify(usuario));
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any | null {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  }

  getUserId(): number | null {
    return this.getUser()?.id || null;
  }

  getUserRole(): string | null {
    return this.getUser()?.rol?.trim().toLowerCase() || null;
  }

  /** ✅ Roles helpers */
  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }
  isStaff(): boolean {
    return this.getUserRole() === 'staff';
  }
  isParent(): boolean {
    return this.getUserRole() === 'parent';
  }

  hasRole(roles: string[]): boolean {
    const userRole = this.getUserRole() || '';
    return roles.some(role => role.trim().toLowerCase() === userRole);
  }

  /** ✅ Logout */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.roleSubject.next(null); // ✅ Reset rol reactivo
    this.router.navigate(['/home']);
  }

  /** ✅ Otros métodos */
  getChildById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/children/${id}`, { headers: this.getHeaders() });
  }

  updateChild(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/children/${id}`, data, { headers: this.getHeaders() });
  }

  forgotPassword(correo: string) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/request-reset-password`,
      { correo },
      { headers: this.getHeaders() }
    );
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/reset-password`,
      { token, newPassword },
      { headers: this.getHeaders() }
    );
  }
}
