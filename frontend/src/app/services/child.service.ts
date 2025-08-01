import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChildService {
  private apiUrl = 'http://localhost:3000/api/children';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllChildren(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers: this.getAuthHeaders() });
  }

  getMyChildren(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-children`, { headers: this.getAuthHeaders() });
  }

  getChildrenByParentId(parentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/by-parent/${parentId}`, { headers: this.getAuthHeaders() });
  }

  getChildById(childId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${childId}`, { headers: this.getAuthHeaders() });
  }

  createChild(childData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, childData, { headers: this.getAuthHeaders() });
  }

  updateChild(childId: number, childData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${childId}`, childData, { headers: this.getAuthHeaders() });
  }

  deleteChild(childId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${childId}`, { headers: this.getAuthHeaders() });
  }
}
