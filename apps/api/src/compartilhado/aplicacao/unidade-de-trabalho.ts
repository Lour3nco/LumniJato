import type { EventoDeDominio } from '../dominio/evento-de-dominio';

/**
 * Porta da unidade de trabalho: tudo o que o caso de uso grava dentro de `executar` vai numa
 * transação só (ou tudo, ou nada — CA-01.12.4). Os eventos registrados com
 * `registrarEventos` são despachados só depois do commit (03-arquitetura §9.4).
 *
 * A implementação fica na infraestrutura; os repositórios usam a transação aberta sem que o
 * caso de uso precise conhecer o banco.
 */
export abstract class UnidadeDeTrabalho {
  abstract executar<T>(trabalho: () => Promise<T>): Promise<T>;

  /** Guarda eventos para despachar depois do commit. Fora de `executar`, lança erro. */
  abstract registrarEventos(eventos: readonly EventoDeDominio[]): void;
}
