import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

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
    authServiceSpy.isLoggedIn.and.returnValue(false);
    const fakeTree = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(fakeTree);

    const result = runGuard('/admin/cursos');

    expect(authServiceSpy.isLoggedIn).toHaveBeenCalled();
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
      ['/login'], { queryParams: { returnUrl: '/admin/cursos' } }
    );
    expect(result).toBe(fakeTree);
  });

  it('permite acesso quando o usuário está autenticado', () => {
    authServiceSpy.isLoggedIn.and.returnValue(true);

    const result = runGuard('/admin/cursos');

    expect(result).toBeTrue();
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });
});
