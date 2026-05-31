const { chromium } = require('playwright');

const BASE = 'http://localhost:4300';
const results = [];

function log(test, status, detail) {
  detail = detail || '';
  results.push({ test, status, detail });
  console.log((status === 'PASS' ? '✅' : '❌') + ' ' + test + (detail ? ' — ' + detail : ''));
}

async function login(page) {
  await page.goto(BASE + '/#/login');
  await page.waitForSelector('input[type="password"]', { timeout: 8000 });
  await page.locator('input').first().fill('miguel@lms.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/#\/(dashboard|admin)/, { timeout: 10000 });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', function(msg) { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  // LOGIN
  try { await login(page); log('Login admin', 'PASS'); }
  catch (e) { log('Login admin', 'FAIL', e.message); await browser.close(); return; }

  // ROTAS carregam sem 404 nem redirect para login
  const adminRoutes = [
    ['/#/admin/dashboard','Dashboard Admin'],
    ['/#/admin/cursos','Admin Cursos'],
    ['/#/admin/usuarios','Admin Usuarios'],
    ['/#/admin/regioes','Admin Regioes'],
    ['/#/admin/professores','Admin Professores'],
    ['/#/professor/cursos','Professor Cursos'],
    ['/#/dashboard','Dashboard Aluno'],
    ['/#/matriculas','Minhas Matriculas'],
  ];
  for (let i = 0; i < adminRoutes.length; i++) {
    const path = adminRoutes[i][0];
    const label = adminRoutes[i][1];
    try {
      await page.goto(BASE + path);
      await page.waitForLoadState('networkidle', { timeout: 12000 });
      const url = page.url();
      if (url.includes('/login')) { log('Rota ' + label, 'FAIL', 'Guard bloqueou'); continue; }
      log('Rota ' + label + ' carrega', 'PASS');
    } catch (e) { log('Rota ' + label, 'FAIL', e.message); }
  }

  // ADMIN CURSOS — dados carregam
  await page.goto(BASE + '/#/admin/cursos');
  await page.waitForLoadState('networkidle', { timeout: 12000 });
  await page.waitForTimeout(800);

  // Selector exato: p com text-gray-500 text-sm mt-1 contendo "curso(s)"
  try {
    const subtitulo = await page.$eval('p.text-gray-500.text-sm, p.text-gray-500', function(el) { return el.textContent.trim(); });
    const numMatch = subtitulo.match(/(\d+)/);
    const n = numMatch ? parseInt(numMatch[1]) : 0;
    log('Admin Cursos — ' + n + ' curso(s) listado(s)', n > 0 ? 'PASS' : 'FAIL', subtitulo);
  } catch(e) {
    // Fallback: procura qualquer p que contenha "curso"
    try {
      const allP = await page.$$eval('p', function(els) { return els.map(function(e) { return e.textContent.trim(); }); });
      const cursoP = allP.find(function(t) { return /\d+\s*curso/i.test(t); });
      const n = cursoP ? parseInt(cursoP.match(/(\d+)/)[1]) : 0;
      log('Admin Cursos — ' + n + ' curso(s) listado(s)', n > 0 ? 'PASS' : 'FAIL', cursoP || 'nenhum p encontrado');
    } catch(e2) { log('Admin Cursos — cursos listados', 'FAIL', e2.message); }
  }

  // Form criação
  await page.click('button:has-text("Novo")');
  await page.waitForTimeout(800);
  const form = await page.$('form');
  log('Admin Cursos — form criacao abre', form ? 'PASS' : 'FAIL');
  if (form) {
    const cancelBtn = await page.$('button:has-text("Cancelar"), button:has-text("Fechar")');
    if (cancelBtn) await cancelBtn.click();
    else await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  log('Admin Cursos — botao Editar', await page.$('button:has-text("Editar")') ? 'PASS' : 'FAIL');
  log('Admin Cursos — botao Excluir', await page.$('button:has-text("Excluir")') ? 'PASS' : 'FAIL');
  log('Admin Cursos — botao Alunos e Notas', await page.$('button:has-text("Alunos")') ? 'PASS' : 'FAIL');

  // ADMIN USUARIOS
  await page.goto(BASE + '/#/admin/usuarios');
  await page.waitForLoadState('networkidle', { timeout: 12000 });
  await page.waitForTimeout(800);

  try {
    const allP = await page.$$eval('p', function(els) { return els.map(function(e) { return e.textContent.trim(); }); });
    const usuP = allP.find(function(t) { return /\d+.*usu[aá]rio/i.test(t); });
    const n = usuP ? parseInt(usuP.match(/(\d+)/)[1]) : 0;
    log('Admin Usuarios — ' + n + ' usuario(s) listado(s)', n > 0 ? 'PASS' : 'FAIL', usuP || 'nao encontrado');
  } catch(e) { log('Admin Usuarios — usuarios listados', 'FAIL', e.message); }

  log('Admin Usuarios — botao Editar', await page.$('button:has-text("Editar")') ? 'PASS' : 'FAIL');
  log('Admin Usuarios — botao Novo', await page.$('button:has-text("Novo")') ? 'PASS' : 'FAIL');

  // ADMIN REGIOES
  await page.goto(BASE + '/#/admin/regioes');
  await page.waitForLoadState('networkidle', { timeout: 12000 });
  await page.waitForTimeout(800);

  const panels = await page.$$('mat-expansion-panel');
  log('Admin Regioes — ' + panels.length + ' regioes', panels.length > 0 ? 'PASS' : 'FAIL');

  if (panels.length > 0) {
    await panels[0].click();
    await page.waitForTimeout(1000);
    // Checa se o panel tem classe mat-expanded (Angular Material coloca quando aberto)
    const expanded = await page.$('mat-expansion-panel.mat-expanded');
    log('Admin Regioes — painel expande (mat-expanded)', expanded ? 'PASS' : 'FAIL');
  }
  log('Admin Regioes — botao Nova Regiao', await page.$('button:has-text("Nova"), button:has-text("Adicionar"), button:has-text("Criar")') ? 'PASS' : 'FAIL');

  // ADMIN PROFESSORES
  await page.goto(BASE + '/#/admin/professores');
  await page.waitForLoadState('networkidle', { timeout: 12000 });
  await page.waitForTimeout(800);

  try {
    const allP = await page.$$eval('p', function(els) { return els.map(function(e) { return e.textContent.trim(); }); });
    const profP = allP.find(function(t) { return /\d+.*professor/i.test(t); });
    const n = profP ? parseInt(profP.match(/(\d+)/)[1]) : 0;
    log('Admin Professores — ' + n + ' professor(es)', n > 0 ? 'PASS' : 'FAIL', profP || 'nao encontrado');
  } catch(e) { log('Admin Professores — professores listados', 'FAIL', e.message); }

  // SIDEBAR
  await page.goto(BASE + '/#/admin/cursos');
  await page.waitForLoadState('networkidle');
  const sidebarLinks = ['admin/dashboard','admin/cursos','admin/usuarios','admin/regioes','admin/professores'];
  for (let i = 0; i < sidebarLinks.length; i++) {
    const href = sidebarLinks[i];
    const el = await page.$('a[href*="' + href + '"]');
    log('Sidebar link /' + href, el ? 'PASS' : 'FAIL');
  }

  // REDIRECT sem auth — usa contexto limpo (sem cookies/localStorage)
  const freshCtx = await browser.newContext();
  const freshPage = await freshCtx.newPage();
  await freshPage.goto(BASE + '/#/admin/cursos');
  await freshPage.waitForTimeout(1500);
  log('Rota protegida sem auth -> login', freshPage.url().includes('/login') ? 'PASS' : 'FAIL', freshPage.url());
  await freshCtx.close();

  // WILDCARD
  await page.goto(BASE + '/#/rota-inexistente-xyz');
  await page.waitForTimeout(800);
  // Para usuario logado: ** -> /home -> /dashboard (HomeComponent redireciona logado)
  log('Rota inexistente -> home/dashboard/login', (page.url().includes('/home') || page.url().includes('/login') || page.url().includes('/dashboard')) ? 'PASS' : 'FAIL', page.url());

  // CONSOLE ERRORS
  const relevant = consoleErrors.filter(function(e) { return !e.includes('favicon') && !e.includes('DevTools'); });
  log('Console — ' + relevant.length + ' erro(s)', relevant.length === 0 ? 'PASS' : 'FAIL',
    relevant.slice(0,3).join(' | '));

  const passed = results.filter(function(r) { return r.status === 'PASS'; }).length;
  const failed = results.filter(function(r) { return r.status === 'FAIL'; }).length;
  console.log('\nRESULTADO FINAL: ' + passed + ' PASS | ' + failed + ' FAIL');
  if (failed > 0) {
    results.filter(function(r) { return r.status === 'FAIL'; })
      .forEach(function(r) { console.log('  FAIL: ' + r.test + (r.detail ? ': ' + r.detail : '')); });
  }

  await browser.close();
})();
