const { chromium } = require('playwright');

const BASE = 'http://localhost:4300';
const results = [];

function log(test, status, detail) {
  detail = detail || '';
  results.push({ test, status, detail });
  console.log((status === 'PASS' ? '✅' : '❌') + ' ' + test + (detail ? ' — ' + detail : ''));
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Test 1: URLs sem # — acesso direto (simula refresh / F5)
  const cleanRoutes = [
    ['/admin/cursos', 'Admin Cursos — URL limpa direta'],
    ['/admin/usuarios', 'Admin Usuarios — URL limpa direta'],
    ['/admin/dashboard', 'Admin Dashboard — URL limpa direta'],
    ['/admin/regioes', 'Admin Regioes — URL limpa direta'],
    ['/admin/professores', 'Admin Professores — URL limpa direta'],
    ['/dashboard', 'Dashboard — URL limpa direta'],
    ['/login', 'Login — URL limpa direta'],
  ];

  for (let i = 0; i < cleanRoutes.length; i++) {
    const path = cleanRoutes[i][0];
    const label = cleanRoutes[i][1];
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    try {
      await page.goto(BASE + path);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      const url = page.url();
      const has404 = (await page.textContent('body')).includes('File not found');
      const hasHash = url.includes('/#/');
      if (has404) { log(label, 'FAIL', '404'); }
      else if (hasHash) { log(label, 'FAIL', 'Redirecionou para URL com #: ' + url); }
      else { log(label, 'PASS', url); }
    } catch (e) { log(label, 'FAIL', e.message); }
    await ctx.close();
  }

  // Test 2: login e navegar com URLs limpas (sem #)
  const ctx2 = await browser.newContext();
  const page2 = await ctx2.newPage();
  const errs = [];
  page2.on('console', function(m) { if (m.type() === 'error') errs.push(m.text()); });

  await page2.goto(BASE + '/login');
  await page2.waitForSelector('input[type="password"]', { timeout: 8000 });
  await page2.locator('input').first().fill('miguel@lms.com');
  await page2.fill('input[type="password"]', '123456');
  await page2.click('button[type="submit"]');
  await page2.waitForLoadState('networkidle', { timeout: 10000 });
  const afterLogin = page2.url();
  log('Login — URL pós-login sem #', !afterLogin.includes('/#/') ? 'PASS' : 'FAIL', afterLogin);

  // Navegar via sidebar
  await page2.goto(BASE + '/admin/cursos');
  await page2.waitForLoadState('networkidle', { timeout: 10000 });
  const cursoUrl = page2.url();
  log('Admin Cursos via URL direta (logado)', cursoUrl.includes('/admin/cursos') && !cursoUrl.includes('/#/') ? 'PASS' : 'FAIL', cursoUrl);

  // Simula F5 (reload)
  await page2.reload();
  await page2.waitForLoadState('networkidle', { timeout: 10000 });
  const afterReload = page2.url();
  log('F5 em /admin/cursos — permanece na rota', afterReload.includes('/admin/cursos') && !afterReload.includes('/#/') ? 'PASS' : 'FAIL', afterReload);

  // Rota inexistente
  await page2.goto(BASE + '/xyz-nao-existe');
  await page2.waitForLoadState('networkidle', { timeout: 8000 });
  log('Rota inexistente — sem 404', !(await page2.textContent('body')).includes('File not found') ? 'PASS' : 'FAIL', page2.url());

  // Guard sem auth
  const ctx3 = await browser.newContext();
  const pg3 = await ctx3.newPage();
  await pg3.goto(BASE + '/admin/cursos');
  await pg3.waitForTimeout(1500);
  log('Guard: /admin/cursos sem auth -> /login', pg3.url().includes('/login') ? 'PASS' : 'FAIL', pg3.url());
  await ctx3.close();

  log('Console errors', errs.filter(function(e) { return !e.includes('favicon'); }).length === 0 ? 'PASS' : 'FAIL',
    errs.filter(function(e) { return !e.includes('favicon'); }).slice(0,2).join(' | '));

  const passed = results.filter(function(r) { return r.status === 'PASS'; }).length;
  const failed = results.filter(function(r) { return r.status === 'FAIL'; }).length;
  console.log('\nRESULTADO: ' + passed + ' PASS | ' + failed + ' FAIL');
  if (failed > 0) results.filter(function(r) { return r.status === 'FAIL'; })
    .forEach(function(r) { console.log('  FAIL: ' + r.test + ' — ' + r.detail); });

  await ctx2.close();
  await browser.close();
})();
