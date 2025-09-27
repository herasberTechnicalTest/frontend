import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '../../../../environment/environment';
import {CreateProfessionalPayload, ProfessionalDTO} from '../../shared/professionalDTO';
import {AuthService} from '../../../auth/core/services/auth-service';

@Injectable({ providedIn: 'root' })
export class ProfessionalService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = environment.apiUrl;

  private authHeaders(): HttpHeaders {
    const t = this.auth.token();
    return t ? new HttpHeaders({ 'Authorization': `Bearer ${t}` }) : new HttpHeaders();
  }

  list(opts: { city?: string; district?: string; rate?: number } = {}) {
    let params = new HttpParams();
    if (opts.city)     params = params.set('city', opts.city);
    if (opts.district) params = params.set('district', opts.district);
    if (opts.rate != null) params = params.set('rate', String(opts.rate));

    return this.http.get<ProfessionalDTO[]>(`${this.base}/professionals`, {
      params,
      headers: this.authHeaders()
    });
  }

  // Tu backend: GET /api/v1/{id}
  getById(id: number) {
    return this.http.get<ProfessionalDTO>(`${this.base}/${id}`, {
      headers: this.authHeaders()
    });
  }

  create(body: CreateProfessionalPayload) {
    return this.http.post<ProfessionalDTO>(`${this.base}/professional`, body, {
      headers: this.authHeaders()
    });
  }

  update(id: number, body: any) {
    return this.http.put<ProfessionalDTO>(
      `${this.base}/professionals/${id}`,
      body,
      { headers: this.authHeaders() }
    );
  }


  remove(id: number) {
    return this.http.delete<void>(`${this.base}/professionals/${id}`, {
      headers: this.authHeaders()
    });
  }

  deleteImageFromGallery(professionalId: number, imageUrl: string) {
    return this.http.delete<void>(`${this.base}/professionals/${professionalId}/gallery`, {
      body: imageUrl,
      headers: this.authHeaders(),
    });
  }

  addImageToGallery(professionalId: number, imageUrl: string) {
    return this.http.post<string[]>(
      `${this.base}/professionals/${professionalId}/gallery`,
      imageUrl,
      { headers: this.authHeaders() }
    );
  }


}
