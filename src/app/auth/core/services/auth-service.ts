import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../../environment/environment';
import {LoginResponse} from '../../shared/models';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  token = signal<string | null>(localStorage.getItem('token'));

  get isLoggedIn() { return !!this.token(); }

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password });
  }

  setToken(t: string){ localStorage.setItem('token', t); this.token.set(t); }
  logout(){ localStorage.removeItem('token'); this.token.set(null); }
}
