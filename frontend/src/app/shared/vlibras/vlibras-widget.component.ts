import {
  Component, ElementRef, inject, Input, OnDestroy, afterNextRender
} from '@angular/core';

/**
 * Widget VLibras (tradutor de Libras do gov.br).
 *
 * Substitui o pacote `angular-vlibras`, que declarava peer `@angular/core`
 * até a v21 e estava sem manutenção — ele travava a atualização para o v22.
 * O que o pacote fazia é essencialmente isto: injetar a marcação `[vw]` que o
 * plugin procura, carregar o script oficial e instanciar o `Widget`.
 *
 * A inicialização roda em `afterNextRender` para não depender do zone.js:
 * o DOM que o plugin manipula precisa existir antes de o script rodar.
 */
@Component({
  selector: 'app-vlibras',
  standalone: true,
  template: `
    <div vw class="enabled">
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    </div>
  `,
  styles: [':host { display: contents; }']
})
export class VlibrasWidgetComponent implements OnDestroy {
  /** Avatar exibido pelo plugin: `icaro`, `hozana`, `guga` ou `random`. */
  @Input() avatar: 'icaro' | 'hozana' | 'guga' | 'random' = 'random';
  /** Opacidade do widget, de 0 a 1. */
  @Input() opacity = 1;

  private static readonly SCRIPT_URL = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  private static readonly PLUGIN_URL = 'https://vlibras.gov.br/app';

  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private script?: HTMLScriptElement;

  constructor() {
    afterNextRender(() => this.carregar());
  }

  ngOnDestroy(): void {
    // Só remove o script se foi esta instância que o adicionou; o plugin em si
    // não expõe API de teardown.
    this.script?.remove();
  }

  private carregar(): void {
    const el = this.host.nativeElement.querySelector<HTMLElement>('[vw]');
    if (el) {
      el.style.opacity = String(this.opacity);
      el.setAttribute('vw-avatar', this.avatar);
    }

    if (window.VLibras?.Widget) {
      this.instanciar();
      return;
    }

    // Reaproveita o script se outra instância já o inseriu.
    const existente = document.querySelector<HTMLScriptElement>(
      `script[src="${VlibrasWidgetComponent.SCRIPT_URL}"]`);
    if (existente) {
      existente.addEventListener('load', () => this.instanciar(), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = VlibrasWidgetComponent.SCRIPT_URL;
    script.async = true;
    script.addEventListener('load', () => this.instanciar(), { once: true });
    script.addEventListener('error',
      () => console.warn('[VLibras] não foi possível carregar o plugin do gov.br'),
      { once: true });
    document.body.appendChild(script);
    this.script = script;
  }

  private instanciar(): void {
    try {
      new window.VLibras.Widget(VlibrasWidgetComponent.PLUGIN_URL);
    } catch (e) {
      console.warn('[VLibras] falha ao instanciar o widget', e);
    }
  }
}
