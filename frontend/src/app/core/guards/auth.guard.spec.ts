import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { criarMock, Mocked } from '../../../testing/mock';

describe('authGuard', () => {
  let authServiceSpy: Mocked<AuthService>;
  let routerSpy: Mocked<Router>;

  beforeEach(() => {
    authServiceSpy = criarMock<AuthService>(['isLoggedIn']);
    routerSpy = criarMock<Router>(['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  function runGuard(url: string) {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url } as any)
    );
  }

  it('bloqueia acesso não autenticado e redireciona para /login com returnUrl', () => {
    authServiceSpy.isLoggedIn.mockReturnValue(false);
    const fakeTree = {} as UrlTree;
    routerSpy.createUrlTree.mockReturnValue(fakeTree);

    const result = runGuard('/admin/cursos');

    expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
      ['/login'], { queryParams: { returnUrl: '/admin/cursos' } }
    );
    expect(result).toBe(fakeTree);
  });

  it('permite acesso quando o usuário está autenticado', () => {
    authServiceSpy.isLoggedIn.mockReturnValue(true);

    const result = runGuard('/admin/cursos');

    expect(result).toBe(true);
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });
});
