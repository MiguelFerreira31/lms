import { Injectable, Injector, afterNextRender, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginRequest { email: string; senha: string; }
export interface AuthResponse { token: string; tipo: string; nome: string; email: string; role: string; avatarUrl?: string | null; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly TOKEN_KEY = 'lms_token';
  private readonly USER_KEY = 'lms_user';
  /** Fonte de verdade da sessão. Tudo que a UI observa deriva daqui. */
  currentUser = signal<AuthResponse | null>(this.lerSessaoArmazenada());

  /**
   * Derivados reativos do signal — e não leituras diretas do localStorage.
   *
   * `isLoggedIn()` lia `localStorage` direto. Como o template raiz decide o
   * layout inteiro por essa expressão, dava para o valor mudar *no meio de um
   * ciclo de verificação*: a resposta do login gravava o token num microtask
   * entre o `refreshViews()` e o `checkNoChanges()`, e o Angular acusava
   * NG0100 no AppComponent. Pior que o aviso: sob zoneless, uma leitura não
   * reativa não agenda verificação nenhuma — se o localStorage mudasse sem uma
   * escrita de signal junto, o layout simplesmente não atualizaria.
   */
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  readonly isProfessor = computed(() => {
    const role = this.currentUser()?.role;
    return role === 'PROFESSOR' || role === 'ADMIN';
  });

  private readonly injector = inject(Injector);

  constructor() {
    // Antes era setTimeout(..., 100): um atraso arbitrário torcendo para cair
    // depois do primeiro render do zone.js. Sem zone.js isso deixou de valer, e
    // a escrita no signal aterrissava no meio do ciclo de verificação —
    // NG0100 na troca de layout do AppComponent. afterNextRender agenda a
    // revalidação para depois do primeiro paint, que é o que se queria.
    afterNextRender(() => this.refreshUser(), { injector: this.injector });
  }

  refreshUser() {
    if (!this.getToken()) return;
    this.http.get<{ id: number; nome: string; email: string; role: string; avatarUrl?: string | null }>(`${environment.apiUrl}/usuarios/me`).subscribe({
      next: user => {
        const stored = this.lerSessaoArmazenada();
        if (stored) {
          const updated = { ...stored, nome: user.nome, email: user.email, role: user.role, avatarUrl: user.avatarUrl };
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

  /**
   * Leitura direta do storage, de propósito: os interceptors precisam do token
   * a cada requisição e não participam de ciclo de detecção de mudança. Nenhum
   * template deve chamar isto — para a UI existe {@link isLoggedIn}.
   */
  getToken(): string | null { return localStorage.getItem(this.TOKEN_KEY); }

  /**
   * Só considera sessão válida quando token e usuário estão ambos presentes.
   * Storage pela metade (limpeza parcial, aba antiga, escrita interrompida)
   * é tratado como deslogado, em vez de deixar a UI num estado híbrido.
   */
  private lerSessaoArmazenada(): AuthResponse | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user || !localStorage.getItem(this.TOKEN_KEY)) return null;
    try {
      return JSON.parse(user) as AuthResponse;
    } catch {
      return null;
    }
  }
}
