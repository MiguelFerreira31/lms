import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  TemaService, TOKENS_COR, ROTULOS_COR, FONTES_DISPONIVEIS,
  type TokenCor, type ModoTema,
} from '../../core/services/tema.service';

/**
 * Configuração de aparência: cores e tipografia, definidas separadamente para
 * o modo claro e o escuro.
 *
 * O modo que está sendo **editado** é independente do modo que está **ativo**
 * na aplicação: dá para ajustar o tema escuro enquanto se navega no claro. Por
 * isso existe o botão "Ver este modo", que ativa o modo em edição para conferir
 * o resultado ao vivo.
 */
@Component({
  selector: 'app-aparencia',
  imports: [MatIconModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './aparencia.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // A prévia não usa os tokens globais de propósito: ela mostra o modo EM
  // EDIÇÃO, que pode não ser o aplicado. As variáveis --pv-* são vinculadas na
  // seção via [style.--pv-*], e os hovers/focus abaixo reagem a elas — é o que
  // permite ver o estado de hover de um botão sem trocar o tema inteiro.
  styles: [`
    .pv-quadro { background: var(--pv-fundo); font-family: var(--pv-fonte-corpo); }
    .pv-topo { background: var(--pv-marca); }
    .pv-menu { background: var(--pv-superficie); }

    .pv-titulo {
      color: var(--pv-texto);
      font-family: var(--pv-fonte-titulo);
      font-weight: var(--pv-peso-titulo);
    }
    .pv-suave { color: var(--pv-texto-suave); }

    .pv-nav-item { color: var(--pv-texto-suave); transition: background-color .15s, color .15s; }
    .pv-nav-item:hover { background: var(--pv-marca-suave); color: var(--pv-marca); }
    .pv-nav-ativo { background: var(--pv-marca-suave); color: var(--pv-marca); }

    .pv-cartao {
      background: var(--pv-superficie);
      border: 1px solid var(--pv-borda);
      transition: border-color .15s, box-shadow .15s;
    }
    .pv-cartao:hover {
      border-color: var(--pv-marca);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / .1);
    }

    .pv-btn-marca { background: var(--pv-marca); transition: background-color .15s; }
    .pv-btn-marca:hover { background: var(--pv-marca-escura); }

    .pv-btn-destaque { background: var(--pv-destaque); transition: background-color .15s; }
    .pv-btn-destaque:hover {
      background: color-mix(in srgb, var(--pv-destaque) 85%, var(--pv-mistura));
    }

    .pv-btn-erro-suave {
      color: var(--pv-erro);
      background: color-mix(in srgb, var(--pv-erro) 12%, var(--pv-superficie));
      transition: background-color .15s;
    }
    .pv-btn-erro-suave:hover {
      background: color-mix(in srgb, var(--pv-erro) 24%, var(--pv-superficie));
    }

    .pv-chip { background: var(--pv-marca-suave); color: var(--pv-marca); }

    .pv-link { color: var(--pv-marca); transition: color .15s; }
    .pv-link:hover { color: var(--pv-marca-escura); text-decoration: underline; }

    .pv-input {
      background: var(--pv-superficie);
      color: var(--pv-texto);
      border: 1px solid var(--pv-borda);
      outline: none;
      transition: border-color .15s, box-shadow .15s;
    }
    .pv-input::placeholder { color: var(--pv-texto-suave); }
    .pv-input:focus {
      border-color: var(--pv-marca);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--pv-marca) 25%, transparent);
    }
  `],
})
export class AparenciaComponent {
  private readonly snack = inject(MatSnackBar);
  readonly tema = inject(TemaService);

  readonly tokens = TOKENS_COR;
  readonly rotulos = ROTULOS_COR;
  readonly fontes = FONTES_DISPONIVEIS;

  /** Modo cuja paleta está sendo editada — não necessariamente o modo ativo. */
  readonly editando = signal<'claro' | 'escuro'>(this.tema.modoEfetivo());

  readonly paletaEmEdicao = computed(() => this.tema.config()[this.editando()].cores);
  readonly tipografiaEmEdicao = computed(() => this.tema.config()[this.editando()].tipografia);

  /** Verdadeiro quando o modo em edição é o que está aplicado na tela. */
  readonly editandoOModoAtivo = computed(() => this.editando() === this.tema.modoEfetivo());

  readonly pesos = [
    { valor: 500, rotulo: 'Médio' },
    { valor: 600, rotulo: 'Seminegrito' },
    { valor: 700, rotulo: 'Negrito' },
    { valor: 800, rotulo: 'Extranegrito' },
  ];

  readonly modos: { valor: ModoTema; rotulo: string; icone: string }[] = [
    { valor: 'claro',   rotulo: 'Claro',   icone: 'light_mode' },
    { valor: 'escuro',  rotulo: 'Escuro',  icone: 'dark_mode' },
    { valor: 'sistema', rotulo: 'Sistema', icone: 'contrast' },
  ];

  editarModo(modo: 'claro' | 'escuro'): void {
    this.editando.set(modo);
  }

  aplicarModoEmEdicao(): void {
    this.tema.definirModo(this.editando());
  }

  aoMudarCor(token: TokenCor, evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.tema.definirCor(this.editando(), token, valor);
  }

  /** Aceita hex digitado à mão; ignora enquanto estiver incompleto. */
  aoDigitarHex(token: TokenCor, evento: Event): void {
    const bruto = (evento.target as HTMLInputElement).value.trim();
    const valor = bruto.startsWith('#') ? bruto : `#${bruto}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(valor)) {
      this.tema.definirCor(this.editando(), token, valor);
    }
  }

  aoMudarFonte(campo: 'fonteTitulo' | 'fonteCorpo', evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value;
    this.tema.definirTipografia(this.editando(), { [campo]: valor });
  }

  aoMudarEscala(evento: Event): void {
    const escala = Number((evento.target as HTMLInputElement).value);
    this.tema.definirTipografia(this.editando(), { escala });
  }

  aoMudarPeso(evento: Event): void {
    const pesoTitulo = Number((evento.target as HTMLSelectElement).value);
    this.tema.definirTipografia(this.editando(), { pesoTitulo });
  }

  restaurarModo(): void {
    this.tema.restaurarModo(this.editando());
    this.snack.open(`Modo ${this.editando()} restaurado`, 'OK', { duration: 2500 });
  }

  restaurarTudo(): void {
    this.tema.restaurarTudo();
    this.snack.open('Aparência restaurada para o padrão', 'OK', { duration: 2500 });
  }

  /**
   * Contraste WCAG entre a cor e a superfície do modo em edição.
   * Serve de aviso: uma combinação abaixo de 4.5 deixa o texto difícil de ler.
   */
  contrasteCom(token: TokenCor): number {
    const cores = this.paletaEmEdicao();
    const fundo = token === 'texto' || token === 'textoSuave' ? cores.superficie : cores.fundo;
    return razaoDeContraste(cores[token], fundo);
  }

  contrasteRuim(token: TokenCor): boolean {
    return (token === 'texto' || token === 'textoSuave' || token === 'marca')
      && this.contrasteCom(token) < 4.5;
  }
}

/** Luminância relativa conforme WCAG 2.1. */
function luminancia(hex: string): number {
  const n = hex.replace('#', '');
  const canais = [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * canais[0] + 0.7152 * canais[1] + 0.0722 * canais[2];
}

function razaoDeContraste(corA: string, corB: string): number {
  if (!/^#[0-9A-Fa-f]{6}$/.test(corA) || !/^#[0-9A-Fa-f]{6}$/.test(corB)) return 21;
  const a = luminancia(corA);
  const b = luminancia(corB);
  const [claro, escuro] = a > b ? [a, b] : [b, a];
  return Math.round(((claro + 0.05) / (escuro + 0.05)) * 10) / 10;
}
