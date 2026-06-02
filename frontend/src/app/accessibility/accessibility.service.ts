import { Injectable, signal } from '@angular/core';
import { AccessibilityState, DEFAULT_STATE } from './models/accessibility-state.model';
import { ColorManager } from './color-manager';

@Injectable({ providedIn: 'root' })
export class AccessibilityService {

  private readonly STORAGE_KEY = 'acessibilidade_prefs';
  private readonly FONT_SCALES = [0.90, 1.00, 1.10, 1.25, 1.50];
  private readonly FONT_SELECTOR = [
    'h1','h2','h3','h4','h5','h6','p','li','td','th','a','button','span','label',
    'input','textarea','select','caption','figcaption','blockquote','dt','dd',
    '[class*="text-"]','[class*="mat-"]','.mat-mdc-button','.mdc-button',
  ].join(',');

  state     = signal<AccessibilityState>(this.defaultState());
  panelOpen = signal(false);

  private fontEls: Element[] | null = null;
  private mutationObserver: MutationObserver | null = null;
  private colorManager = new ColorManager();

  private lupaMoveHandler:   ((e: MouseEvent) => void) | null = null;
  private mascaraMoveHandler: ((e: MouseEvent) => void) | null = null;
  private guiaMoveHandler:   ((e: MouseEvent) => void) | null = null;

  private suppressAnnounce = false;
  private dyslexicLoaded = false;

  // ─── Init ──────────────────────────────────────────────────────────────────

  init(): void {
    this.injectSvgFilters();
    this.loadPreferences();
    this.initMutationObserver();
  }

  // ─── Font ──────────────────────────────────────────────────────────────────

  increaseFont(): void { this.setFontLevel(this.state().fontLevel + 1); }
  decreaseFont(): void { this.setFontLevel(this.state().fontLevel - 1); }

  setFontLevel(level: number): void {
    if (level < -1 || level > 3) return;
    this.updateState({ fontLevel: level });

    if (level === 0) {
      this.resetFonts();
    } else {
      const scale = this.FONT_SCALES[level + 1]; // index 0=-1, 1=0, 2=1, 3=2, 4=3
      this.scaleFonts(scale);
    }
    this.announce(`Tamanho de fonte: ${this.fontLevelLabel(level)}`);
    this.savePreferences();
  }

  fontLevelLabel(level?: number): string {
    const l = level ?? this.state().fontLevel;
    const labels: Record<number, string> = { '-1': 'Menor', 0: 'Normal', 1: 'Médio', 2: 'Grande', 3: 'Máximo' };
    return labels[l] ?? 'Normal';
  }

  private scaleFonts(scale: number): void {
    this.buildFontCache();
    for (const el of this.fontEls ?? []) {
      if (!el.isConnected || this.shouldSkipEl(el)) continue;
      const htmlEl = el as HTMLElement;
      if (!htmlEl.dataset['accOrigFs']) {
        htmlEl.dataset['accOrigFs'] = getComputedStyle(el).fontSize;
      }
      const orig = parseFloat(htmlEl.dataset['accOrigFs']!);
      if (!isNaN(orig)) {
        htmlEl.style.setProperty('font-size', `${orig * scale}px`, 'important');
      }
    }
  }

  private resetFonts(): void {
    document.querySelectorAll<HTMLElement>('[data-acc-orig-fs]').forEach(el => {
      el.style.removeProperty('font-size');
      el.removeAttribute('data-acc-orig-fs');
    });
    this.fontEls = null;
  }

  private buildFontCache(): void {
    if (this.fontEls !== null) return;
    const all = document.querySelectorAll(this.FONT_SELECTOR);
    this.fontEls = Array.from(all).filter(el => !this.shouldSkipEl(el));
  }

  private shouldSkipEl(el: Element): boolean {
    if (el.tagName === 'SVG' || el.closest('svg')) return true;
    const cls = el.className?.toString() ?? '';
    if (/\bfa-\S+|\bmaterial-icons\b|\bmat-icon\b/.test(cls)) return true;
    if (el.closest('.acc-barra')) return true;
    return false;
  }

