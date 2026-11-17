import { Injectable } from '@nestjs/common';
import { UnidadeDeTrabalhoPostgres } from '../../../compartilhado/infraestrutura/banco/unidade-de-trabalho-postgres';
import {
  type PerfilComVinculos,
  type RegistroDeDispositivo,
  RepositorioDeIdentidade,
} from '../aplicacao/portas';
import type { Papel } from '../dominio/usuario-autenticado';

/** Tabelas do schema `identidade` que este módulo usa (só ele lê e grava nelas). */
type TabelasIdentidade = {
  'identidade.usuario': { id: string; nome: string; email: string | null; ativo: boolean };
  'identidade.unidade': { id: string; nome: string; ativa: boolean; organizacao_id: string };
  'identidade.usuario_unidade': { usuario_id: string; unidade_id: string; papel: Papel; ativo: boolean };
  'identidade.dispositivo': {
    id: string;
    usuario_id: string;
    nome: string | null;
    ultima_sincronizacao_em: Date | null;
  };
};

@Injectable()
export class RepositorioIdentidadePostgres extends RepositorioDeIdentidade {
  constructor(private readonly uow: UnidadeDeTrabalhoPostgres) {
    super();
  }

  private banco() {
    return this.uow.banco().withTables<TabelasIdentidade>();
  }

  async carregarPerfil(usuarioId: string): Promise<PerfilComVinculos | null> {
    const usuario = await this.banco()
      .selectFrom('identidade.usuario')
      .select(['id', 'nome', 'email', 'ativo'])
      .where('id', '=', usuarioId)
      .executeTakeFirst();
    if (!usuario) return null;
    const vinculos = await this.banco()
      .selectFrom('identidade.usuario_unidade as uu')
      .innerJoin('identidade.unidade as u', 'u.id', 'uu.unidade_id')
      .select(['uu.unidade_id as unidadeId', 'u.organizacao_id as organizacaoId', 'u.nome as unidadeNome', 'uu.papel as papel'])
      .where('uu.usuario_id', '=', usuarioId)
      .where('uu.ativo', '=', true)
      .where('u.ativa', '=', true)
      .orderBy('u.nome')
      .execute();
    return { ...usuario, vinculos };
  }

  async buscarDispositivo(id: string): Promise<RegistroDeDispositivo | null> {
    const linha = await this.banco()
      .selectFrom('identidade.dispositivo')
      .select(['id', 'usuario_id as usuarioId', 'nome'])
      .where('id', '=', id)
      .executeTakeFirst();
    return linha ?? null;
  }

  async inserirDispositivoSeNaoExistir(d: RegistroDeDispositivo): Promise<void> {
    await this.banco()
      .insertInto('identidade.dispositivo')
      .values({ id: d.id, usuario_id: d.usuarioId, nome: d.nome, ultima_sincronizacao_em: null })
      .onConflict((oc) => oc.column('id').doNothing())
      .execute();
  }

  async marcarSincronizacao(dispositivoId: string, quando: Date): Promise<void> {
    await this.banco()
      .updateTable('identidade.dispositivo')
      .set({ ultima_sincronizacao_em: quando })
      .where('id', '=', dispositivoId)
      .execute();
  }
}
