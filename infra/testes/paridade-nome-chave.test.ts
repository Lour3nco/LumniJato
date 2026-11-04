import type { PGlite } from '@electric-sql/pglite';
import { CASOS_NORMALIZACAO_NOME, normalizarNome } from '@lavajato/dominio-compartilhado';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { criarBancoMigrado } from './banco-de-teste';

/**
 * CA-01.17.2 · A mesma tabela de nomes do teste de `normalizarNome` passa pela coluna gerada
 * `nome_chave = lower(f_unaccent(btrim(nome)))` do Postgres, e as duas chaves são iguais:
 * o app (aviso offline) e o banco (índice único) decidem igual (F-16, risco R-18).
 */
describe('paridade normalizarNome × nome_chave do Postgres', () => {
  let banco: PGlite;
  const ORG = '00000000-0000-7000-8000-000000000001';

  beforeAll(async () => {
    banco = await criarBancoMigrado();
    await banco.query(`insert into identidade.organizacao (id, nome) values ($1, 'Teste')`, [ORG]);
    // Inativos, para que variantes do mesmo nome não esbarrem no índice único.
    for (const [indice, [nome]] of CASOS_NORMALIZACAO_NOME.entries()) {
      await banco.query(
        `insert into financas.tipo_servico (id, organizacao_id, nome, ordem, ativo) values ($1, $2, $3, $4, false)`,
        [`00000000-0000-7000-8000-${String(indice).padStart(12, '0')}`, ORG, nome, indice],
      );
    }
  });

  afterAll(async () => {
    await banco.close();
  });

  it.each(CASOS_NORMALIZACAO_NOME)('"%s" dá a mesma chave nos dois lados ("%s")', async (nome, esperado) => {
    const { rows } = await banco.query<{ nome_chave: string }>(
      `select nome_chave from financas.tipo_servico where nome = $1`,
      [nome],
    );
    expect(rows[0].nome_chave).toBe(esperado);
    expect(normalizarNome(nome)).toBe(rows[0].nome_chave);
  });
});
