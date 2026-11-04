import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { criarBancoMigrado } from './banco-de-teste';

/**
 * FIN-US-01.4 · API pública do Supabase fechada (CA-01.4.1 a CA-01.4.5).
 *
 * A Data API (PostgREST) executa cada pedido com o papel `anon` (chave anônima) ou
 * `authenticated` (token de usuário). Aqui o teste assume esses papéis direto no Postgres:
 * se o banco recusa para o papel, recusa também para a API pública.
 */

const SCHEMAS_DOS_MODULOS = ['identidade', 'financas'];
const PAPEIS_PUBLICOS = ['anon', 'authenticated'];

/**
 * Confere no catálogo do Postgres se a API pública continua fechada. Devolve a lista de
 * problemas encontrados (vazia = fechada). É a checagem que reprova uma migração que abra o
 * acesso (CA-01.4.5).
 */
async function problemasDeAcessoPublico(banco: PGlite): Promise<string[]> {
  const problemas: string[] = [];

  const semRls = await banco.query<{ tabela: string }>(
    `select n.nspname || '.' || c.relname as tabela
       from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = any($1) and c.relkind in ('r', 'p') and not c.relrowsecurity`,
    [SCHEMAS_DOS_MODULOS],
  );
  problemas.push(...semRls.rows.map((r) => `RLS desligada em ${r.tabela}`));

  const politicas = await banco.query<{ politica: string }>(
    `select schemaname || '.' || tablename || ': ' || policyname as politica
       from pg_policies
      where schemaname = any($1) and (roles && $2::name[] or 'public' = any(roles))`,
    [SCHEMAS_DOS_MODULOS, PAPEIS_PUBLICOS],
  );
  problemas.push(...politicas.rows.map((r) => `política aberta ${r.politica}`));

  for (const papel of PAPEIS_PUBLICOS) {
    const schemas = await banco.query<{ schema: string }>(
      `select nspname as schema from pg_namespace
        where nspname = any($1) and has_schema_privilege($2, oid, 'USAGE')`,
      [SCHEMAS_DOS_MODULOS, papel],
    );
    problemas.push(...schemas.rows.map((r) => `${papel} pode usar o schema ${r.schema}`));

    const tabelas = await banco.query<{ tabela: string }>(
      `select n.nspname || '.' || c.relname as tabela
         from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = any($1) and c.relkind in ('r', 'p')
          and has_table_privilege($2, c.oid, 'SELECT, INSERT, UPDATE, DELETE')`,
      [SCHEMAS_DOS_MODULOS, papel],
    );
    problemas.push(...tabelas.rows.map((r) => `${papel} tem privilégio em ${r.tabela}`));
  }
  return problemas;
}

