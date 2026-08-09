import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from './auth.service';
import { vi } from 'vitest';
import { criarMock, Mocked } from '../../../testing/mock';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: Mocked<Router>;

  beforeEach(() => {
    // O construtor agenda refreshUser() em afterNextRender. Os timers falsos
    // evitam que qualquer agendamento pendente dispare HTTP no meio de outro
    // teste e estoure o httpMock.verify().
    vi.useFakeTimers();
    localStorage.clear();

    routerSpy = criarMock<Router>(['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
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

  it('isLoggedIn deriva do signal, e não de uma leitura direta do localStorage', () => {
    // Antes isto era `!!localStorage.getItem('lms_token')`. Como o template raiz
    // decide o layout inteiro por essa expressão, o valor podia mudar no meio de
    // um ciclo de verificação (NG0100) e, sob zoneless, uma leitura não reativa
    // não agenda verificação nenhuma.
    expect(service.isLoggedIn()).toBe(false);

    // token no storage sem passar pelo signal NÃO deve logar a UI
    localStorage.setItem('lms_token', 'abc123');
    expect(service.isLoggedIn()).toBe(false);

    service.currentUser.set({
      token: 'abc123', tipo: 'Bearer', nome: 'Fulano', email: 'f@teste.com', role: 'ALUNO'
    });
    expect(service.isLoggedIn()).toBe(true);

    service.currentUser.set(null);
    expect(service.isLoggedIn()).toBe(false);

    localStorage.removeItem('lms_token');
  });

  it('sessão pela metade no storage é tratada como deslogado', () => {
    // só o usuário, sem token — estado híbrido que a UI não deve aceitar
    localStorage.setItem('lms_user', JSON.stringify({ role: 'ADMIN' }));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: Router, useValue: criarMock<Router>(['navigate']) },
      ],
    });

    const outro = TestBed.inject(AuthService);
    expect(outro.currentUser()).toBeNull();
    expect(outro.isLoggedIn()).toBe(false);

    TestBed.inject(HttpTestingController).verify();
  });

  it('isAdmin() e isProfessor() retornam corretamente conforme o role no signal', () => {
    expect(service.isAdmin()).toBe(false);
    expect(service.isProfessor()).toBe(false);

    service.currentUser.set({ token: 't', tipo: 'Bearer', nome: 'Admin', email: 'admin@teste.com', role: 'ADMIN' });
    expect(service.isAdmin()).toBe(true);
    expect(service.isProfessor()).toBe(true); // ADMIN também é considerado professor

    service.currentUser.set({ token: 't', tipo: 'Bearer', nome: 'Prof', email: 'prof@teste.com', role: 'PROFESSOR' });
    expect(service.isAdmin()).toBe(false);
    expect(service.isProfessor()).toBe(true);

    service.currentUser.set({ token: 't', tipo: 'Bearer', nome: 'Aluno', email: 'aluno@teste.com', role: 'ALUNO' });
    expect(service.isAdmin()).toBe(false);
    expect(service.isProfessor()).toBe(false);
  });
});
