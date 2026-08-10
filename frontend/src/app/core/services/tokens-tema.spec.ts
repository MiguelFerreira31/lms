import { describe, it, expect } from 'vitest';

/**
 * Auditoria estática: garante que a interface continua governada pelos tokens
 * de tema.
 *
 * Uma cor fixa reintroduzida num template não quebra nada visivelmente no modo
 * claro — ela só deixa de responder à página de Aparência e vira uma mancha
 * errada no escuro. É uma regressão silenciosa, e por isso vale um teste.
 *
 * Os módulos são carregados via `import.meta.glob` como texto cru, o que
 * dispensa acesso a disco e funciona igual no CI.
 */

// `import.meta.glob` é do Vite (que roda por baixo do Vitest) e não faz parte
// do tipo padrão de ImportMeta, daí a declaração local.
interface ImportMetaComGlob extends ImportMeta {
  glob(
    padrao: string,
    opcoes: { query: string; import: string; eager: true },
  ): Record<string, string>;
}

const ARQUIVOS = (import.meta as ImportMetaComGlob).glob('/src/app/**/*.{html,ts}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Arquivos que legitimamente contêm cor literal. */
const ISENTOS = [
  // define os próprios valores padrão dos tokens
  'core/services/tema.service.ts',
  // o alto contraste precisa de preto/branco absolutos, por definição
  'accessibility/accessibility.service.ts',
  'accessibility/color-manager.ts',
  // a prévia da página de Aparência pinta com o modo em edição, não com o ativo
  'features/aparencia/',
  // specs
  '.spec.ts',
];

function relevantes(): [string, string][] {
  return Object.entries(ARQUIVOS).filter(
    ([caminho]) => !ISENTOS.some(isento => caminho.includes(isento)),
  );
}

/** Reporta "arquivo:trecho" para a mensagem de falha ser acionável. */
function ocorrencias(regex: RegExp): string[] {
  const achados: string[] = [];
  for (const [caminho, conteudo] of relevantes()) {
    for (const m of conteudo.matchAll(regex)) {
      achados.push(`${caminho.replace('/src/app/', '')}: ${m[0]}`);
    }
  }
  return achados;
}

describe('tokens de tema — auditoria da interface', () => {
  it('nenhuma cor hex literal fora dos arquivos isentos', () => {
    // Cores de marca cravadas foram o que impedia a página de Aparência de
    // funcionar antes da migração.
    const achados = ocorrencias(/#[0-9A-Fa-f]{6}\b/g);
    expect(achados, `cores fixas encontradas:\n${achados.join('\n')}`).toEqual([]);
  });

  it('nenhuma classe arbitrária bg-[#...] / text-[#...]', () => {
    const achados = ocorrencias(
      /\b(?:bg|text|border|from|to|via|ring|fill|stroke)-\[#[0-9A-Fa-f]{3,8}\]/g);
    expect(achados, `classes arbitrárias:\n${achados.join('\n')}`).toEqual([]);
  });

  it('superfícies e texto principais usam tokens, não a paleta fixa', () => {
    // bg-white/text-gray-900 não acompanham o modo escuro: virariam um cartão
    // branco no meio de uma tela escura.
    const achados = ocorrencias(
      /(?<![\w:/-])(?:bg-white|bg-gray-50|bg-slate-50|text-gray-900|text-slate-900|border-gray-100|border-gray-200)(?![\w/-])/g);
    expect(achados, `paleta fixa em papel de superfície/texto:\n${achados.join('\n')}`).toEqual([]);
  });

  it('hovers de ação usam tokens', () => {
    // O hover é o estado mais fácil de esquecer numa migração de tema — e o
    // mais visível quando erra, porque só aparece na interação.
    const achados = ocorrencias(
      /hover:(?:bg|text|border)-(?:indigo|violet)-\d+/g);
    expect(achados, `hovers de marca fora do tema:\n${achados.join('\n')}`).toEqual([]);
  });

  it('o Chart.js do dashboard resolve as cores a partir dos tokens', () => {
    // Canvas não herda CSS: se as cores voltarem a ser literais, os gráficos
    // ficam ilegíveis no escuro sem nenhum erro aparecer.
    const dashboard = ARQUIVOS['/src/app/features/admin/dashboard/admin-dashboard.component.ts'];
    expect(dashboard).toBeDefined();
    expect(dashboard).toContain('corTema(');
    expect(dashboard).not.toMatch(/#[0-9A-Fa-f]{6}/);
    expect(dashboard).not.toMatch(/rgba\(\d+,\s*\d+,\s*\d+/);
  });
});
