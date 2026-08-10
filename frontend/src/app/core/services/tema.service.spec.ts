import { TestBed } from '@angular/core/testing';
import { TemaService, TEMA_PADRAO, TOKENS_COR } from './tema.service';

/**
 * O TemaService aplica escrevendo custom properties inline no <html>. Estes
 * testes verificam justamente esse contrato: se ele parar de escrever as
 * variáveis, a aplicação inteira perde a cor sem nenhum erro aparecer.
 */
describe('TemaService', () => {
  let servico: TemaService;

  function criar(): TemaService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(TemaService);
  }

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-tema');
    document.documentElement.removeAttribute('style');
    servico = criar();
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-tema');
    document.documentElement.removeAttribute('style');
  });

  function varDoTema(nome: string): string {
    return document.documentElement.style.getPropertyValue(nome).trim();
  }

  it('aplica data-tema e as variáveis de cor no <html>', () => {
    servico.definirModo('claro');
    TestBed.tick();

    expect(document.documentElement.getAttribute('data-tema')).toBe('claro');
    expect(varDoTema('--tema-marca')).toBe(TEMA_PADRAO.claro.cores.marca);
    expect(varDoTema('--tema-superficie')).toBe(TEMA_PADRAO.claro.cores.superficie);
  });

  it('escreve todos os tokens de cor, não apenas alguns', () => {
    servico.definirModo('escuro');
    TestBed.tick();

    // Um token esquecido no mapa não daria erro: a cor apenas cairia no valor
    // do CSS estático e ficaria fora do controle da página de Aparência.
    for (const token of TOKENS_COR) {
      const nome = '--tema-' + token
        .replace(/([A-Z])/g, '-$1')
        .replace(/([a-z])(\d)/g, '$1-$2')
        .toLowerCase();
      expect(varDoTema(nome)).not.toBe('');
    }
  });

  it('troca o conjunto inteiro de cores ao alternar de modo', () => {
    servico.definirModo('claro');
    TestBed.tick();
    const marcaClara = varDoTema('--tema-marca');
    const fundoClaro = varDoTema('--tema-fundo');

    servico.alternarModo();
    TestBed.tick();

    expect(document.documentElement.getAttribute('data-tema')).toBe('escuro');
    expect(varDoTema('--tema-marca')).not.toBe(marcaClara);
    expect(varDoTema('--tema-fundo')).not.toBe(fundoClaro);
  });

  it('mantém as paletas dos dois modos independentes', () => {
    servico.definirCor('claro', 'marca', '#111111');
    servico.definirCor('escuro', 'marca', '#eeeeee');
    TestBed.tick();

    expect(servico.config().claro.cores.marca).toBe('#111111');
    expect(servico.config().escuro.cores.marca).toBe('#eeeeee');
  });

  it('persiste e recarrega a configuração', () => {
    servico.definirModo('escuro');
    servico.definirCor('escuro', 'destaque', '#abcdef');
    servico.definirTipografia('escuro', { escala: 1.2 });
    TestBed.tick();

    const outro = criar();

    expect(outro.config().modo).toBe('escuro');
    expect(outro.config().escuro.cores.destaque).toBe('#abcdef');
    expect(outro.config().escuro.tipografia.escala).toBe(1.2);
  });

  it('completa com o padrão quando o tema salvo está incompleto', () => {
    // Simula um tema exportado por uma versão anterior, sem alguns tokens.
    localStorage.setItem('lms_tema', JSON.stringify({
      modo: 'claro',
      claro: { cores: { marca: '#123456' }, tipografia: {} },
      escuro: { cores: {}, tipografia: {} },
    }));

    const outro = criar();

    expect(outro.config().claro.cores.marca).toBe('#123456');
    // o que faltava vem do padrão, em vez de ficar indefinido
    expect(outro.config().claro.cores.superficie).toBe(TEMA_PADRAO.claro.cores.superficie);
    expect(outro.config().claro.tipografia.escala).toBe(TEMA_PADRAO.claro.tipografia.escala);
  });

  it('ignora tema salvo corrompido e cai no padrão', () => {
    localStorage.setItem('lms_tema', '{ isto não é json');

    const outro = criar();

    expect(outro.config().claro.cores.marca).toBe(TEMA_PADRAO.claro.cores.marca);
  });

  it('restaura só o modo pedido, preservando o outro', () => {
    servico.definirCor('claro', 'marca', '#111111');
    servico.definirCor('escuro', 'marca', '#eeeeee');

    servico.restaurarModo('claro');

    expect(servico.config().claro.cores.marca).toBe(TEMA_PADRAO.claro.cores.marca);
    expect(servico.config().escuro.cores.marca).toBe('#eeeeee');
  });

});
