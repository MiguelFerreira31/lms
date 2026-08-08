import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CursoService, Curso, CursoDetalhe, Page } from './curso.service';
import { environment } from '../../../environments/environment';

describe('CursoService', () => {
  let service: CursoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CursoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listarCursos busca a página de cursos com os parâmetros corretos', () => {
    const pageMock: Page<Curso> = { content: [], totalElements: 0, totalPages: 0, number: 1 };

    service.listarCursos(1, 'BASICO', 5).subscribe(page => {
      expect(page).toEqual(pageMock);
    });

    const req = httpMock.expectOne(r =>
      r.url === `${environment.apiUrl}/cursos` &&
      r.params.get('page') === '1' &&
      r.params.get('nivel') === 'BASICO' &&
      r.params.get('unidadeId') === '5'
    );
    expect(req.request.method).toBe('GET');
    req.flush(pageMock);
  });

  it('buscarCurso busca o detalhe de um curso pelo id', () => {
    const cursoMock = { id: 10, titulo: 'Curso X', modulos: [] } as unknown as CursoDetalhe;

    service.buscarCurso(10).subscribe(curso => {
      expect(curso).toEqual(cursoMock);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/cursos/10`);
    expect(req.request.method).toBe('GET');
    req.flush(cursoMock);
  });

  it('criarCurso envia POST com os dados do curso e retorna o curso criado', () => {
    const novoCurso = { titulo: 'Novo Curso', descricao: 'desc', nivel: 'BASICO', unidadeId: null, areaId: 1 };
    const respostaMock = { id: 99, ...novoCurso } as unknown as Curso;

    service.criarCurso(novoCurso).subscribe(curso => {
      expect(curso).toEqual(respostaMock);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/cursos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(novoCurso);
    req.flush(respostaMock);
  });
});
