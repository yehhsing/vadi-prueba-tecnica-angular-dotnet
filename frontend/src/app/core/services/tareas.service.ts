import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateTareaRequest,
  PagedResult,
  Tarea,
  UpdateTareaRequest
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class TareasService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/tareas`;

  getAll(proyectoId: number, pagina: number, tamanoPagina: number): Observable<ApiResponse<PagedResult<Tarea>>> {
    const params = new HttpParams()
      .set('proyectoId', String(proyectoId))
      .set('pagina', String(pagina))
      .set('tamanoPagina', String(tamanoPagina));
    return this.http.get<ApiResponse<PagedResult<Tarea>>>(this.base, { params });
  }

  getById(id: number): Observable<ApiResponse<Tarea>> {
    return this.http.get<ApiResponse<Tarea>>(`${this.base}/${id}`);
  }

  create(payload: CreateTareaRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(this.base, payload);
  }

  update(id: number, payload: UpdateTareaRequest): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}`);
  }

  changeEstado(id: number, estadoId: number): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(`${this.base}/${id}/estado`, { estadoId });
  }
}
