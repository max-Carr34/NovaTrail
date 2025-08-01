import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private apiUrl = 'http://localhost:3000/api/timeline';

  constructor(private http: HttpClient) {}

  // Método privado para generar los headers con el token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener eventos de un niño (padres, admin y staff)
  getTimeline(childId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${childId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Obtener lista de niños (SOLO admin o staff)
  getChildrenList(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  // Agregar un evento
  addTimelineEvent(eventData: any): Observable<any> {
    return this.http.post(this.apiUrl, eventData, {
      headers: this.getAuthHeaders()
    });
  }
}
