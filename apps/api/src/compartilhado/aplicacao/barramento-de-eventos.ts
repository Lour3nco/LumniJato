import type { EventoDeDominio } from '../dominio/evento-de-dominio';

export type ManipuladorDeEvento<E extends EventoDeDominio = EventoDeDominio> = (evento: E) => Promise<void> | void;

/**
 * Porta do barramento interno de eventos (03-arquitetura §9.4). Dois tipos de manipulador:
 *
 * - **na transação** (`assinarNaTransacao`): roda dentro da unidade de trabalho, ANTES do
 *   commit, com a mesma conexão. Se falhar, tudo é desfeito. É onde entra o gravador de
 *   histórico (FIN-US-01.5: "histórico na mesma transação").
 * - **depois do commit** (`assinar`): avisos para outros módulos; uma falha não desfaz o que
 *   já foi gravado. No MVP é em memória; com o primeiro consumidor externo entra a outbox.
 */
export abstract class BarramentoDeEventos {
  abstract assinar(nomeDoEvento: string, manipulador: ManipuladorDeEvento): void;
  abstract assinarNaTransacao(nomeDoEvento: string, manipulador: ManipuladorDeEvento): void;

  /** Chamado pela unidade de trabalho antes do commit; um erro aqui desfaz a transação. */
  abstract publicarNaTransacao(eventos: readonly EventoDeDominio[]): Promise<void>;
  /** Chamado pela unidade de trabalho depois do commit. */
  abstract publicar(eventos: readonly EventoDeDominio[]): Promise<void>;
}
