import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { adminGuard, professorGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { criarMock, Mocked } from '../../../testing/mock';

/**
 * Guards por role.
 *
 * Antes da migração as rotas `/admin/*` e `/professor/*` usavam apenas o
 * `authGuard`, que só verifica se existe sessão. Um ALUNO autenticado navegava
 * para `/admin/usuarios` e a UI renderizava — a API respondia 403, mas a tela
 * aparecia. Estes testes travam esse comportamento.
 */
describe('guards por role', () => {
  let auth: Mocked<AuthService>;
  let router: Mocked<Router>;
  const dashboardTree = { __tree: 'dashboard' } as unknown as UrlTree;
  const loginTree = { __tree: 'login' } as unknown as UrlTree;

  beforeEach(() => {
    auth = criarMock<AuthService>(['isLoggedIn', 'isAdmin', 'isProfessor']);
    router = criarMock<Router>(['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  function run(guard: typeof adminGuard, url: string) {
    return TestBed.runInInjectionContext(() => guard({} as any, { url } as any));
  }

  describe('adminGuard', () => {
    it('deixa o ADMIN entrar', () => {
      auth.isLoggedIn.mockReturnValue(true);
      auth.isAdmin.mockReturnValue(true);

      expect(run(adminGuard, '/admin/usuarios')).toBe(true);
      expect(router.createUrlTree).not.toHaveBeenCalled();
    });

    it('manda quem está autenticado sem a role para o dashboard, não para o login', () => {
      auth.isLoggedIn.mockReturnValue(true);
      auth.isAdmin.mockReturnValue(false);
      router.createUrlTree.mockReturnValue(dashboardTree);

      // O usuário tem sessão válida; o que falta é permissão. Mandar para o
      // login sugeriria que a sessão expirou, o que não é o caso.
      expect(run(adminGuard, '/admin/usuarios')).toBe(dashboardTree);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    });

    it('manda quem não tem sessão para o login preservando o returnUrl', () => {
      auth.isLoggedIn.mockReturnValue(false);
      router.createUrlTree.mockReturnValue(loginTree);

      expect(run(adminGuard, '/admin/cursos')).toBe(loginTree);
      expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/admin/cursos' },
      });
      // sem sessão, nem chega a consultar a role
      expect(auth.isAdmin).not.toHaveBeenCalled();
    });
  });

  describe('professorGuard', () => {
    it('deixa o PROFESSOR entrar', () => {
      auth.isLoggedIn.mockReturnValue(true);
      auth.isProfessor.mockReturnValue(true);

      expect(run(professorGuard, '/professor/cursos')).toBe(true);
    });

    it('bloqueia o ALUNO', () => {
      auth.isLoggedIn.mockReturnValue(true);
      auth.isProfessor.mockReturnValue(false);
      router.createUrlTree.mockReturnValue(dashboardTree);

      expect(run(professorGuard, '/professor/cursos')).toBe(dashboardTree);
    });

    it('não redireciona o ADMIN — isProfessor() já o considera', () => {
      auth.isLoggedIn.mockReturnValue(true);
      auth.isProfessor.mockReturnValue(true); // é o que AuthService faz para ADMIN

      expect(run(professorGuard, '/professor/cursos')).toBe(true);
      expect(router.createUrlTree).not.toHaveBeenCalled();
    });
  });
});
