import { Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { UnidadeDeTrabalhoPostgres } from '../../../../compartilhado/infraestrutura/banco/unidade-de-trabalho-postgres';
import { type EstadoDoLancamento, Lancamento } from '../../dominio/lancamento/lancamento';
import { LancamentoRepositorio } from '../../dominio/lancamento/lancamento-repositorio';
import type { LinhaLancamento, TabelasFinancas } from './tabelas';

/** Estado do agregado → linha da tabela (camelCase → snake_case). */
export function paraLinha(e: EstadoDoLancamento): Omit<LinhaLancamento, 'recebido_servidor_em'> {
  return {
    id: e.id,
    unidade_id: e.unidadeId,
    tipo: e.tipo,
    natureza: e.natureza,
    valor_centavos: e.valorCentavos,
    data_lancamento: e.dataLancamento,
    categoria_id: e.categoriaId,
    tipo_servico_id: e.tipoServicoId,
    tipo_veiculo_id: e.tipoVeiculoId,
    forma_pagamento_id: e.formaPagamentoId,
    descricao: e.descricao,
    situacao: e.situacao,
    origem: e.origem,
    origem_ref_tabela: e.origemRefTabela,
    origem_ref_id: e.origemRefId,
    dispositivo_id: e.dispositivoId,
    criado_em: e.criadoEm,
    criado_por: e.criadoPor,
    alterado_em: e.alteradoEm,
    alterado_por: e.alteradoPor,
    versao: e.versao,
    excluido_em: e.excluidoEm,
    excluido_por: e.excluidoPor,
  };
}

/** Datas do tipo `date` podem voltar como Date (pg) ou texto (PGlite): sempre "AAAA-MM-DD". */
function dataSemHora(valor: string | Date): string {
  return typeof valor === 'string' ? valor.slice(0, 10) : valor.toISOString().slice(0, 10);
}

/**
 * Repositório Postgres do agregado Lancamento. Grava SEMPRE pela transação aberta na unidade
 * de trabalho, e marca `recebido_servidor_em` com a hora do SERVIDOR, ignorando o que o
 * aparelho mandou (CA-01.5.1).
 */
@Injectable()
export class LancamentoRepositorioPostgres extends LancamentoRepositorio {
  constructor(private readonly uow: UnidadeDeTrabalhoPostgres) {
    super();
  }

  private banco() {
    return this.uow.banco().withTables<TabelasFinancas>();
  }

  async buscarPorId(id: string): Promise<Lancamento | null> {
    const linha = await this.banco()
      .selectFrom('financas.lancamento as l')
      .innerJoin('financas.categoria as c', 'c.id', 'l.categoria_id')
      .selectAll('l')
      .select(sql<boolean>`c.codigo = 'servicos'`.as('categoria_eh_servicos'))
      .where('l.id', '=', id)
      .executeTakeFirst();
    if (!linha) return null;
    return Lancamento.reconstituir({
      id: linha.id,
      unidadeId: linha.unidade_id,
      tipo: linha.tipo,
      natureza: linha.natureza,
      valorCentavos: linha.valor_centavos,
      dataLancamento: dataSemHora(linha.data_lancamento),
      categoriaId: linha.categoria_id,
      categoriaEhServicos: linha.categoria_eh_servicos === true,
      tipoServicoId: linha.tipo_servico_id,
      tipoVeiculoId: linha.tipo_veiculo_id,
      formaPagamentoId: linha.forma_pagamento_id,
      descricao: linha.descricao,
      situacao: linha.situacao,
      origem: linha.origem,
      origemRefTabela: linha.origem_ref_tabela,
      origemRefId: linha.origem_ref_id,
      dispositivoId: linha.dispositivo_id,
      criadoEm: new Date(linha.criado_em),
      criadoPor: linha.criado_por,
      alteradoEm: new Date(linha.alterado_em),
      alteradoPor: linha.alterado_por,
      versao: linha.versao,
      excluidoEm: linha.excluido_em ? new Date(linha.excluido_em) : null,
      excluidoPor: linha.excluido_por,
    });
  }

  async salvar(lancamento: Lancamento): Promise<void> {
    const linha = { ...paraLinha(lancamento.instantaneo()), recebido_servidor_em: sql<Date>`now()` };
    // Na atualização, autoria da criação e aparelho de origem não mudam.
    const alteraveis = Object.fromEntries(
      Object.entries(linha).filter(([coluna]) => !['id', 'criado_em', 'criado_por', 'dispositivo_id'].includes(coluna)),
    );
    await this.banco()
      .insertInto('financas.lancamento')
      .values(linha)
      .onConflict((oc) => oc.column('id').doUpdateSet(alteraveis))
      .execute();
  }
}