  private extendFontCache(nodes: Node[]): void {
    if (this.fontEls === null) return;
    for (const node of nodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const el = node as Element;
      const matches = [
        ...(el.matches(this.FONT_SELECTOR) ? [el] : []),
        ...Array.from(el.querySelectorAll(this.FONT_SELECTOR)),
      ].filter(e => !this.shouldSkipEl(e) && !this.fontEls!.includes(e));
      this.fontEls.push(...matches);
      const level = this.state().fontLevel;
      if (level !== 0) {
        const scale = this.FONT_SCALES[level + 1];
        for (const newEl of matches) {
          if (!newEl.isConnected) continue;
          const htmlEl = newEl as HTMLElement;
          if (!htmlEl.dataset['accOrigFs']) {
            htmlEl.dataset['accOrigFs'] = getComputedStyle(newEl).fontSize;
          }
          const orig = parseFloat(htmlEl.dataset['accOrigFs']!);
          if (!isNaN(orig)) {
            htmlEl.style.setProperty('font-size', `${orig * scale}px`, 'important');
          }
        }
      }
    }
  }

  // ─── Contraste ─────────────────────────────────────────────────────────────

  setContraste(modo: 'normal' | 'alto' | 'invertido'): void {
    // 1. Limpar tudo do estado anterior
    this.restoreContrasteAltoJS();
    document.documentElement.style.removeProperty('filter');
    document.body.classList.remove('acc-contraste-alto');

    // 2. Aplicar novo modo
    this.updateState({ contraste: modo });

    if (modo === 'alto') {
      document.body.classList.add('acc-contraste-alto');
      requestAnimationFrame(() => this.applyContrasteAltoJS());
    }

    // 3. Sempre recompor filtro (saturacao + daltonismo + invertido se ativo)
    this.composeDocFilter();

    this.announce(`Contraste: ${modo}`);
    this.savePreferences();
  }

  private readonly SKIP_TAGS = new Set(['SCRIPT','STYLE','META','LINK','SVG','PATH','DEFS','FILTER','FECOLORMATRIX']);

  private applyContrasteAltoJS(): void {
    const els = document.querySelectorAll<HTMLElement>('*');
    for (const el of Array.from(els)) {
      if (this.SKIP_TAGS.has(el.tagName)) continue;
      if (el.closest('.acc-barra')) continue;
      if (el.hasAttribute('data-acc-orig-color')) continue; // sentinel: já aplicado

      el.setAttribute('data-acc-orig-color',  getComputedStyle(el).color);
      el.setAttribute('data-acc-orig-bg',     getComputedStyle(el).backgroundColor);
      el.setAttribute('data-acc-orig-bgi',    getComputedStyle(el).backgroundImage);
      el.setAttribute('data-acc-orig-border', getComputedStyle(el).borderColor);

      el.style.setProperty('color',            '#ffffff', 'important');
      el.style.setProperty('background-color', '#000000', 'important');
      el.style.setProperty('background-image', 'none',    'important');
      el.style.setProperty('border-color',     '#ffffff', 'important');
    }
  }

  private restoreContrasteAltoJS(): void {
    document.querySelectorAll<HTMLElement>('[data-acc-orig-color]').forEach(el => {
      el.style.removeProperty('color');
      el.style.removeProperty('background-color');
      el.style.removeProperty('background-image');
      el.style.removeProperty('border-color');
      el.removeAttribute('data-acc-orig-color');
      el.removeAttribute('data-acc-orig-bg');
      el.removeAttribute('data-acc-orig-bgi');
      el.removeAttribute('data-acc-orig-border');
    });
  }

  // ─── Saturação / Daltonismo ────────────────────────────────────────────────

  setSaturacao(modo: 'normal' | 'cinza' | 'sepia'): void {
    this.updateState({ saturacao: modo });
    this.composeDocFilter();
    this.announce(`Saturação: ${modo}`);
    this.savePreferences();
  }

