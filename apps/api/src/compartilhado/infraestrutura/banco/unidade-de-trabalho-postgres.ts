import { AsyncLocalStorage } from 'node:async_hooks';
import { Inject, Injectable } from '@nestjs/common';
import type { Transaction } from 'kysely';
import { BarramentoDeEventos } from '../../aplicacao/barramento-de-eventos';
import { UnidadeDeTrabalho } from '../../aplicacao/unidade-de-trabalho';
import type { EventoDeDominio } from '../../dominio/evento-de-dominio';
import { CONEXAO_BANCO, type ConexaoBanco } from './conexao';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type TransacaoBanco = Transaction<{}>;

interface ContextoDaTransacao {
  transacao: TransacaoBanco;
  eventos: EventoDeDominio[];
}

/**
 * Unidade de trabalho sobre o Postgres. A transação aberta fica guardada no contexto
 * assíncrono da chamada (AsyncLocalStorage); os repositórios pegam a conexão certa com
 * `banco()`, sem o caso de uso precisar passar a transação de mão em mão.
 */
@Injectable()
export class UnidadeDeTrabalhoPostgres extends UnidadeDeTrabalho {
  private readonly contexto = new AsyncLocalStorage<ContextoDaTransacao>();

  constructor(
    @Inject(CONEXAO_BANCO) private readonly conexao: ConexaoBanco,
    private readonly barramento: BarramentoDeEventos,
  ) {
    super();
  }

  async executar<T>(trabalho: () => Promise<T>): Promise<T> {
    if (this.contexto.getStore()) {
      // Já dentro de uma transação: participa dela (não abre outra).
      return trabalho();
    }
    const eventos: EventoDeDominio[] = [];
    const resultado = await this.conexao
      .transaction()
      .execute((transacao) => this.contexto.run({ transacao, eventos }, trabalho));
    // Só depois do commit (§9.4).
    if (eventos.length > 0) await this.barramento.publicar(eventos);
    return resultado;
  }

  registrarEventos(eventos: readonly EventoDeDominio[]): void {
    const atual = this.contexto.getStore();
    if (!atual) throw new Error('registrarEventos chamado fora de uma unidade de trabalho');
    atual.eventos.push(...eventos);
  }

  /** Conexão para os repositórios: a transação aberta, se houver; senão a conexão comum. */
  banco(): ConexaoBanco {
    return this.contexto.getStore()?.transacao ?? this.conexao;
  }
}
