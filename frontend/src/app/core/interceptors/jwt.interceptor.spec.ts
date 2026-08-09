import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { jwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../services/auth.service';
import { criarMock, Mocked } from '../../../testing/mock';

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: Mocked<AuthService>;

  beforeEach(() => {
    authServiceSpy = criarMock<AuthService>(['getToken']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr(), withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('injeta header Authorization: Bearer <token> quando há token salvo', () => {
    authServiceSpy.getToken.mockReturnValue('meu-token');

    http.get('/api/teste').subscribe();

    const req = httpMock.expectOne('/api/teste');
    expect(req.request.headers.get('Authorization')).toBe('Bearer meu-token');
    req.flush({});
  });

  it('não injeta header Authorization quando não há token', () => {
    authServiceSpy.getToken.mockReturnValue(null);

    http.get('/api/teste').subscribe();

    const req = httpMock.expectOne('/api/teste');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
