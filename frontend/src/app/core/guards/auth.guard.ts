import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/**
 * Guards por role.
 *
 * O `AuthService` já expunha `isAdmin()`/`isProfessor()`, mas nenhuma rota os
 * usava: todas as telas de `/admin/*` e `/professor/*` estavam protegidas apenas
 * por `authGuard`, que só verifica se há sessão. Um ALUNO autenticado navegava
 * para `/admin/usuarios` e a UI renderizava — as chamadas de API voltavam 403,
 * mas a tela aparecia.
 *
 * Quem não tem a role é mandado para o próprio dashboard, não para o login:
 * está autenticado, só não tem permissão.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  return auth.isAdmin() || router.createUrlTree(['/dashboard']);
};

/** ADMIN também passa: `isProfessor()` já considera ADMIN. */
export const professorGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  return auth.isProfessor() || router.createUrlTree(['/dashboard']);
};
