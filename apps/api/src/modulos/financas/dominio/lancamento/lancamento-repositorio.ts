import type { Lancamento } from './lancamento';

/**
 * Porta do repositório de lançamentos (03-arquitetura §9.3). A implementação Postgres entra na
 * FIN-US-01.15, na camada de infraestrutura.
 */
export abstract class LancamentoRepositorio {
  abstract buscarPorId(id: string): Promise<Lancamento | null>;
  /** Insere ou atualiza o estado do agregado (dentro da unidade de trabalho). */
  abstract salvar(lancamento: Lancamento): Promise<void>;
}