  setDaltonismo(modo: 'normal' | 'protan' | 'deuter' | 'tritan'): void {
    this.updateState({ daltonismo: modo });
    this.composeDocFilter();
    this.announce(`Daltonismo: ${modo}`);
    this.savePreferences();
  }

  private composeDocFilter(): void {
    const s = this.state();
    const parts: string[] = [];

    if (s.contraste === 'invertido') {
      parts.push('invert(1) hue-rotate(180deg)');
    }

    if (s.saturacao === 'cinza') {
      parts.push('grayscale(1)');
    } else if (s.saturacao === 'sepia') {
      parts.push('sepia(0.8)');
    }

    if (s.daltonismo !== 'normal') {
      parts.push(`url(#acc-filter-${s.daltonismo})`);
    }

    const filter = parts.join(' ');
    if (filter) {
      document.documentElement.style.setProperty('filter', filter);
    } else {
      document.documentElement.style.removeProperty('filter');
    }
  }

  private injectSvgFilters(): void {
    if (document.getElementById('acc-svg-filters')) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'acc-svg-filters';
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';

    const filters: Array<{ id: string; matrix: string }> = [
      {
        id: 'acc-filter-protan',
        matrix: '0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0',
      },
      {
        id: 'acc-filter-deuter',
        matrix: '0.625,0.375,0,0,0 0.700,0.300,0,0,0 0,0.300,0.700,0,0 0,0,0,1,0',
      },
      {
        id: 'acc-filter-tritan',
        matrix: '0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0',
      },
    ];

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    for (const f of filters) {
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.id = f.id;
      const fe = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
      fe.setAttribute('type', 'matrix');
      fe.setAttribute('values', f.matrix);
      filter.appendChild(fe);
      defs.appendChild(filter);
    }

    svg.appendChild(defs);
    document.body.prepend(svg);
  }

  // ─── Espaçamento ──────────────────────────────────────────────────────────

  setLinha(nivel: 'normal' | 'media' | 'ampla'): void {
    document.body.classList.remove('acc-linha-media', 'acc-linha-ampla');
    if (nivel !== 'normal') document.body.classList.add(`acc-linha-${nivel}`);
    this.updateState({ linha: nivel });
    this.announce(`Espaço entre linhas: ${nivel}`);
    this.savePreferences();
  }

  setLetra(nivel: 'normal' | 'media' | 'ampla'): void {
    document.body.classList.remove('acc-letra-media', 'acc-letra-ampla');
    if (nivel !== 'normal') document.body.classList.add(`acc-letra-${nivel}`);
    this.updateState({ letra: nivel });
    this.announce(`Espaço entre letras: ${nivel}`);
    this.savePreferences();
  }

  // ─── Dislexia ──────────────────────────────────────────────────────────────

