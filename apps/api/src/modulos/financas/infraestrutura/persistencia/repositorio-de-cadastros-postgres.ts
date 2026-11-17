import { Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { ErroDeDominio } from '../../../../compartilhado/dominio/erros';
import { UnidadeDeTrabalhoPostgres } from '../../../../compartilhado/infraestrutura/banco/unidade-de-trabalho-postgres';
import { RepositorioDeCadastros } from '../../aplicacao/cadastros/portas';
import { Categoria, type TipoCategoria } from '../../dominio/cadastros/categoria';
import type { Natureza } from '../../dominio/cadastros/preferencia';
import { type QualTipo, TipoDeCadastro } from '../../dominio/cadastros/tipo-de-cadastro';
import type { TabelasFinancas } from './tabelas';

/** Violação de índice único no Postgres (última barreira do nome repetido, F-16). */
function ehNomeRepetidoNoBanco(erro: unknown): boolean {
  return typeof erro === 'object' && erro !== null && (erro as { code?: string }).code === '23505';
}

async function comBarreiraDeNome<T>(gravar: () => Promise<T>): Promise<T> {
  try {
    return await gravar();
  } catch (erro) {
    if (ehNomeRepetidoNoBanco(erro)) throw new ErroDeDominio('nome_repetido', 'Já existe um cadastro com esse nome.');
    throw erro;
  }
}

@Injectable()
export class RepositorioDeCadastrosPostgres extends RepositorioDeCadastros {
  constructor(private readonly uow: UnidadeDeTrabalhoPostgres) {
    super();
  }

  private banco() {
    return this.uow.banco().withTables<TabelasFinancas>();
  }

  async buscarCategoria(id: string): Promise<Categoria | null> {
    const l = await this.banco().selectFrom('financas.categoria').selectAll().where('id', '=', id).executeTakeFirst();
    if (!l) return null;
    return Categoria.reconstituir({
      id: l.id,
      organizacaoId: l.organizacao_id,
      tipo: l.tipo,
      nome: l.nome,
      icone: l.icone,
      cor: l.cor,
      aplicaA: l.aplica_a,
      sistema: l.sistema,
      codigo: l.codigo,
      ordem: l.ordem,
      ativa: l.ativa,
      versao: l.versao,
      criadoEm: new Date(l.criado_em),
      criadoPor: l.criado_por,
      alteradoEm: new Date(l.alterado_em),
      alteradoPor: l.alterado_por,
    });
  }

  async salvarCategoria(categoria: Categoria): Promise<void> {
    const e = categoria.instantaneo();
    const linha = {
      id: e.id,
      organizacao_id: e.organizacaoId,
      tipo: e.tipo,
      nome: e.nome,
      icone: e.icone,
      cor: e.cor,
      aplica_a: e.aplicaA,
      sistema: e.sistema,
      codigo: e.codigo,
      ordem: e.ordem,
      ativa: e.ativa,
      versao: e.versao,
      criado_em: e.criadoEm,
      criado_por: e.criadoPor,
      alterado_em: e.alteradoEm,
      alterado_por: e.alteradoPor,
    };
    await comBarreiraDeNome(() =>
      this.banco()
        .insertInto('financas.categoria')
        .values(linha)
        .onConflict((oc) =>
          oc.column('id').doUpdateSet({
            nome: linha.nome,
            icone: linha.icone,
            cor: linha.cor,
            ordem: linha.ordem,
            ativa: linha.ativa,
            versao: linha.versao,
            alterado_em: linha.alterado_em,
            alterado_por: linha.alterado_por,
          }),
        )
        .execute(),
    );
  }

  async categoriaAtivaComChave(organizacaoId: string, tipo: TipoCategoria, chave: string, excetoId: string) {
    const l = await this.banco()
      .selectFrom('financas.categoria')
      .select('nome')
      .where('organizacao_id', '=', organizacaoId)
      .where('tipo', '=', tipo)
      .where('nome_chave', '=', chave)
      .where('ativa', '=', true)
      .where('id', '<>', excetoId)
      .executeTakeFirst();
    return l?.nome ?? null;
  }

  async buscarTipo(qual: QualTipo, id: string): Promise<TipoDeCadastro | null> {
    const banco = this.banco();
    const l =
      qual === 'tipo_veiculo'
        ? await banco.selectFrom('financas.tipo_veiculo').selectAll().where('id', '=', id).executeTakeFirst()
        : await banco
            .selectFrom('financas.tipo_servico')
            .selectAll()
            .select(sql<null>`null`.as('icone'))
            .where('id', '=', id)
            .executeTakeFirst();
    if (!l) return null;
    return TipoDeCadastro.reconstituir(qual, {
      id: l.id,
      organizacaoId: l.organizacao_id,
      nome: l.nome,
      icone: l.icone,
      ordem: l.ordem,
      ativo: l.ativo,
      versao: l.versao,
      criadoEm: new Date(l.criado_em),
      criadoPor: l.criado_por,
      alteradoEm: new Date(l.alterado_em),
      alteradoPor: l.alterado_por,
    });
  }

  async salvarTipo(tipo: TipoDeCadastro): Promise<void> {
    const e = tipo.instantaneo();
    const comum = {
      id: e.id,
      organizacao_id: e.organizacaoId,
      nome: e.nome,
      ordem: e.ordem,
      ativo: e.ativo,
      versao: e.versao,
      criado_em: e.criadoEm,
      criado_por: e.criadoPor,
      alterado_em: e.alteradoEm,
      alterado_por: e.alteradoPor,
    };
    const atualizar = {
      nome: comum.nome,
      ordem: comum.ordem,
      ativo: comum.ativo,
      versao: comum.versao,
      alterado_em: comum.alterado_em,
      alterado_por: comum.alterado_por,
    };
    await comBarreiraDeNome(async () => {
      if (tipo.qual === 'tipo_veiculo') {
        const icone = e.icone ?? 'veiculo';
        await this.banco()
          .insertInto('financas.tipo_veiculo')
          .values({ ...comum, icone })
          .onConflict((oc) => oc.column('id').doUpdateSet({ ...atualizar, icone }))
          .execute();
      } else {
        await this.banco()
          .insertInto('financas.tipo_servico')
          .values(comum)
          .onConflict((oc) => oc.column('id').doUpdateSet(atualizar))
          .execute();
      }
    });
  }

  async tipoAtivoComChave(qual: QualTipo, organizacaoId: string, chave: string, excetoId: string) {
    const tabela = qual === 'tipo_veiculo' ? 'financas.tipo_veiculo' : 'financas.tipo_servico';
    const l = await this.banco()
      .selectFrom(tabela)
      .select('nome')
      .where('organizacao_id', '=', organizacaoId)
      .where('nome_chave', '=', chave)
      .where('ativo', '=', true)
      .where('id', '<>', excetoId)
      .executeTakeFirst();
    return l?.nome ?? null;
  }

  async salvarPreferencia(usuarioId: string, natureza: Natureza, alteradoEm: Date): Promise<void> {
    await this.banco()
      .insertInto('financas.preferencia_usuario')
      .values({ usuario_id: usuarioId, natureza_padrao: natureza, alterado_em: alteradoEm, versao: 1 })
      .onConflict((oc) =>
        oc.column('usuario_id').doUpdateSet({
          natureza_padrao: natureza,
          alterado_em: alteradoEm,
          versao: sql<number>`financas.preferencia_usuario.versao + 1`,
        }),
      )
      .execute();
  }
}
