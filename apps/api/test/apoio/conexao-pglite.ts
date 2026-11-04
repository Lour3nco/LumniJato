import { PGlite } from '@electric-sql/pglite';
import { Kysely, PostgresDialect } from 'kysely';
import type { ConexaoBanco } from '../../src/compartilhado/infraestrutura/banco/conexao';

/**
 * Conexão Kysely sobre um Postgres em memória (PGlite), para os testes rodarem sem Docker.
 * Adapta o PGlite à interface de "pool" que o PostgresDialect espera (a mesma do `pg`).
 */
export async function criarConexaoDeTeste(): Promise<{ conexao: ConexaoBanco; pglite: PGlite }> {
  const pglite = new PGlite();
  await pglite.waitReady;
  const cliente = {
    async query(sql: string, parametros?: readonly unknown[]) {
      const resultado = await pglite.query<Record<string, unknown>>(sql, parametros as unknown[]);
      const comando = sql.trimStart().split(/\s+/, 1)[0]?.toUpperCase() ?? '';
      return { command: comando, rowCount: resultado.affectedRows ?? resultado.rows.length, rows: resultado.rows };
    },
    release() {},
  };
  const pool = {
    connect: async () => cliente,
    end: async () => {},
  };
  // O tipo do pool do `pg` é maior do que o que o Kysely usa; o adaptador cobre o necessário.
  const conexao = new Kysely({ dialect: new PostgresDialect({ pool: pool as never }) });
  return { conexao, pglite };
}
