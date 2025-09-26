import {Injectable, inject, signal, computed} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../../environment/environment';
import {LoginResponse} from '../../shared/models';
import {Router} from '@angular/router';
import {tap} from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem('token'));
  private _loggedIn = computed<boolean>(() => !!this.token());

  // API pública
  loggedIn() { return this._loggedIn(); }
  userId(): number | null {
    const n = Number(localStorage.getItem('userId'));
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          const t = res?.token as string | undefined;
          if (!t) return;
          this.setToken(t);

          // intenta encontrar un id usable:
          const uid =
            this.pickIdFromResponse(res) ??
            this.pickIdFromJwt(t);

          if (uid != null) localStorage.setItem('userId', String(uid));
        })
      );
  }

  setToken(t: string) {
    localStorage.setItem('token', t);
    this.token.set(t);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.token.set(null);
    this.router.navigateByUrl('/login');
  }

  // -------- helpers privados --------
  private pickIdFromResponse(res: Record<string, any>): number | null {
    const user = (res['user'] && typeof res['user'] === 'object') ? (res['user'] as Record<string, any>) : undefined;
    const candidates: unknown[] = [
      res['id'], res['userId'], res['professionalId'],
      user?.['id'], user?.['userId'], user?.['professionalId'],
    ];
    for (const c of candidates) {
      const n = Number(c as any);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return null;
  }

  private pickIdFromJwt(token: string): number | null {
    try {
      const payloadB64 = token.split('.')[1];
      if (!payloadB64) return null;
      const json = JSON.parse(atob(payloadB64));
      const candidates = [json?.professionalId, json?.userId, json?.id, json?.sub];
      for (const c of candidates) {
        const n = Number(c);
        if (Number.isFinite(n) && n > 0) return n;
      }
    } catch {}
    return null;
  }
}

