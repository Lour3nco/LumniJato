import type { PGlite } from '@electric-sql/pglite';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { CONFIGURACAO } from '../../src/compartilhado/compartilhado.module';
import { CONEXAO_BANCO } from '../../src/compartilhado/infraestrutura/banco/conexao';
import { UsuarioAutenticado } from '../../src/modulos/identidade-acesso/publico';
import { criarBancoMigrado } from './banco-migrado';
import { criarConexaoDeTeste } from './conexao-pglite';
import { SUPABASE_URL_DE_TESTE } from './tokens';

export const DONO_A = '0192f0c1-0000-7000-8000-00000000000a';
export const DONO_B = '0192f0c1-0000-7000-8000-00000000000b';

/**
 * API de verdade (AppModule) sobre o banco com as migrações reais e dois donos implantados em
 * organizações diferentes (A e B), com os dados iniciais (FIN-US-01.6).
 */
export async function subirAppComDoisDonos() {
  const pglite: PGlite = await criarBancoMigrado();
  await pglite.query(`select identidade.implantar('Lava-jato A', array['Centro A'], $1, 'Dono A', 'a@exemplo.com')`, [DONO_A]);
  await pglite.query(`select identidade.implantar('Lava-jato B', array['Centro B'], $1, 'Dono B', 'b@exemplo.com')`, [DONO_B]);

  const { conexao } = await criarConexaoDeTeste(pglite);
  const modulo = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(CONFIGURACAO)
    .useValue({ PORTA: 3000, DATABASE_URL: 'postgresql://teste@localhost/teste', SUPABASE_URL: SUPABASE_URL_DE_TESTE })
    .overrideProvider(CONEXAO_BANCO)
    .useValue(conexao)
    .compile();
  const app: INestApplication = modulo.createNestApplication({ logger: false });
  await app.init();

  /** O usuário como a guarda o montaria a partir do token (vínculos ativos). */
  async function usuario(id: string): Promise<UsuarioAutenticado> {
    const { rows } = await pglite.query<{ unidade_id: string; organizacao_id: string; nome: string }>(
      `select uu.unidade_id, u.organizacao_id, u.nome from identidade.usuario_unidade uu
         join identidade.unidade u on u.id = uu.unidade_id where uu.usuario_id = $1 and uu.ativo`,
      [id],
    );
    return new UsuarioAutenticado(
      id,
      'Dono',
      null,
      rows.map((r) => ({ unidadeId: r.unidade_id, organizacaoId: r.organizacao_id, unidadeNome: r.nome, papel: 'dono' as const })),
    );
  }

  async function idDe(sqlTexto: string, parametros: unknown[] = []): Promise<string> {
    const { rows } = await pglite.query<{ id: string }>(sqlTexto, parametros);
    if (!rows[0]) throw new Error(`nada encontrado: ${sqlTexto}`);
    return rows[0].id;
  }

  return { app, pglite, usuario, idDe };
}
