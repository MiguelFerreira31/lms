import { test, expect } from '@playwright/test';
import { coletarErrosDeConsole } from './apoio';

/**
 * Widget de acessibilidade — o diferencial do projeto e a parte mais sensível
 * ao zoneless: ele registra handlers de `mousemove` (lupa, máscara e guia de
 * leitura) e mantém um `MutationObserver` sobre o `document.body`. Com zone.js
 * cada movimento do mouse disparava um ciclo de verificação da aplicação
 * inteira; sem ele, o widget precisa continuar funcionando por conta própria.
 */
test.describe('widget de acessibilidade', () => {
  test('abre o painel e aplica aumento de fonte, persistindo em localStorage', async ({ page }) => {
    const erros = coletarErrosDeConsole(page);

    await page.goto('/home');

    const toggle = page.locator('#acc-toggle');
    await expect(toggle).toBeVisible({ timeout: 15_000 });

    await toggle.click();
    await expect(page.locator('#acc-painel')).toBeVisible();

    // O widget escala a fonte dos elementos de texto da página, não a raiz.
    const alvo = page.locator('h1, h2, p').first();
    const antes = await alvo.evaluate(el => getComputedStyle(el).fontSize);

    const aumentar = page.getByRole('button', { name: /aumentar fonte/i });
    await expect(aumentar).toBeVisible();
    await aumentar.click();

    await expect
      .poll(() => alvo.evaluate(el => getComputedStyle(el).fontSize), { timeout: 5_000 })
      .not.toBe(antes);

    // a preferência precisa sobreviver a um reload
    const salvo = await page.evaluate(() => localStorage.getItem('acessibilidade_prefs'));
    expect(salvo).toBeTruthy();
    expect(JSON.parse(salvo!).fontLevel).toBeGreaterThan(0);

    expect(erros).toEqual([]);
  });

  test('fecha o painel com Escape', async ({ page }) => {
    await page.goto('/home');

    const toggle = page.locator('#acc-toggle');
    await expect(toggle).toBeVisible({ timeout: 15_000 });
    await toggle.click();
    await expect(page.locator('#acc-painel')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('#acc-painel')).toBeHidden();
  });

  test('o widget do VLibras é montado sem o pacote angular-vlibras', async ({ page }) => {
    await page.goto('/home');

    // A marcação [vw] é o que o plugin do gov.br procura. Ela agora vem do
    // VlibrasWidgetComponent local, montado em afterNextRender.
    await expect(page.locator('div[vw]')).toHaveCount(1, { timeout: 15_000 });
    await expect(page.locator('div[vw-access-button]')).toHaveCount(1);
  });
});
