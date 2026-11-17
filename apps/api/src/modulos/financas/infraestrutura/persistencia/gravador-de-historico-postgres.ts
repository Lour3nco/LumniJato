import { Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { UnidadeDeTrabalhoPostgres } from '../../../../compartilhado/infraestrutura/banco/unidade-de-trabalho-postgres';
import type { EstadoDoLancamento } from '../../dominio/lancamento/estado';
import {
  LancamentoAlterado,
  LancamentoExcluido,
  LancamentoRegistrado,
  LancamentoRestaurado,
} from '../../dominio/lancamento/eventos';
import { paraLinha } from './lancamento-repositorio-postgres';
import type { LinhaHistorico, TabelasFinancas } from './tabelas';

export type EventoDoLancamento = LancamentoRegistrado | LancamentoAlterado | LancamentoExcluido | LancamentoRestaurado;

/** Nomes dos eventos que geram histórico (03-arquitetura §9.4). */
export const EVENTOS_COM_HISTORICO = [
  'lancamento.criado',
  'lancamento.alterado',
  'lancamento.excluido',
  'lancamento.restaurado',
] as const;

type LinhaNova = Omit<LinhaHistorico, 'id' | 'recebido_servidor_em'>;

const ACAO: Record<EventoDoLancamento['nome'], LinhaHistorico['acao']> = {
  'lancamento.criado': 'criacao',
  'lancamento.alterado': 'alteracao',
  'lancamento.excluido': 'exclusao',
  'lancamento.restaurado': 'restauracao',
};

/** Colunas que mudam por si só a cada alteração aceita e não interessam ao dono no histórico. */
const COLUNAS_DE_CONTROLE = new Set(['versao', 'alterado_em', 'alterado_por']);

function emJson(valor: object): string {
  return JSON.stringify(valor, (_chave, v: unknown) => (v instanceof Date ? v.toISOString() : v));
}

/**
 * Monta a linha do histórico a partir do evento (FIN-US-01.5).
 *
 * Mitigação de volume (decisão da Arquitetura, passo 5): na CRIAÇÃO grava o estado completo
 * em `dados_depois`; nas demais ações grava em `dados_antes`/`dados_depois` SÓ as colunas que
 * mudaram (também listadas em `campos_alterados`, com o nome da coluna do banco).
 */
export function montarLinhaDeHistorico(evento: EventoDoLancamento): LinhaNova {
  const base = {
    lancamento_id: evento.lancamentoId,
    acao: ACAO[evento.nome],
    alterado_por: evento.autoria.usuarioId,
    alterado_em: evento.autoria.quando,
    dispositivo_id: evento.autoria.dispositivoId,
    conflito: evento instanceof LancamentoAlterado ? evento.conflito : false,
  };
  if (evento instanceof LancamentoRegistrado) {
    return { ...base, dados_antes: null, dados_depois: emJson(paraLinha(evento.depois)), campos_alterados: null };
  }
  const { antes, depois } = soOQueMudou(evento.antes, evento.depois);
  return {
    ...base,
    dados_antes: emJson(antes),
    dados_depois: emJson(depois),
    campos_alterados: Object.keys(depois),
  };
}

function soOQueMudou(estadoAntes: EstadoDoLancamento, estadoDepois: EstadoDoLancamento) {
  const linhaAntes: Record<string, unknown> = paraLinha(estadoAntes);
  const linhaDepois: Record<string, unknown> = paraLinha(estadoDepois);
  const antes: Record<string, unknown> = {};
  const depois: Record<string, unknown> = {};
  for (const coluna of Object.keys(linhaDepois)) {
    if (COLUNAS_DE_CONTROLE.has(coluna)) continue;
    const valorAntes = linhaAntes[coluna] instanceof Date ? (linhaAntes[coluna] as Date).getTime() : linhaAntes[coluna];
    const valorDepois = linhaDepois[coluna] instanceof Date ? (linhaDepois[coluna] as Date).getTime() : linhaDepois[coluna];
    if (valorAntes !== valorDepois) {
      antes[coluna] = linhaAntes[coluna];
      depois[coluna] = linhaDepois[coluna];
    }
  }
  return { antes, depois };
}

/**
 * Grava `lancamento_historico` NA MESMA TRANSAÇÃO da alteração: é assinado como manipulador
 * "na transação" do barramento (kernel). Se falhar, a unidade de trabalho desfaz tudo — nem o
 * lançamento nem o histórico ficam gravados (CA-01.5.4). Não existe caso de uso que grave
 * histórico a pedido do cliente (CA-01.5.5).
 */
@Injectable()
export class GravadorDeHistoricoPostgres {
  constructor(private readonly uow: UnidadeDeTrabalhoPostgres) {}

  async gravar(evento: EventoDoLancamento): Promise<void> {
    const linha = montarLinhaDeHistorico(evento);
    await this.uow
      .banco()
      .withTables<TabelasFinancas>()
      .insertInto('financas.lancamento_historico')
      .values({
        ...linha,
        dados_antes: linha.dados_antes === null ? null : sql<string>`${linha.dados_antes}::jsonb`,
        dados_depois: linha.dados_depois === null ? null : sql<string>`${linha.dados_depois}::jsonb`,
        recebido_servidor_em: sql<Date>`now()`,
      })
      .execute();
  }
}
