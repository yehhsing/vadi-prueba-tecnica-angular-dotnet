import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  ApiResponse,
  CreateProyectoRequest,
  PagedResult,
  Proyecto,
  UpdateProyectoRequest,
} from "../models/api.models";

@Injectable({ providedIn: "root" })
export class ProyectosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/proyectos`;
  private readonly paths = {
    getAll: this.base,
    getById: (id: number) => `${this.base}/${id}`,
    create: this.base,
    update: (id: number) => `${this.base}/${id}`,
    delete: (id: number) => `${this.base}/${id}`,
  };

  getAll(
    pagina: number,
    tamanoPagina: number,
  ): Observable<ApiResponse<PagedResult<Proyecto>>> {
    const params = new HttpParams()
      .set("pagina", String(pagina))
      .set("tamanoPagina", String(tamanoPagina));
    return this.http.get<ApiResponse<PagedResult<Proyecto>>>(
      this.paths.getAll,
      { params },
    );
  }

  getById(id: number): Observable<ApiResponse<Proyecto>> {
    return this.http.get<ApiResponse<Proyecto>>(this.paths.getById(id));
  }

  create(payload: CreateProyectoRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(this.paths.create, payload);
  }

  update(
    id: number,
    payload: UpdateProyectoRequest,
  ): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(this.paths.update(id), payload);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(this.paths.delete(id));
  }
}
