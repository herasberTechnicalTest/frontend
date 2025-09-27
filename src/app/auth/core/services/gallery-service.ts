import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';  // Asegúrate de que sea la ruta correcta
import { AuthService } from '../../../auth/core/services/auth-service';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = environment.apiUrl;

  private authHeaders(): HttpHeaders {
    const token = this.auth.token();
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  updateGallery(professionalId: number, gallery: string[]): Observable<string[]> {
    return this.http.put<string[]>(
      `${this.base}/professionals/${professionalId}/gallery`, gallery,
      { headers: this.authHeaders() }
    );
  }

  getGallery(professionalId: number): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.base}/professionals/${professionalId}/gallery`,
      { headers: this.authHeaders() }
    );
  }

  // DELETE: Eliminar una imagen de la galería
  deleteImage(professionalId: number, imageUrl: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/professionals/${professionalId}/gallery`,
      { body: { imageUrl }, headers: this.authHeaders() }
    );
  }
}
