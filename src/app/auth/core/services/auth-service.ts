import {Injectable, inject, signal, computed} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../../environment/environment';
import {LoginResponse} from '../../shared/models';
import {Router} from '@angular/router';
import {tap} from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthService {private http = inject(HttpClient);
  private router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem('token'));

  readonly loggedIn = computed<boolean>(() => !!this.token());

  get isLoggedIn(): boolean { return this.loggedIn(); }

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          const t = (res as any)?.token as string | undefined;
          if (t && t.length) {
            this.setToken(t);
          }
        })
      );
  }

  setToken(t: string) {
    localStorage.setItem('token', t);
    this.token.set(t);
  }

  logout() {
    localStorage.removeItem('token');
    this.token.set(null);
    this.router.navigateByUrl('/login');
  }
}
