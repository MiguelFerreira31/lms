import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Corpo de erro no formato RFC 7807 (`application/problem+json`), que o backend
 * passou a emitir em todas as rotas — inclusive nos erros que nascem na cadeia
 * de filtros do Spring Security.
 */
export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  timestamp?: string;
  /** Presente em falhas de validação: mapa campo → mensagem. */
  errors?: Record<string, string>;
}

/**
 * Extrai uma mensagem legível de um erro HTTP.
 *
 * Antes o backend respondia em quatro formatos diferentes e os componentes liam
 * `error.error.message`. Agora o corpo é sempre ProblemDetail, então a mensagem
 * está em `detail` — com fallback para os casos sem corpo (erro de rede, CORS,
 * backend fora do ar).
 */
export function mensagemDeErro(error: HttpErrorResponse, padrao = 'Erro inesperado'): string {
  const problema = error.error as ProblemDetail | null | undefined;

  if (problema?.errors) {
    const campos = Object.values(problema.errors);
    if (campos.length) return campos.join('. ');
  }
  if (problema?.detail) return problema.detail;
  if (error.status === 0) return 'Não foi possível conectar ao servidor';
  return padrao;
}

// Interceptor global: trata 401 (sessão expirada) e erros de rede.
// Erros de negócio (400, 403, 409) são tratados localmente em cada componente,
// que devem usar mensagemDeErro() para ler o ProblemDetail.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && auth.getToken()) {
        // Token expirado ou inválido — encerra sessão e redireciona para login
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
