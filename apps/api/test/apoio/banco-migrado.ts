import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { unaccent } from '@electric-sql/pglite/contrib/unaccent';
import { converterInt8 } from '../../src/compartilhado/infraestrutura/banco/conexao';

const pastaMigracoes = join(__dirname, '..', '..', '..', '..', 'infra', 'supabase', 'migrations');

/** Papéis que o Supabase já traz e que as migrações referenciam (igual a infra/testes). */
const PAPEIS_DO_SUPABASE = `
  create role anon nologin noinherit;
  create role authenticated nologin noinherit;
  create role service_role nologin noinherit bypassrls;
`;

/** Postgres em memória com as migrações reais de infra/supabase/migrations aplicadas. */
export async function criarBancoMigrado(): Promise<PGlite> {
  const banco = new PGlite({ extensions: { unaccent }, parsers: { 20: converterInt8 } });
  await banco.exec(PAPEIS_DO_SUPABASE);
  for (const arquivo of readdirSync(pastaMigracoes).filter((a) => a.endsWith('.sql')).sort()) {
    await banco.exec(readFileSync(join(pastaMigracoes, arquivo), 'utf8'));
  }
  return banco;
}
