import { EventoDeDominio } from '../../../../compartilhado/dominio/evento-de-dominio';
import type { EstadoDoLancamento } from './estado';

/**
 * Eventos do agregado Lancamento (03-arquitetura §9.4 e §6.2). Levam o estado antes/depois
 * para o gravador de histórico (FIN-US-01.5) montar `lancamento_historico` na mesma transação.
 */

/** Quem fez, de qual aparelho e quando (hora do aparelho). */
export interface AutoriaDaOperacao {
  usuarioId: string;
  dispositivoId: string;
  quando: Date;
}

export class LancamentoRegistrado extends EventoDeDominio {
  readonly nome = 'lancamento.criado';
  constructor(
    readonly lancamentoId: string,
    readonly depois: EstadoDoLancamento,
    readonly autoria: AutoriaDaOperacao,
  ) {
    super();
  }
}

export class LancamentoAlterado extends EventoDeDominio {
  readonly nome = 'lancamento.alterado';
  constructor(
    readonly lancamentoId: string,
    readonly camposAlterados: readonly string[],
    readonly antes: EstadoDoLancamento,
    readonly depois: EstadoDoLancamento,
    readonly autoria: AutoriaDaOperacao,
    /** A alteração foi feita sobre uma versão mais antiga que a do servidor (v1.1, §4.3). */
    readonly conflito: boolean,
  ) {
    super();
  }
}

export class LancamentoExcluido extends EventoDeDominio {
  readonly nome = 'lancamento.excluido';
  constructor(
    readonly lancamentoId: string,
    readonly antes: EstadoDoLancamento,
    readonly depois: EstadoDoLancamento,
    readonly autoria: AutoriaDaOperacao,
  ) {
    super();
  }
}

export class LancamentoRestaurado extends EventoDeDominio {
  readonly nome = 'lancamento.restaurado';
  constructor(
    readonly lancamentoId: string,
    readonly antes: EstadoDoLancamento,
    readonly depois: EstadoDoLancamento,
    readonly autoria: AutoriaDaOperacao,
  ) {
    super();
  }
}
