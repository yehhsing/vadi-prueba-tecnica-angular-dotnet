import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CreateProyectoRequest,
  PagedResult,
  Proyecto,
  UpdateProyectoRequest
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ProyectosService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/proyectos`;

  getAll(pagina: number, tamanoPagina: number): Observable<ApiResponse<PagedResult<Proyecto>>> {
    const params = new HttpParams()
      .set('pagina', String(pagina))
      .set('tamanoPagina', String(tamanoPagina));
    return this.http.get<ApiResponse<PagedResult<Proyecto>>>(this.base, { params });
  }

  getById(id: number): Observable<ApiResponse<Proyecto>> {
    return this.http.get<ApiResponse<Proyecto>>(`${this.base}/${id}`);
  }

  create(payload: CreateProyectoRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(this.base, payload);
  }

  update(id: number, payload: UpdateProyectoRequest): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.base}/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.base}/${id}`);
  }
}
