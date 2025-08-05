import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 

@Injectable({ providedIn: 'root' })
export class CommunicationService {
  private readonly apiUrl = `${environment.apiUrl}/messages`; // ✅ URL base

  constructor(private http: HttpClient) {}

  /** ✅ Generar encabezados con token */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /** ✅ Obtener lista de admins y staff */
  getUsers(): Observable<{ admins: any[]; staff: any[] }> {
    return this.http.get<{ admins: any[]; staff: any[] }>(
      `${this.apiUrl}/users`,
      { headers: this.getAuthHeaders() }
    );
  }

  /** ✅ Obtener conversación con un usuario */
  getConversation(userId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/conversation/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /** ✅ Enviar mensaje */
  sendMessage(data: { receiver_id: number; content: string; child_id?: number; event_id?: number }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/send`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }

  /** ✅ Obtener cantidad de mensajes no leídos */
  getUnread(): Observable<{ unread_count: number }> {
    return this.http.get<{ unread_count: number }>(
      `${this.apiUrl}/unread`,
      { headers: this.getAuthHeaders() }
    );
  }

  /** ✅ Marcar mensaje como leído */
  markAsRead(messageId: number): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/read/${messageId}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  /** ✅ Eliminar mensaje */
  deleteMessage(messageId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/delete/${messageId}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
