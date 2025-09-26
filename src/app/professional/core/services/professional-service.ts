import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {environment} from '../../../../environment/environment';
import {PagedResult} from '../../../auth/shared/models';
import {ProfessionalDTO} from '../../shared/professionalDTO';
import {map} from "rxjs";

@Injectable({ providedIn: 'root' })
export class ProfessionalService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  list(opts: {
    q?: string; cityName?: string; districtName?: string;
    minRate?: number; maxRate?: number; page?: number; pageSize?: number
  } = {}) {
    let params = new HttpParams();
    Object.entries(opts).forEach(([k, v]) => (v ?? v === 0) && (params = params.set(k, String(v))));
    return this.http
        .get<ProfessionalDTO[] | PagedResult<ProfessionalDTO>>(`${this.base}/professionals`, { params })
        .pipe(map((res: any) => Array.isArray(res) ? res : (res?.items ?? [])));
  }

  getById(id: number) {
    return this.http.get<ProfessionalDTO>(`${this.base}/${id}`);
  }

  create(body: Omit<ProfessionalDTO, 'id' | 'mapsUrl'> & { password?: string, mapsUrl?: string, whatsappLink?: string }) {
    return this.http.post<ProfessionalDTO>(`${this.base}/professional`, body);
  }

  update(id: number, body: Partial<ProfessionalDTO> & { password?: string }) {
    return this.http.put<ProfessionalDTO>(`${this.base}/professionals/${id}`, body);
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.base}/professionals/${id}`);
  }
}
