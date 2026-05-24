import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginRequest { email: string; senha: string; }
export interface AuthResponse { token: string; tipo: string; nome: string; email: string; role: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'lms_token';
  private readonly USER_KEY = 'lms_user';
  currentUser = signal<AuthResponse | null>(this.getStoredUser());

  constructor(private http: HttpClient, private router: Router) {
    this.refreshUser();
  }

  refreshUser() {
    if (!this.getToken()) return;
    this.http.get<{ id: number; nome: string; email: string; role: string }>(`${environment.apiUrl}/usuarios/me`).subscribe({
      next: user => {
        const stored = this.getStoredUser();
        if (stored) {
          const updated = { ...stored, nome: user.nome, email: user.email, role: user.role };
          localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
          this.currentUser.set(updated);
        }
      }
    });
  }

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response));
        this.currentUser.set(response);
      })
    );
  }

  register(data: { nome: string; email: string; senha: string }) {
    return this.http.post(`${environment.apiUrl}/auth/register`, data);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }
  isLoggedIn(): boolean { return !!this.getToken(); }
  isAdmin(): boolean {
    const user = this.currentUser();
    console.log('[AuthService] currentUser:', user);
    console.log('[AuthService] isAdmin:', user?.role === 'ADMIN');
    return user?.role === 'ADMIN';
  }

  private getStoredUser(): AuthResponse | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }
}
