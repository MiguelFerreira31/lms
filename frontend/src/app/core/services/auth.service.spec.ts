import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // O construtor do AuthService dispara um setTimeout(..., 100) que chama
    // refreshUser(). Usamos o relógio falso do Jasmine para que esse timer
    // nunca dispare de verdade durante os testes (evita requisições HTTP
    // inesperadas vazando para testes seguintes).
    jasmine.clock().install();
    localStorage.clear();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jasmine.clock().uninstall();
    localStorage.clear();
  });

  it('login atualiza o signal currentUser e persiste token/usuário no localStorage', () => {
    const response: AuthResponse = {
      token: 'abc123', tipo: 'Bearer', nome: 'Fulano', email: 'fulano@teste.com', role: 'ALUNO'
    };

    service.login({ email: 'fulano@teste.com', senha: '123456' }).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(response);

    expect(service.currentUser()).toEqual(response);
    expect(localStorage.getItem('lms_token')).toBe('abc123');
    expect(JSON.parse(localStorage.getItem('lms_user')!)).toEqual(response);
  });

  it('logout limpa localStorage e o signal, e redireciona para /login', () => {
    localStorage.setItem('lms_token', 'abc123');
    localStorage.setItem('lms_user', JSON.stringify({ token: 'abc123', role: 'ALUNO' }));
    service.currentUser.set({
      token: 'abc123', tipo: 'Bearer', nome: 'Fulano', email: 'fulano@teste.com', role: 'ALUNO'
    });

    service.logout();

    expect(localStorage.getItem('lms_token')).toBeNull();
    expect(localStorage.getItem('lms_user')).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('isAdmin() e isProfessor() retornam corretamente conforme o role no signal', () => {
    expect(service.isAdmin()).toBeFalse();
    expect(service.isProfessor()).toBeFalse();

    service.currentUser.set({ token: 't', tipo: 'Bearer', nome: 'Admin', email: 'admin@teste.com', role: 'ADMIN' });
    expect(service.isAdmin()).toBeTrue();
    expect(service.isProfessor()).toBeTrue(); // ADMIN também é considerado professor

    service.currentUser.set({ token: 't', tipo: 'Bearer', nome: 'Prof', email: 'prof@teste.com', role: 'PROFESSOR' });
    expect(service.isAdmin()).toBeFalse();
    expect(service.isProfessor()).toBeTrue();

    service.currentUser.set({ token: 't', tipo: 'Bearer', nome: 'Aluno', email: 'aluno@teste.com', role: 'ALUNO' });
    expect(service.isAdmin()).toBeFalse();
    expect(service.isProfessor()).toBeFalse();
  });
});
