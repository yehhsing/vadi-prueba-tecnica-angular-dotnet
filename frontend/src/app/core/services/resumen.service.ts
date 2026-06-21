import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Resumen } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ResumenService {
  private http = inject(HttpClient);

  getResumen(): Observable<ApiResponse<Resumen>> {
    return this.http.get<ApiResponse<Resumen>>(`${environment.apiUrl}/resumen`);
  }
}
