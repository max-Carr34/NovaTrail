import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
  private apiUrl = 'http://localhost:3000/api/medical-records';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Crear expediente médico
  createMedicalRecord(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  // Obtener todos los expedientes (solo admin)
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Obtener expediente por id del niño
  getByChildId(childId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/child/${childId}`, { headers: this.getHeaders() });
  }
  // Eliminar expediente médico por id del niño
  deleteByChildId(childId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/child/${childId}`, { headers: this.getHeaders() });
  }


  // Actualizar expediente por id del niño
  updateByChildId(childId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/child/${childId}`, data, { headers: this.getHeaders() });
  }
}
