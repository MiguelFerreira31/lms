import { Page, expect } from '@playwright/test';

export const API = 'http://localhost:8080/api';

export const ADMIN = { email: 'miguel@lms.com', senha: '123456' };

export interface Sessao {
  token: string;
  nome: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

async function api(caminho: string, init: RequestInit = {}) {
  return fetch(`${API}${caminho}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
}

/** Autentica direto na API — o formulário de login tem teste próprio. */
export async function autenticar(email = ADMIN.email, senha = ADMIN.senha): Promise<Sessao> {
  const r = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
  if (!r.ok) {
    throw new Error(`Login falhou (${r.status}) para ${email}. A conta existe no banco?`);
  }
  return r.json();
}

/**
 * Cria um usuário com a role pedida e devolve a sessão dele.
 *
 * Forjar a role no localStorage não funciona — e isso é o app se comportando
 * corretamente: o `AuthService` revalida o usuário em `/api/usuarios/me` logo
 * após o boot, e o backend é a fonte da verdade. Então os cenários de
 * permissão precisam de usuários de verdade.
 */
export async function criarUsuarioComRole(role: 'ALUNO' | 'PROFESSOR' | 'ADMIN'): Promise<Sessao> {
  const admin = await autenticar();
  const email = `e2e.${role.toLowerCase()}.${Date.now()}@lms.com`;
  const senha = 'senha12345';

  const criado = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nome: `E2E ${role}`, email, senha }),
  });
  if (!criado.ok) throw new Error(`Falha ao registrar ${email}: ${criado.status}`);
  const usuario = await criado.json();

  if (role !== 'ALUNO') {
    const promovido = await api(`/usuarios/${usuario.id}/role`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${admin.token}` },
      body: JSON.stringify({ role }),
    });
    if (!promovido.ok) throw new Error(`Falha ao promover para ${role}: ${promovido.status}`);
  }

  return autenticar(email, senha);
}

/** Injeta a sessão do mesmo jeito que o AuthService faz após o login. */
export async function entrarComo(page: Page, sessao: Sessao) {
  await page.goto('/');
  await page.evaluate(s => {
    localStorage.setItem('lms_token', s.token);
    localStorage.setItem('lms_user', JSON.stringify(s));
  }, sessao);
}

/** Acumula erros de console e de página para asserção no fim do teste. */
export function coletarErrosDeConsole(page: Page): string[] {
  const erros: string[] = [];
  page.on('console', m => {
    if (m.type() === 'error') erros.push(m.text());
  });
  page.on('pageerror', e => erros.push(String(e)));
  return erros;
}

/** O guard manda para /dashboard, que não pode ser confundido com /admin/dashboard. */
export async function esperarBloqueio(page: Page) {
  await expect(page).toHaveURL(/localhost:4200\/dashboard$/, { timeout: 15_000 });
}
