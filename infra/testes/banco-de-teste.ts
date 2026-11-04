import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { unaccent } from '@electric-sql/pglite/contrib/unaccent';

export const pastaMigracoes = join(__dirname, '..', 'supabase', 'migrations');

/** Arquivos de migração na ordem em que o Supabase os aplica (pelo prefixo de data e hora). */
export function migracoesEmOrdem(): string[] {
  return readdirSync(pastaMigracoes)
    .filter((arquivo) => arquivo.endsWith('.sql'))
    .sort();
}

/**
 * Papéis que o Supabase já traz prontos e que as migrações referenciam. No Postgres de teste
 * eles são criados antes, com os mesmos privilégios básicos que o Supabase dá na Data API
 * (PostgREST): `anon` e `authenticated` podem usar o schema `public`.
 */
const PAPEIS_DO_SUPABASE = `
  create role anon nologin noinherit;
  create role authenticated nologin noinherit;
  create role service_role nologin noinherit bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
`;

/**
 * Postgres em memória (PGlite) com as migrações aplicadas em ordem. Roda no CI sem Docker;
 * a validação no Supabase de verdade é feita com `pnpm db:resetar`.
 */
export async function criarBancoMigrado(): Promise<PGlite> {
  const banco = new PGlite({ extensions: { unaccent } });
  await banco.exec(PAPEIS_DO_SUPABASE);
  for (const arquivo of migracoesEmOrdem()) {
    await banco.exec(readFileSync(join(pastaMigracoes, arquivo), 'utf8'));
  }
  return banco;
}
