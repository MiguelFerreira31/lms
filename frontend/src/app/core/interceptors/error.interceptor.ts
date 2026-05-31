import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Interceptor global: trata 401 (sessão expirada) e erros de rede.
// Erros de negócio (400, 403, 409) são tratados localmente em cada componente.
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
