import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CursoCardComponent } from './curso-card.component';
import { Curso } from '../../core/services/curso.service';

/**
 * Primeiro teste de componente do projeto.
 *
 * Além de cobrir o card, serve de prova de que a renderização funciona sob
 * **zoneless**: o `detectChanges()` não depende mais do zone.js para agendar a
 * verificação.
 *
 * Detalhe que a migração impõe: em zoneless, `detectChanges()` refaz a
 * verificação de *todos* os fixtures anexados, e não só do que recebeu a
 * chamada. Por isso o fixture é criado dentro de cada teste, e não num
 * `beforeEach` — um fixture pendurado com o `@Input` ainda não preenchido
 * quebraria os testes seguintes.
 */
describe('CursoCardComponent', () => {
  const cursoBase: Curso = {
    id: 42,
    titulo: 'Técnico em Desenvolvimento de Sistemas',
    descricao: 'Descrição do curso',
    nivel: 'INTERMEDIARIO',
    criadoEm: '2026-01-01T00:00:00',
    unidadeId: 1,
    unidadeNome: 'Santo Amaro',
    areaId: 1,
    areaNome: 'Tecnologia da Informação',
    imagemUrl: null,
    categorias: [],
    tipos: [{ id: 1, nome: 'Livre', slug: 'livre' }],
  } as unknown as Curso;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursoCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  /** Cria um fixture novo já com o curso aplicado e renderizado. */
  function montar(curso: Partial<Curso> = {}) {
    const fixture = TestBed.createComponent(CursoCardComponent);
    fixture.componentInstance.curso = { ...cursoBase, ...curso } as Curso;
    fixture.detectChanges();
    return {
      el: fixture.nativeElement as HTMLElement,
      componente: fixture.componentInstance,
    };
  }

  it('renderiza o título e o tipo do curso', () => {
    const { el } = montar();

    expect(el.textContent).toContain('Técnico em Desenvolvimento de Sistemas');
    expect(el.textContent).toContain('Livre');
  });

  it('traduz nível BASICO para Básico', () => {
    expect(montar({ nivel: 'BASICO' as Curso['nivel'] }).el.textContent).toContain('Básico');
  });

  it('traduz nível INTERMEDIARIO para Intermediário', () => {
    expect(montar({ nivel: 'INTERMEDIARIO' as Curso['nivel'] }).el.textContent).toContain('Intermediário');
  });

  it('traduz nível AVANCADO para Avançado', () => {
    expect(montar({ nivel: 'AVANCADO' as Curso['nivel'] }).el.textContent).toContain('Avançado');
  });

  it('mantém o valor cru se o nível vier fora do mapa', () => {
    const { componente } = montar({ nivel: 'DESCONHECIDO' as Curso['nivel'] });

    expect(componente.nivelLabel()).toBe('DESCONHECIDO');
  });

  it('usa a imagem do curso quando existe', () => {
    const { el } = montar({ imagemUrl: 'https://cdn.local/capa.png' });

    expect(el.querySelector('img')!.getAttribute('src')).toBe('https://cdn.local/capa.png');
  });

  it('cai num placeholder determinístico quando não há imagem', () => {
    const { el } = montar({ imagemUrl: null as unknown as string, id: 7 });

    // determinístico pelo id: o mesmo curso mostra sempre a mesma imagem
    expect(el.querySelector('img')!.getAttribute('src')).toContain('curso-7');
  });

  it('aponta o link para o detalhe do curso', () => {
    const { el } = montar({ id: 99 });

    expect(el.querySelector('a')!.getAttribute('href')).toBe('/cursos/99');
  });

  it('mostra no máximo um tipo, mesmo com vários', () => {
    const { el } = montar({
      tipos: [
        { id: 1, nome: 'Livre', slug: 'livre' },
        { id: 2, nome: 'Pos-Graduacao', slug: 'pos' },
      ],
    } as Partial<Curso>);

    // Escopado nas tags: o título do curso também tem palavras que apareceriam
    // num textContent do card inteiro.
    const tags = Array.from(el.querySelectorAll('.absolute span')).map(t => t.textContent?.trim());

    expect(tags).toContain('Livre');
    expect(tags).not.toContain('Pos-Graduacao');
  });
});
