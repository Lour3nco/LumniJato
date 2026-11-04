import type { ErroEsperado } from './erros';

/**
 * Resultado de uma operação que pode falhar por regra de negócio, sem usar exceção.
 * Útil quando o chamador precisa decidir caso a caso (ex.: a sincronização, que devolve o
 * resultado por operação).
 */
export type Resultado<T, E extends ErroEsperado = ErroEsperado> =
  | { readonly ok: true; readonly valor: T }
  | { readonly ok: false; readonly erro: E };

export const Resultado = {
  sucesso<T>(valor: T): Resultado<T, never> {
    return { ok: true, valor };
  },
  falha<E extends ErroEsperado>(erro: E): Resultado<never, E> {
    return { ok: false, erro };
  },
  /** Devolve o valor ou lança o erro (para quem prefere exceção). */
  obter<T, E extends ErroEsperado>(resultado: Resultado<T, E>): T {
    if (resultado.ok) return resultado.valor;
    throw resultado.erro;
  },
};
