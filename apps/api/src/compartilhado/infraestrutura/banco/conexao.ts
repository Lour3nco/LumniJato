import { Kysely, PostgresDialect } from 'kysely';
import { Pool, types } from 'pg';

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

const OID_INT8 = 20;

/**
 * O `pg` devolve `bigint` (int8) como texto, para não perder precisão. Os valores em centavos
 * cabem com folga num número seguro do JavaScript (até 9 quatrilhões), então aqui viram
 * `number` — e um valor fora da faixa segura vira erro em vez de perder centavos.
 */
export function converterInt8(texto: string): number {
  const numero = Number(texto);
  if (!Number.isSafeInteger(numero)) {
    throw new RangeError(`Valor int8 fora da faixa segura do JavaScript: ${texto}`);
  }
  return numero;
}

const tiposDaConexao = {
  getTypeParser: ((oid: number, formato?: 'text' | 'binary') =>
    oid === OID_INT8 ? converterInt8 : types.getTypeParser(oid, formato)) as typeof types.getTypeParser,
};

export function criarConexao(databaseUrl: string): ConexaoBanco {
  const pool = new Pool({ connectionString: databaseUrl, max: 10, types: tiposDaConexao });
  return new Kysely({ dialect: new PostgresDialect({ pool }) });
}
