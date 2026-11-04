import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { criarBancoMigrado } from './banco-de-teste';

/**
 * FIN-US-01.3 · O banco como última barreira (CA-01.3.1 a CA-01.3.9).
 * Cada teste roda dentro de uma transação desfeita no fim, para não sujar os outros.
 */

const ORG = '00000000-0000-7000-8000-000000000001';
const ORG_2 = '00000000-0000-7000-8000-000000000002';
const USUARIO = '00000000-0000-7000-8000-000000000010';
const UNIDADE = '00000000-0000-7000-8000-000000000020';
const DISPOSITIVO = '00000000-0000-7000-8000-000000000030';
const CAT_SAIDA = '00000000-0000-7000-8000-000000000040';
const CAT_SERVICOS = '00000000-0000-7000-8000-000000000041';
const TIPO_SERVICO = '00000000-0000-7000-8000-000000000050';
const TIPO_VEICULO = '00000000-0000-7000-8000-000000000060';
const FORMA = '00000000-0000-7000-8000-000000000070';
const INEXISTENTE = '00000000-0000-7000-8000-0000000000ff';

let sequencia = 0;
/** UUID novo e válido para cada linha inserida nos testes. */
function novoId(): string {
  sequencia += 1;
  return `00000000-0000-7000-8000-${sequencia.toString(16).padStart(12, '0')}`.replace(
    /^00000000/,
    'aaaaaaaa',
  );
}

async function dadosBase(banco: PGlite): Promise<void> {
  await banco.exec(`
    insert into identidade.organizacao (id, nome) values ('${ORG}', 'Lava-jato'), ('${ORG_2}', 'Outro');
    insert into identidade.usuario (id, nome, email) values ('${USUARIO}', 'Dono', 'dono@exemplo.com');
    insert into identidade.unidade (id, organizacao_id, nome) values ('${UNIDADE}', '${ORG}', 'Centro');
    insert into identidade.usuario_unidade (id, usuario_id, unidade_id, papel)
      values ('${novoId()}', '${USUARIO}', '${UNIDADE}', 'dono');
    insert into identidade.dispositivo (id, usuario_id, nome) values ('${DISPOSITIVO}', '${USUARIO}', 'Celular');
    insert into financas.categoria (id, organizacao_id, tipo, nome, sistema, codigo)
      values ('${CAT_SAIDA}', '${ORG}', 'saida', 'Alimentação', false, null),
             ('${CAT_SERVICOS}', '${ORG}', 'entrada', 'Serviços', true, 'servicos');
    insert into financas.tipo_servico (id, organizacao_id, nome) values ('${TIPO_SERVICO}', '${ORG}', 'Polimento');
    insert into financas.tipo_veiculo (id, organizacao_id, nome, icone) values ('${TIPO_VEICULO}', '${ORG}', 'Carro', 'carro');
    insert into financas.forma_pagamento (id, organizacao_id, nome) values ('${FORMA}', '${ORG}', 'Pix');
  `);
}

/** Lançamento mínimo válido; `campos` sobrescreve ou acrescenta colunas. */
async function inserirLancamento(banco: PGlite, campos: Record<string, unknown> = {}): Promise<string> {
  const id = (campos.id as string | undefined) ?? novoId();
  const linha: Record<string, unknown> = {
    id,
    unidade_id: UNIDADE,
    tipo: 'saida',
    valor_centavos: 2500,
    data_lancamento: '2026-11-04',
    categoria_id: CAT_SAIDA,
    forma_pagamento_id: FORMA,
    dispositivo_id: DISPOSITIVO,
    criado_em: '2026-11-04T12:00:00Z',
    criado_por: USUARIO,
    alterado_em: '2026-11-04T12:00:00Z',
    alterado_por: USUARIO,
    ...campos,
  };
  const colunas = Object.keys(linha);
  const valores = colunas.map((c) => linha[c]);
  await banco.query(
    `insert into financas.lancamento (${colunas.join(', ')})
     values (${colunas.map((_, i) => `$${i + 1}`).join(', ')})`,
    valores,
  );
  return id;
}

