import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { describe, expect, it } from 'vitest';

const pastaMigracoes = join(__dirname, '..', 'supabase', 'migrations');

/** Arquivos de migração na ordem em que o Supabase os aplica (pelo prefixo de data e hora). */
function migracoesEmOrdem(): string[] {
  return readdirSync(pastaMigracoes)
    .filter((arquivo) => arquivo.endsWith('.sql'))
    .sort();
}

/**
 * CA-01.2.2: as migrações de `infra/supabase/migrations`, aplicadas em ordem num Postgres
 * vazio, criam a estrutura sem passo manual. Usa um Postgres em memória (PGlite) para rodar
 * no CI sem Docker; a validação contra o Supabase de verdade é feita com `pnpm db:resetar`.
 */
describe('migrações do banco', () => {
  it('seguem o padrão de nome <AAAAMMDDHHMMSS>_<descricao>.sql', () => {
    const arquivos = migracoesEmOrdem();
    expect(arquivos.length).toBeGreaterThan(0);
    for (const arquivo of arquivos) {
      expect(arquivo).toMatch(/^\d{14}_[a-z0-9_]+\.sql$/);
    }
  });

  it('aplicam em ordem num Postgres vazio e criam os schemas identidade e financas', async () => {
    const banco = new PGlite();
    try {
      for (const arquivo of migracoesEmOrdem()) {
        await banco.exec(readFileSync(join(pastaMigracoes, arquivo), 'utf8'));
      }

      const { rows } = await banco.query<{ nspname: string }>(
        "select nspname from pg_namespace where nspname in ('identidade', 'financas') order by nspname",
      );
      expect(rows.map((linha) => linha.nspname)).toEqual(['financas', 'identidade']);
    } finally {
      await banco.close();
    }
  });
});
