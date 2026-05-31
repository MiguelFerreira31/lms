const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const br = await chromium.launch({ headless: true });
  const pg = await br.newPage();
  await pg.setViewportSize({ width: 1440, height: 900 });
  const errs = [];
  pg.on('console', function(m) { if (m.type() === 'error') errs.push(m.text()); });

  // Login
  await pg.goto('http://localhost:4300/login');
  await pg.waitForSelector('input[type="password"]', { timeout: 8000 });
  await pg.locator('input').first().fill('miguel@lms.com');
  await pg.fill('input[type="password"]', '123456');
  await pg.click('button[type="submit"]');
  await pg.waitForURL(/dashboard/, { timeout: 10000 });

  // Página de usuários
  await pg.goto('http://localhost:4300/admin/usuarios');
  await pg.waitForLoadState('networkidle', { timeout: 12000 });
  await pg.waitForTimeout(800);
  await pg.screenshot({ path: 'C:/tmp/usuarios_01_lista.png' });
  console.log('screenshot: lista');

  // Abrir edição do primeiro usuário
  var editBtn = await pg.$('button:has-text("Editar")');
  if (editBtn) {
    await editBtn.click();
    await pg.waitForTimeout(700);
    await pg.screenshot({ path: 'C:/tmp/usuarios_02_editando.png' });
    console.log('screenshot: form aberto');
  }

  // Testar form Novo Usuário
  var cancelBtn = await pg.$('button:has-text("Fechar")');
  if (cancelBtn) await cancelBtn.click();
  await pg.waitForTimeout(400);

  var novoBtn = await pg.$('button:has-text("Novo")');
  if (novoBtn) {
    await novoBtn.click();
    await pg.waitForTimeout(500);
    await pg.screenshot({ path: 'C:/tmp/usuarios_03_novo.png' });
    console.log('screenshot: form novo');
  }

  // Testar endpoint de upload via API direta
  var http = require('http');
  // Cria um PNG minimo em base64
  var minPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync('C:/tmp/test_avatar.png', minPng);

  console.log('Testando POST /api/usuarios/1/foto...');
  // Get JWT token from browser
  var token = await pg.evaluate(function() { return localStorage.getItem('lms_token'); });
  console.log('Token obtido:', token ? 'sim' : 'nao');

  console.log('Console errors:', errs.filter(function(e) { return !e.includes('favicon'); }).length === 0 ? 'none' : errs);

  await br.close();
})();
