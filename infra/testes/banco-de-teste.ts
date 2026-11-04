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
 * Postgres em memória (PGlite) com as migrações aplicadas em ordem. Roda no CI sem Docker;
 * a validação no Supabase de verdade é feita com `pnpm db:resetar`.
 */
export async function criarBancoMigrado(): Promise<PGlite> {
  const banco = new PGlite({ extensions: { unaccent } });
  for (const arquivo of migracoesEmOrdem()) {
    await banco.exec(readFileSync(join(pastaMigracoes, arquivo), 'utf8'));
  }
  return banco;
}
