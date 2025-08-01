import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private apiUrl = 'http://localhost:3000/api/alerts';

  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** ✅ Obtiene encabezados con token */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /** ✅ Cargar notificaciones del usuario (padre o admin) */
  loadNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-alerts`, { headers: this.getHeaders() }).pipe(
      tap((data) => this.notificationsSubject.next(data)),
      catchError((error) => {
        console.error('Error loading notifications:', error);
        throw error;
      })
    );
  }

  /** ✅ Crear notificación (solo admin) */
  createNotification(alertData: { child_id?: number; user_id?: number; type: string; message: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, alertData, { headers: this.getHeaders() }).pipe(
      tap((newAlert) => {
        const current = this.notificationsSubject.getValue();
        this.notificationsSubject.next([newAlert, ...current]);
      }),
      catchError((error) => {
        console.error('Error creating notification:', error);
        throw error;
      })
    );
  }

  /** ✅ Obtener lista actual sin esperar API */
  getCurrentNotifications(): any[] {
    return this.notificationsSubject.getValue();
  }
}
