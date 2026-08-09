import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../services/auth.service';
import { criarMock, Mocked } from '../../../testing/mock';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: Mocked<AuthService>;
  let routerSpy: Mocked<Router>;

  beforeEach(() => {
    authServiceSpy = criarMock<AuthService>(['getToken', 'logout']);
    routerSpy = criarMock<Router>(['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr(), withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('dispara logout automático em resposta 401 quando havia sessão ativa', () => {
    authServiceSpy.getToken.mockReturnValue('token-expirado');

    http.get('/api/protegido').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/protegido');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('não chama logout em 401 quando não havia token (usuário já deslogado)', () => {
    authServiceSpy.getToken.mockReturnValue(null);

    http.get('/api/publico').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/publico');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceSpy.logout).not.toHaveBeenCalled();
  });
});
