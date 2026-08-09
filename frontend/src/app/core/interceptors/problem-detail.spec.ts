import { HttpErrorResponse } from '@angular/common/http';
import { mensagemDeErro, ProblemDetail } from './error.interceptor';

/**
 * Leitura do corpo RFC 7807 que o backend passou a emitir.
 *
 * Antes a API respondia erro em quatro formatos diferentes e os componentes
 * liam `error.error?.message`. Se o helper regredir, as telas voltam a mostrar
 * a mensagem genérica em vez do motivo real da falha.
 */
describe('mensagemDeErro', () => {
  function erro(status: number, body: unknown): HttpErrorResponse {
    return new HttpErrorResponse({ status, error: body });
  }

  it('lê o campo detail do ProblemDetail', () => {
    const problema: ProblemDetail = {
      type: 'https://lms.local/erros/conflito',
      title: 'Conflito de regra de negócio',
      status: 409,
      detail: 'Você já está matriculado neste curso',
    };

    expect(mensagemDeErro(erro(409, problema))).toBe('Você já está matriculado neste curso');
  });

  it('junta os campos de errors nas falhas de validação', () => {
    const problema: ProblemDetail = {
      type: 'https://lms.local/erros/validacao',
      title: 'Falha de validação',
      status: 400,
      detail: '2 campos inválidos',
      errors: {
        email: 'deve ser um endereço de e-mail bem formado',
        senha: 'tamanho deve ser entre 8 e 100',
      },
    };

    const msg = mensagemDeErro(erro(400, problema));

    // O detail genérico ("2 campos inválidos") não ajuda o usuário a corrigir;
    // as mensagens por campo, sim.
    expect(msg).toContain('deve ser um endereço de e-mail bem formado');
    expect(msg).toContain('tamanho deve ser entre 8 e 100');
  });

  it('cai no detail quando errors vem vazio', () => {
    const problema = {
      type: 'x', title: 'y', status: 400, detail: 'motivo real', errors: {},
    } as ProblemDetail;

    expect(mensagemDeErro(erro(400, problema))).toBe('motivo real');
  });

  it('reconhece falha de rede (status 0), em que não há corpo', () => {
    expect(mensagemDeErro(erro(0, null))).toBe('Não foi possível conectar ao servidor');
  });

  it('usa o texto padrão quando o corpo não é um ProblemDetail', () => {
    expect(mensagemDeErro(erro(500, 'texto solto'), 'Erro ao salvar curso'))
      .toBe('Erro ao salvar curso');
  });

  it('usa o texto padrão quando não há corpo algum', () => {
    expect(mensagemDeErro(erro(503, null), 'Erro ao carregar')).toBe('Erro ao carregar');
  });
});