describe('acesso direto ao banco fechado (FIN-US-01.4)', () => {
  let banco: PGlite;

  beforeAll(async () => {
    banco = await criarBancoMigrado();
    // Um dado de verdade para tentar ler.
    await banco.exec(`
      insert into identidade.organizacao (id, nome) values ('00000000-0000-4000-8000-000000000001', 'Teste');
    `);
  });

  afterAll(async () => {
    await banco.close();
  });

  /** Roda um comando como outro papel, numa transação desfeita no fim. */
  async function comoPapel(papel: string, sql: string): Promise<unknown> {
    await banco.exec('begin');
    try {
      await banco.exec(`set local role ${papel}`);
      return await banco.query(sql);
    } finally {
      await banco.exec('rollback');
    }
  }

  // CA-01.4.1 e CA-01.4.5
  it('todas as tabelas têm RLS ligada, sem políticas nem privilégios para anon e authenticated', async () => {
    expect(await problemasDeAcessoPublico(banco)).toEqual([]);
  });

  it('a checagem reprova uma migração que abra uma política para authenticated', async () => {
    await banco.exec('begin');
    try {
      await banco.exec(`
        grant usage on schema financas to authenticated;
        grant select on financas.categoria to authenticated;
        create policy aberta on financas.categoria for select to authenticated using (true);
        alter table financas.forma_pagamento disable row level security;
      `);
      const problemas = await problemasDeAcessoPublico(banco);
      expect(problemas).toEqual(
        expect.arrayContaining([
          'RLS desligada em financas.forma_pagamento',
          'política aberta financas.categoria: aberta',
          'authenticated pode usar o schema financas',
          'authenticated tem privilégio em financas.categoria',
        ]),
      );
    } finally {
      await banco.exec('rollback');
    }
  });

  // CA-01.4.2 (chave anônima) e CA-01.4.3 (token do dono)
  describe.each(PAPEIS_PUBLICOS)('como %s (API pública do Supabase)', (papel) => {
    it.each([
      ['ler', 'select * from identidade.organizacao'],
      ['ler lançamentos', 'select * from financas.lancamento'],
      ['gravar', `insert into identidade.organizacao (id, nome) values ('00000000-0000-4000-8000-000000000002', 'Invasor')`],
      ['alterar', `update identidade.organizacao set nome = 'X'`],
      ['apagar', 'delete from financas.categoria'],
      ['chamar a implantação', `select identidade.implantar('X', array['Y'], '00000000-0000-4000-8000-000000000003', 'Z', 'z@z.com')`],
    ])('não consegue %s', async (_acao, sql) => {
      await expect(comoPapel(papel, sql)).rejects.toThrow(/permission denied/);
    });
  });

  // CA-01.4.4
  describe('papel da API (api_lavajato)', () => {
    it('lê, cria e altera nos schemas dos módulos, sem depender de política RLS', async () => {
      await banco.exec('begin');
      try {
        await banco.exec('set local role api_lavajato');
        await banco.exec(
          `insert into financas.forma_pagamento (id, organizacao_id, nome) values ('00000000-0000-4000-8000-0000000000aa', '00000000-0000-4000-8000-000000000001', 'Pix')`,
        );
        const { rows } = await banco.query('select * from financas.forma_pagamento');
        expect(rows).toHaveLength(1);
        // nome_chave usa a função de normalização: precisa funcionar com este papel
        await banco.exec(
          `insert into financas.tipo_servico (id, organizacao_id, nome) values ('00000000-0000-4000-8000-0000000000ab', '00000000-0000-4000-8000-000000000001', 'Água')`,
        );
      } finally {
        await banco.exec('rollback');
      }
    });

    it.each([
      ['apagar fisicamente (exclusão é lógica)', 'delete from financas.lancamento'],
      ['alterar o histórico', `update financas.lancamento_historico set conflito = true`],
      ['criar tabela no schema public', 'create table public.qualquer (id int)'],
      ['chamar a implantação', `select financas.carregar_dados_iniciais('00000000-0000-4000-8000-000000000001')`],
    ])('não consegue %s', async (_acao, sql) => {
      await expect(comoPapel('api_lavajato', sql)).rejects.toThrow(/permission denied/);
    });

    it('não tem privilégio em tabelas fora dos schemas dos módulos', async () => {
      const { rows } = await banco.query<{ tabela: string }>(
        `select n.nspname || '.' || c.relname as tabela
           from pg_class c join pg_namespace n on n.oid = c.relnamespace
          where n.nspname not in ('identidade', 'financas', 'pg_catalog', 'information_schema')
            and c.relkind in ('r', 'p')
            and has_table_privilege('api_lavajato', c.oid, 'SELECT, INSERT, UPDATE, DELETE')`,
      );
      expect(rows).toEqual([]);
    });
  });

  // CA-01.4.4
  describe('papel de replicação do PowerSync (powersync_replicacao)', () => {
    it('lê as tabelas dos módulos', async () => {
      const resultado = (await comoPapel('powersync_replicacao', 'select * from identidade.organizacao')) as {
        rows: unknown[];
      };
      expect(resultado.rows).toHaveLength(1);
    });

    it.each([
      ['INSERT', `insert into identidade.organizacao (id, nome) values ('00000000-0000-4000-8000-000000000009', 'X')`],
      ['UPDATE', `update identidade.organizacao set nome = 'X'`],
      ['DELETE', 'delete from identidade.organizacao'],
    ])('recusa %s', async (_comando, sql) => {
      await expect(comoPapel('powersync_replicacao', sql)).rejects.toThrow(/permission denied/);
    });

    it('fica em modo só leitura por padrão', async () => {
      const { rows } = await banco.query<{ config: string[] | null }>(
        `select rolconfig as config from pg_roles where rolname = 'powersync_replicacao'`,
      );
      expect(rows[0].config).toContain('default_transaction_read_only=on');
    });
  });
});

describe('publicação do PowerSync (rascunho da prova, FIN-US-07.10)', () => {
  it('aplica no banco migrado e cobre todas as tabelas dos módulos', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const banco = await criarBancoMigrado();
    try {
      await banco.exec(readFileSync(join(__dirname, '..', 'powersync', 'publicacao.sql'), 'utf8'));
      const publicadas = await banco.query<{ tabela: string }>(
        `select schemaname || '.' || tablename as tabela from pg_publication_tables where pubname = 'powersync' order by 1`,
      );
      const todas = await banco.query<{ tabela: string }>(
        `select schemaname || '.' || tablename as tabela from pg_tables where schemaname in ('identidade', 'financas') order by 1`,
      );
      expect(publicadas.rows).toEqual(todas.rows);
    } finally {
      await banco.close();
    }
  });
});
