import { vi } from 'vitest';

/**
 * Equivalente ao `jasmine.SpyObj<T>`: só os métodos viram mocks, o resto do
 * tipo é preservado.
 */
export type Mocked<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? ReturnType<typeof vi.fn<(...args: A) => R>>
    : T[K];
};

/**
 * Substitui `jasmine.createSpyObj('Nome', ['metodo'])`, que não existe no
 * Vitest. Cria um objeto com os métodos pedidos já mockados.
 *
 * O primeiro argumento do Jasmine era só um rótulo para mensagens de erro e
 * não tem equivalente aqui, então foi omitido.
 */
export function criarMock<T>(metodos: readonly (keyof T)[]): Mocked<T> {
  const mock = {} as Mocked<T>;
  for (const metodo of metodos) {
    (mock as Record<PropertyKey, unknown>)[metodo as PropertyKey] = vi.fn();
  }
  return mock;
}
