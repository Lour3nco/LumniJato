import type { EventoDeDominio } from '../dominio/evento-de-dominio';

export type ManipuladorDeEvento<E extends EventoDeDominio = EventoDeDominio> = (evento: E) => Promise<void> | void;

/**
 * Porta do barramento interno de eventos (03-arquitetura §9.4). No MVP é em memória; quando
 * surgir o primeiro módulo consumidor, entra uma tabela de saída (outbox).
 */
export abstract class BarramentoDeEventos {
  abstract assinar(nomeDoEvento: string, manipulador: ManipuladorDeEvento): void;
  abstract publicar(eventos: readonly EventoDeDominio[]): Promise<void>;
}
