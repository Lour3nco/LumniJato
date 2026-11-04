import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

/**
 * Conexão com o Postgres pelo Kysely (query builder tipado — ADR-001 em docs/dev).
 *
 * O kernel não conhece as tabelas: cada módulo declara as suas e usa
 * `conexao.withTables<TabelasDoModulo>()`, mantendo cada módulo dono das próprias tabelas
 * (03-arquitetura §9.1).
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ConexaoBanco = Kysely<{}>;

/** Token de injeção da conexão. */
export const CONEXAO_BANCO = Symbol('CONEXAO_BANCO');

export function criarConexao(databaseUrl: string): ConexaoBanco {
  const pool = new Pool({ connectionString: databaseUrl, max: 10 });
  return new Kysely({ dialect: new PostgresDialect({ pool }) });
}
