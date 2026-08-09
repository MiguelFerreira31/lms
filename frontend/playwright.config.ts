import { defineConfig, devices } from '@playwright/test';

/**
 * Testes end-to-end.
 *
 * Pressupõem backend em :8080 (com o Postgres do docker-compose) e sobem o
 * frontend sozinhos. Rodam em série: os cenários de admin escrevem no banco
 * compartilhado, então paralelizar geraria interferência entre eles.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx ng serve --port 4200',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
