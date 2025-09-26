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

  list(opts: { city?: string; district?: string; rate?: number } = {}) {
    let params = new HttpParams();
    if (opts.city)     params = params.set('city', opts.city);
    if (opts.district) params = params.set('district', opts.district);
    if (opts.rate != null) params = params.set('rate', String(opts.rate));

    return this.http.get<ProfessionalDTO[]>(`${this.base}/professionals`, { params });
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
