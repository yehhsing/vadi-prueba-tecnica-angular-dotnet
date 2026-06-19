import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TareasService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/tareas`;

  getAll(proyectoId: number, pagina: number, tamanoPagina: number): Observable<unknown> {
    const params = new HttpParams()
      .set('proyectoId', String(proyectoId))
      .set('pagina', String(pagina))
      .set('tamanoPagina', String(tamanoPagina));
    return this.http.get(this.base, { params });
  }

  getById(id: number): Observable<unknown> {
    return this.http.get(`${this.base}/${id}`);
  }

  create(payload: unknown): Observable<unknown> {
    return this.http.post(this.base, payload);
  }

  update(id: number, payload: unknown): Observable<unknown> {
    return this.http.put(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/${id}`);
  }

  changeEstado(id: number, estadoId: number): Observable<unknown> {
    return this.http.patch(`${this.base}/${id}/estado`, { estadoId });
  }
}