  toggleDislexia(): void {
    const next = !this.state().dislexia;
    if (next && !this.dyslexicLoaded) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic-regular.min.css';
      document.head.appendChild(link);
      this.dyslexicLoaded = true;
    }
    document.body.classList.toggle('acc-fonte-dislexia', next);
    this.updateState({ dislexia: next });
    this.announce(`Fonte dislexia: ${next ? 'ativada' : 'desativada'}`);
    this.savePreferences();
  }

  // ─── Cursor ────────────────────────────────────────────────────────────────

  toggleCursor(): void {
    const next = this.state().cursor === 'normal' ? 'grande' : 'normal';
    document.body.classList.toggle('acc-cursor-grande', next === 'grande');
    this.updateState({ cursor: next });
    this.announce(`Cursor grande: ${next === 'grande' ? 'ativado' : 'desativado'}`);
    this.savePreferences();
  }

  // ─── Lupa ──────────────────────────────────────────────────────────────────

  toggleLupa(): void {
    const next = !this.state().lupa;
    this.updateState({ lupa: next });

    if (next) {
      let last = 0;
      this.lupaMoveHandler = (e: MouseEvent) => {
        const now = Date.now();
        if (now - last < 16) return;
        last = now;
        const bubble = document.getElementById('acc-lupa-bubble');
        if (!bubble) return;
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target || target === bubble || bubble.contains(target)) return;

        const SEMANTIC_TAGS = new Set([
          'H1','H2','H3','H4','H5','H6','P','A','BUTTON','NAV','MAIN',
          'SECTION','ARTICLE','ASIDE','HEADER','FOOTER','UL','OL','LI','TABLE',
        ]);
        let el: Element | null = target;
        let tag = '';
        while (el && el !== document.body) {
          if (SEMANTIC_TAGS.has(el.tagName)) { tag = el.tagName.toLowerCase(); break; }
          el = el.parentElement;
        }

        bubble.textContent = tag || '';
        bubble.style.left = `${e.pageX + 16}px`;
        bubble.style.top  = `${e.pageY + 16}px`;
        bubble.style.display = tag ? 'block' : 'none';
      };
      document.addEventListener('mousemove', this.lupaMoveHandler);
    } else {
      if (this.lupaMoveHandler) {
        document.removeEventListener('mousemove', this.lupaMoveHandler);
        this.lupaMoveHandler = null;
      }
      const bubble = document.getElementById('acc-lupa-bubble');
      if (bubble) bubble.style.display = 'none';
    }

    this.announce(`Lupa: ${next ? 'ativada' : 'desativada'}`);
    this.savePreferences();
  }

  // ─── Links ─────────────────────────────────────────────────────────────────

  toggleLinks(): void {
    const next = !this.state().linksDestacados;
    document.body.classList.toggle('acc-links-destacados', next);
    this.updateState({ linksDestacados: next });
    this.announce(`Links destacados: ${next ? 'ativado' : 'desativado'}`);
    this.savePreferences();
  }

  // ─── Máscara ───────────────────────────────────────────────────────────────

  toggleMascara(): void {
    const next = !this.state().mascara;
    this.updateState({ mascara: next });

    if (next) {
      this.mascaraMoveHandler = (e: MouseEvent) => {
        const top    = document.getElementById('acc-mascara-top');
        const bottom = document.getElementById('acc-mascara-bottom');
        if (!top || !bottom) return;
        const y = e.clientY;
        top.style.height    = `${Math.max(0, y - 45)}px`;
        bottom.style.top    = `${y + 45}px`;
        bottom.style.height = `${Math.max(0, window.innerHeight - y - 45)}px`;
      };
      document.addEventListener('mousemove', this.mascaraMoveHandler);
    } else {
      if (this.mascaraMoveHandler) {
        document.removeEventListener('mousemove', this.mascaraMoveHandler);
        this.mascaraMoveHandler = null;
      }
    }

    this.announce(`Máscara: ${next ? 'ativada' : 'desativada'}`);
    this.savePreferences();
  }

  // ─── Guia ──────────────────────────────────────────────────────────────────

  toggleGuia(): void {
    const next = !this.state().guia;
    this.updateState({ guia: next });

    if (next) {
      this.guiaMoveHandler = (e: MouseEvent) => {
        const guia = document.getElementById('acc-guia');
        if (guia) guia.style.top = `${e.clientY}px`;
      };
      document.addEventListener('mousemove', this.guiaMoveHandler);
    } else {
      if (this.guiaMoveHandler) {
        document.removeEventListener('mousemove', this.guiaMoveHandler);
        this.guiaMoveHandler = null;
      }
    }

    this.announce(`Guia: ${next ? 'ativada' : 'desativada'}`);
    this.savePreferences();
  }

  // ─── Reset ─────────────────────────────────────────────────────────────────

  resetAll(): void {
    // 1. Restaurar overrides de contraste (incondicionalmente — limpa data attrs residuais)
    this.restoreContrasteAltoJS();

    // 2. Remover todas as classes do body
    document.body.classList.remove(
      'acc-contraste-alto', 'acc-fonte-dislexia',
      'acc-linha-media', 'acc-linha-ampla',
      'acc-letra-media', 'acc-letra-ampla',
      'acc-links-destacados', 'acc-cursor-grande',
    );

    // 3. Remover filtros do html
    document.documentElement.style.removeProperty('filter');

    // 4. Resetar fontes via querySelectorAll (pega tudo, incluindo dinâmicos)
    this.resetFonts();

    // 5. Remover todos os handlers de mousemove
    if (this.lupaMoveHandler)    { document.removeEventListener('mousemove', this.lupaMoveHandler);    this.lupaMoveHandler    = null; }
    if (this.mascaraMoveHandler) { document.removeEventListener('mousemove', this.mascaraMoveHandler); this.mascaraMoveHandler = null; }
    if (this.guiaMoveHandler)    { document.removeEventListener('mousemove', this.guiaMoveHandler);    this.guiaMoveHandler    = null; }

    // 6. Esconder overlays
    ['acc-lupa-bubble', 'acc-mascara-top', 'acc-mascara-bottom', 'acc-guia'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.cssText = '';
    });

    // 7. Resetar estado e localStorage
    localStorage.removeItem(this.STORAGE_KEY);
    this.state.set(this.defaultState());
    this.announce('Preferências de acessibilidade restauradas ao padrão.');
  }

  // ─── Painel ────────────────────────────────────────────────────────────────

  openPanel():  void { this.panelOpen.set(true); }
  closePanel(): void { this.panelOpen.set(false); }
  togglePanel(): void { this.panelOpen.update(v => !v); }

  // ─── Persistência ─────────────────────────────────────────────────────────

  private savePreferences(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state()));
    } catch { /* quota exceeded — ignore */ }
  }

  private loadPreferences(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<AccessibilityState>;
      const merged: AccessibilityState = { ...this.defaultState(), ...saved };
      this.suppressAnnounce = true;
      this.applyFullState(merged);
      this.suppressAnnounce = false;
    } catch { /* malformed JSON — ignore */ }
  }

  private applyFullState(s: AccessibilityState): void {
    this.state.set(s);

    if (s.fontLevel !== 0) {
      const scale = this.FONT_SCALES[s.fontLevel + 1];
      this.scaleFonts(scale);
    }
    if (s.contraste === 'alto') {
      document.body.classList.add('acc-contraste-alto');
      this.applyContrasteAltoJS();
    }
    this.composeDocFilter();

    if (s.linha !== 'normal')  { document.body.classList.add(`acc-linha-${s.linha}`); }
    if (s.letra !== 'normal')  { document.body.classList.add(`acc-letra-${s.letra}`); }
    if (s.dislexia)            { document.body.classList.add('acc-fonte-dislexia'); }
    if (s.cursor === 'grande') { document.body.classList.add('acc-cursor-grande'); }
    if (s.linksDestacados)     { document.body.classList.add('acc-links-destacados'); }
    if (s.lupa)    { this.updateState({ lupa:    false }); this.toggleLupa(); }
    if (s.mascara) { this.updateState({ mascara: false }); this.toggleMascara(); }
    if (s.guia)    { this.updateState({ guia:    false }); this.toggleGuia(); }
  }

  // ─── MutationObserver ─────────────────────────────────────────────────────

  private initMutationObserver(): void {
    let pendingNodes: Node[] = [];
    let timer: ReturnType<typeof setTimeout>;

    this.mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(m => m.addedNodes.forEach(n => pendingNodes.push(n)));
      clearTimeout(timer);
      timer = setTimeout(() => {
        const nodes = pendingNodes.splice(0);
        const s = this.state();
        if (s.fontLevel !== 0 && this.fontEls !== null) {
          this.extendFontCache(nodes);
        }
        if (s.contraste === 'alto') {
          this.applyContrasteAltoJS();
        }
      }, 250);
    });

    this.mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private defaultState(): AccessibilityState {
    return { ...DEFAULT_STATE };
  }

  private updateState(patch: Partial<AccessibilityState>): void {
    this.state.update(s => ({ ...s, ...patch }));
  }

  announce(msg: string): void {
    if (this.suppressAnnounce) return;
    const el = document.getElementById('acc-announcer');
    if (!el) return;
    el.textContent = '';
    setTimeout(() => { el.textContent = msg; }, 50);
  }
}