async function deveRecusar(promessa: Promise<unknown>): Promise<void> {
  await expect(promessa).rejects.toThrow();
}

describe('esquema do banco (FIN-US-01.3)', () => {
  let banco: PGlite;

  beforeAll(async () => {
    banco = await criarBancoMigrado();
  });

  afterAll(async () => {
    await banco.close();
  });

  beforeEach(async () => {
    await banco.exec('begin');
    await dadosBase(banco);
    return async () => {
      await banco.exec('rollback');
    };
  });

  /** Roda um comando num ponto de salvamento, para um erro esperado não abortar a transação do teste. */
  async function tentar(sql: () => Promise<unknown>): Promise<unknown> {
    await banco.exec('savepoint tentativa');
    try {
      const resultado = await sql();
      await banco.exec('release savepoint tentativa');
      return resultado;
    } catch (erro) {
      await banco.exec('rollback to savepoint tentativa');
      throw erro;
    }
  }

  describe('CA-01.3.1 · campos, tipos, chaves e índices da 03-arquitetura §3', () => {
    async function colunas(schema: string, tabela: string) {
      const { rows } = await banco.query<{ coluna: string; tipo: string; nulo: string }>(
        `select column_name as coluna, data_type as tipo, is_nullable as nulo
           from information_schema.columns where table_schema = $1 and table_name = $2`,
        [schema, tabela],
      );
      return Object.fromEntries(rows.map((r) => [r.coluna, `${r.tipo}${r.nulo === 'NO' ? ' not null' : ''}`]));
    }

    it('lancamento tem os campos e tipos do modelo', async () => {
      expect(await colunas('financas', 'lancamento')).toEqual({
        id: 'uuid not null',
        unidade_id: 'uuid not null',
        tipo: 'text not null',
        natureza: 'text not null',
        valor_centavos: 'bigint not null',
        data_lancamento: 'date not null',
        categoria_id: 'uuid not null',
        tipo_servico_id: 'uuid',
        tipo_veiculo_id: 'uuid',
        forma_pagamento_id: 'uuid not null',
        descricao: 'text',
        situacao: 'text not null',
        origem: 'text not null',
        origem_ref_tabela: 'text',
        origem_ref_id: 'uuid',
        dispositivo_id: 'uuid not null',
        criado_em: 'timestamp with time zone not null',
        criado_por: 'uuid not null',
        alterado_em: 'timestamp with time zone not null',
        alterado_por: 'uuid not null',
        recebido_servidor_em: 'timestamp with time zone',
        versao: 'integer not null',
        excluido_em: 'timestamp with time zone',
        excluido_por: 'uuid',
      });
    });

    it('lancamento_historico tem os campos do modelo', async () => {
      expect(Object.keys(await colunas('financas', 'lancamento_historico')).sort()).toEqual(
        [
          'id',
          'lancamento_id',
          'acao',
          'dados_antes',
          'dados_depois',
          'campos_alterados',
          'alterado_por',
          'alterado_em',
          'dispositivo_id',
          'recebido_servidor_em',
          'conflito',
        ].sort(),
      );
    });

    it('categoria, tipo_servico e tipo_veiculo têm nome_chave gerada e auditoria + versao', async () => {
      for (const tabela of ['categoria', 'tipo_servico', 'tipo_veiculo']) {
        const cols = await colunas('financas', tabela);
        for (const c of ['nome_chave', 'versao', 'criado_em', 'criado_por', 'alterado_em', 'alterado_por']) {
          expect(cols, `${tabela}.${c}`).toHaveProperty(c);
        }
      }
      const { rows } = await banco.query<{ gerada: string }>(
        `select is_generated as gerada from information_schema.columns
          where table_schema = 'financas' and table_name = 'categoria' and column_name = 'nome_chave'`,
      );
      expect(rows[0].gerada).toBe('ALWAYS');
    });

    it('tem os índices do modelo', async () => {
      const { rows } = await banco.query<{ indice: string }>(
        `select indexname as indice from pg_indexes where schemaname in ('identidade', 'financas')`,
      );
      const indices = rows.map((r) => r.indice);
      expect(indices).toEqual(
        expect.arrayContaining([
          'categoria_nome_chave_ativa_unico',
          'categoria_codigo_unico',
          'tipo_servico_nome_chave_ativo_unico',
          'tipo_veiculo_nome_chave_ativo_unico',
          'lancamento_unidade_data',
          'lancamento_unidade_categoria_data',
          'lancamento_unidade_veiculo_data',
          'lancamento_origem_ref',
          'usuario_unidade_unico',
        ]),
      );
    });
  });

  // CA-01.3.2
  it.each([
    ['zero', 0],
    ['negativo', -100],
    ['com casas decimais', '35.50'],
  ])('CA-01.3.2 · recusa valor_centavos %s', async (_caso, valor) => {
    await deveRecusar(tentar(() => inserirLancamento(banco, { valor_centavos: valor })));
  });

  // CA-01.3.3
  it.each([
    ['tipo', 'transferencia'],
    ['natureza', 'familia'],
    ['situacao', 'pendente'],
    ['origem', 'importacao'],
  ])('CA-01.3.3 · recusa %s fora da lista (%s)', async (campo, valor) => {
    await deveRecusar(tentar(() => inserirLancamento(banco, { [campo]: valor })));
  });

  describe('CA-01.3.4 · nome único normalizado entre os ativos (F-16)', () => {
    beforeEach(async () => {
      await banco.query(
        `insert into financas.categoria (id, organizacao_id, tipo, nome) values ($1, $2, 'saida', 'Água')`,
        [novoId(), ORG],
      );
    });

    it.each([' agua ', 'ÁGUA'])('recusa outra categoria ativa "%s" do tipo saída', async (nome) => {
      await deveRecusar(
        tentar(() =>
          banco.query(
            `insert into financas.categoria (id, organizacao_id, tipo, nome) values ($1, $2, 'saida', $3)`,
            [novoId(), ORG, nome],
          ),
        ),
      );
    });

    it('as duas têm nome_chave "agua"', async () => {
      const { rows } = await banco.query<{ nome_chave: string }>(
        `select nome_chave from financas.categoria where nome = 'Água'`,
      );
      expect(rows[0].nome_chave).toBe('agua');
    });

    it('aceita com tipo entrada, em outra organização ou com a primeira desativada', async () => {
      await tentar(() =>
        banco.query(
          `insert into financas.categoria (id, organizacao_id, tipo, nome) values ($1, $2, 'entrada', ' agua ')`,
          [novoId(), ORG],
        ),
      );
      await tentar(() =>
        banco.query(
          `insert into financas.categoria (id, organizacao_id, tipo, nome) values ($1, $2, 'saida', 'ÁGUA')`,
          [novoId(), ORG_2],
        ),
      );
      await banco.exec(`update financas.categoria set ativa = false where nome = 'Água'`);
      await tentar(() =>
        banco.query(
          `insert into financas.categoria (id, organizacao_id, tipo, nome) values ($1, $2, 'saida', 'ÁGUA')`,
          [novoId(), ORG],
        ),
      );
    });

    it.each(['tipo_servico', 'tipo_veiculo'])('vale o mesmo para %s', async (tabela) => {
      await banco.query(`insert into financas.${tabela} (id, organizacao_id, nome) values ($1, $2, 'Água')`, [
        novoId(),
        ORG,
      ]);
      await deveRecusar(
        tentar(() =>
          banco.query(`insert into financas.${tabela} (id, organizacao_id, nome) values ($1, $2, ' agua ')`, [
            novoId(),
            ORG,
          ]),
        ),
      );
      await banco.exec(`update financas.${tabela} set ativo = false where nome = 'Água'`);
      await tentar(() =>
        banco.query(`insert into financas.${tabela} (id, organizacao_id, nome) values ($1, $2, 'ÁGUA')`, [
          novoId(),
          ORG,
        ]),
      );
    });
  });

  // CA-01.3.5
  it.each(['empresa', 'pessoal'])('CA-01.3.5 · recusa lançamento %s sem unidade_id', async (natureza) => {
    await deveRecusar(tentar(() => inserirLancamento(banco, { unidade_id: null, natureza })));
  });

  // CA-01.3.6
  it('CA-01.3.6 · codigo é único por organização e aceita só os 4 códigos de sistema', async () => {
    await deveRecusar(
      tentar(() =>
        banco.query(
          `insert into financas.categoria (id, organizacao_id, tipo, nome, sistema, codigo)
           values ($1, $2, 'entrada', 'Serviços 2', true, 'servicos')`,
          [novoId(), ORG],
        ),
      ),
    );
    await deveRecusar(
      tentar(() =>
        banco.query(
          `insert into financas.categoria (id, organizacao_id, tipo, nome, codigo) values ($1, $2, 'saida', 'X', 'outro')`,
          [novoId(), ORG],
        ),
      ),
    );
    // Categorias criadas pelo dono ficam com código nulo, quantas forem.
    await tentar(() =>
      banco.query(
        `insert into financas.categoria (id, organizacao_id, tipo, nome) values ($1, $2, 'saida', 'Energia'), ($3, $2, 'saida', 'Aluguel')`,
        [novoId(), ORG, novoId()],
      ),
    );
  });

  // CA-01.3.7
  it('CA-01.3.7 · não há gatilhos, políticas nem campos de identificação pessoal', async () => {
    const gatilhos = await banco.query(
      `select tgname from pg_trigger t join pg_class c on c.oid = t.tgrelid
         join pg_namespace n on n.oid = c.relnamespace
        where n.nspname in ('identidade', 'financas') and not t.tgisinternal`,
    );
    expect(gatilhos.rows).toEqual([]);

    const politicas = await banco.query(
      `select policyname from pg_policies where schemaname in ('identidade', 'financas')`,
    );
    expect(politicas.rows).toEqual([]);

    const { rows } = await banco.query<{ coluna: string }>(
      `select table_name || '.' || column_name as coluna from information_schema.columns
        where table_schema in ('identidade', 'financas')
          and column_name ~ '(cpf|telefone|celular|placa|modelo|cliente)'`,
    );
    expect(rows).toEqual([]);
  });

  // CA-01.3.8
  it('CA-01.3.8 · campos reservados nascem com os valores padrão', async () => {
    const id = await inserirLancamento(banco);
    const { rows } = await banco.query<{ situacao: string; origem: string; versao: number; excluido_em: null }>(
      `select situacao, origem, versao, excluido_em from financas.lancamento where id = $1`,
      [id],
    );
    expect(rows[0]).toEqual({ situacao: 'realizado', origem: 'manual', versao: 1, excluido_em: null });
  });

  // CA-01.3.9
  it.each([
    'categoria_id',
    'tipo_servico_id',
    'tipo_veiculo_id',
    'forma_pagamento_id',
    'unidade_id',
    'dispositivo_id',
    'criado_por',
  ])('CA-01.3.9 · recusa %s inexistente (chave estrangeira)', async (campo) => {
    await deveRecusar(tentar(() => inserirLancamento(banco, { [campo]: INEXISTENTE })));
  });

  it('aceita uma entrada de serviço completa (controle do teste)', async () => {
    await inserirLancamento(banco, {
      tipo: 'entrada',
      categoria_id: CAT_SERVICOS,
      tipo_servico_id: TIPO_SERVICO,
      tipo_veiculo_id: TIPO_VEICULO,
      valor_centavos: 6000,
    });
  });

  it('recusa descrição com mais de 200 caracteres', async () => {
    await deveRecusar(tentar(() => inserirLancamento(banco, { descricao: 'x'.repeat(201) })));
  });
});
