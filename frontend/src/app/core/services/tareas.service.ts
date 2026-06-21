import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  ChangeEstadoTareaRequest,
  CreateTareaRequest,
  PagedResult,
  Tarea,
  UpdateTareaRequest
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class TareasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/tareas`;
  private readonly paths = {
    getAll: this.base,
    getById: (id: number) => `${this.base}/${id}`,
    create: this.base,
    update: (id: number) => `${this.base}/${id}`,
    delete: (id: number) => `${this.base}/${id}`,
    changeEstado: (id: number) => `${this.base}/${id}/estado`
  };

  getAll(proyectoId: number, pagina: number, tamanoPagina: number): Observable<ApiResponse<PagedResult<Tarea>>> {
    const params = new HttpParams()
      .set('proyectoId', String(proyectoId))
      .set('pagina', String(pagina))
      .set('tamanoPagina', String(tamanoPagina));
    return this.http.get<ApiResponse<PagedResult<Tarea>>>(this.paths.getAll, { params });
  }

  getById(id: number): Observable<ApiResponse<Tarea>> {
    return this.http.get<ApiResponse<Tarea>>(this.paths.getById(id));
  }

  create(payload: CreateTareaRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(this.paths.create, payload);
  }

  update(id: number, payload: UpdateTareaRequest): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(this.paths.update(id), payload);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(this.paths.delete(id));
  }

  changeEstado(id: number, payload: ChangeEstadoTareaRequest): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(this.paths.changeEstado(id), payload);
  }
}
