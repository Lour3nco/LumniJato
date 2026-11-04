import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { criarBancoMigrado, migracoesEmOrdem } from './banco-de-teste';

const TABELAS_ESPERADAS = {
  identidade: ['dispositivo', 'organizacao', 'unidade', 'usuario', 'usuario_unidade'],
  financas: [
    'categoria',
    'forma_pagamento',
    'lancamento',
    'lancamento_historico',
    'preferencia_usuario',
    'tipo_servico',
    'tipo_veiculo',
  ],
};

describe('migrações do banco', () => {
  let banco: PGlite;

  beforeAll(async () => {
    banco = await criarBancoMigrado();
  });

  afterAll(async () => {
    await banco.close();
  });

  it('seguem o padrão de nome <AAAAMMDDHHMMSS>_<descricao>.sql', () => {
    const arquivos = migracoesEmOrdem();
    expect(arquivos.length).toBeGreaterThan(0);
    for (const arquivo of arquivos) {
      expect(arquivo).toMatch(/^\d{14}_[a-z0-9_]+\.sql$/);
    }
  });

  // CA-01.2.2 e CA-01.3.1
  it('aplicam em ordem num Postgres vazio e criam os schemas com todas as tabelas', async () => {
    const { rows } = await banco.query<{ schema: string; tabela: string }>(
      `select table_schema as schema, table_name as tabela
         from information_schema.tables
        where table_schema in ('identidade', 'financas') and table_type = 'BASE TABLE'
        order by 1, 2`,
    );
    const porSchema = { identidade: [] as string[], financas: [] as string[] };
    for (const { schema, tabela } of rows) porSchema[schema as keyof typeof porSchema].push(tabela);
    expect(porSchema).toEqual(TABELAS_ESPERADAS);
  });
});
