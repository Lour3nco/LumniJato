import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { criarBancoMigrado } from './banco-de-teste';

/**
 * FIN-US-01.6 · Dados iniciais (CA-01.6.1 a CA-01.6.4), usando o modelo FICTÍCIO de
 * implantação (infra/implantacao/implantacao.exemplo.sql). Os dados reais do dono não ficam no git.
 */
const modeloDeImplantacao = readFileSync(join(__dirname, '..', 'implantacao', 'implantacao.exemplo.sql'), 'utf8');
const DONO = '00000000-0000-4000-8000-000000000001';

describe('dados iniciais (FIN-US-01.6)', () => {
  let banco: PGlite;

  beforeAll(async () => {
    banco = await criarBancoMigrado();
    await banco.exec(modeloDeImplantacao);
  });

  afterAll(async () => {
    await banco.close();
  });

  async function contar(tabela: string): Promise<number> {
    const { rows } = await banco.query<{ n: number }>(`select count(*)::int as n from ${tabela}`);
    return rows[0].n;
  }

  // CA-01.6.1
  it('cria 1 organização, as unidades em America/Sao_Paulo e um vínculo dono ativo por unidade', async () => {
    expect(await contar('identidade.organizacao')).toBe(1);
    const unidades = await banco.query<{ nome: string; fuso_horario: string }>(
      'select nome, fuso_horario from identidade.unidade order by nome',
    );
    expect(unidades.rows).toEqual([
      { nome: 'Unidade Exemplo 1', fuso_horario: 'America/Sao_Paulo' },
      { nome: 'Unidade Exemplo 2', fuso_horario: 'America/Sao_Paulo' },
    ]);
    const vinculos = await banco.query<{ papel: string; ativo: boolean }>(
      'select papel, ativo from identidade.usuario_unidade where usuario_id = $1',
      [DONO],
    );
    expect(vinculos.rows).toEqual([
      { papel: 'dono', ativo: true },
      { papel: 'dono', ativo: true },
    ]);
  });

  // CA-01.6.2
  it('cria as 4 categorias de sistema com código e as demais iniciais', async () => {
    const { rows } = await banco.query<{ tipo: string; nome: string; sistema: boolean; codigo: string | null }>(
      'select tipo, nome, sistema, codigo from financas.categoria order by tipo, ordem',
    );
    const sistema = rows.filter((c) => c.sistema).map((c) => [c.codigo, c.tipo, c.nome]);
    expect(sistema).toEqual(
      expect.arrayContaining([
        ['servicos', 'entrada', 'Serviços'],
        ['produtos', 'saida', 'Produtos'],
        ['mao_de_obra', 'saida', 'Mão de obra'],
        ['reembolso', 'saida', 'Reembolso'],
      ]),
    );
    expect(sistema).toHaveLength(4);
    expect(rows.filter((c) => !c.sistema).every((c) => c.codigo === null)).toBe(true);
    expect(rows).toContainEqual({ tipo: 'entrada', nome: 'Venda de produtos', sistema: false, codigo: null });
    expect(rows.filter((c) => c.tipo === 'saida').map((c) => c.nome)).toEqual(
      expect.arrayContaining(['Alimentação', 'Passagem', 'Água']),
    );
    // Todas com ícone e cor
    const semIcone = await banco.query('select nome from financas.categoria where icone is null or cor is null');
    expect(semIcone.rows).toEqual([]);
  });

  // CA-01.6.3
  it('cria tipos de serviço (F-14), de veículo com ícone (E2-07) e formas de pagamento ativas (F-12)', async () => {
    const servicos = await banco.query<{ nome: string }>('select nome from financas.tipo_servico order by ordem');
    expect(servicos.rows.map((r) => r.nome)).toEqual([
      'Lavagem rápida',
      'Lavagem completa',
      'Polimento',
      'Higienização interna',
      'Cristalização',
    ]);
    const veiculos = await banco.query<{ nome: string; icone: string }>(
      'select nome, icone from financas.tipo_veiculo order by ordem',
    );
    expect(veiculos.rows).toEqual([
      { nome: 'Carro', icone: 'carro' },
      { nome: 'Moto', icone: 'moto' },
      { nome: 'SUV', icone: 'suv' },
      { nome: 'Caminhonete/Picape', icone: 'picape' },
      { nome: 'Van', icone: 'van' },
    ]);
    const formas = await banco.query<{ nome: string; ativa: boolean }>(
      'select nome, ativa from financas.forma_pagamento order by ordem',
    );
    expect(formas.rows).toEqual([
      { nome: 'Dinheiro', ativa: true },
      { nome: 'Pix', ativa: true },
      { nome: 'Cartão de débito', ativa: true },
      { nome: 'Cartão de crédito', ativa: true },
    ]);
  });

  it('nenhum nome_chave se repete entre os ativos', async () => {
    for (const consulta of [
      'select tipo, nome_chave from financas.categoria group by 1, 2 having count(*) > 1',
      'select nome_chave from financas.tipo_servico group by 1 having count(*) > 1',
      'select nome_chave from financas.tipo_veiculo group by 1 having count(*) > 1',
    ]) {
      expect((await banco.query(consulta)).rows).toEqual([]);
    }
  });

  // CA-01.6.4
  it('rodar a carga de novo não duplica nada', async () => {
    const tabelas = [
      'identidade.organizacao',
      'identidade.unidade',
      'identidade.usuario',
      'identidade.usuario_unidade',
      'financas.categoria',
      'financas.tipo_servico',
      'financas.tipo_veiculo',
      'financas.forma_pagamento',
    ];
    const antes = await Promise.all(tabelas.map(contar));
    await banco.exec(modeloDeImplantacao);
    await banco.exec(modeloDeImplantacao);
    expect(await Promise.all(tabelas.map(contar))).toEqual(antes);
  });

  it('o catálogo não recria uma categoria de sistema renomeada pelo dono', async () => {
    await banco.exec(`update financas.categoria set nome = 'Lavagens' where codigo = 'servicos'`);
    const { rows } = await banco.query<{ organizacao_id: string }>('select id as organizacao_id from identidade.organizacao');
    await banco.query('select financas.carregar_dados_iniciais($1)', [rows[0].organizacao_id]);
    expect(await contar(`financas.categoria where codigo = 'servicos' or nome = 'Serviços'`)).toBe(1);
  });

  it('acrescenta uma unidade nova numa segunda implantação do mesmo dono', async () => {
    await banco.query(
      `select identidade.implantar('Lava-jato Exemplo', array['Unidade Exemplo 3'], $1, 'Dono Exemplo', 'dono@exemplo.com')`,
      [DONO],
    );
    expect(await contar('identidade.organizacao')).toBe(1);
    expect(await contar('identidade.unidade')).toBe(3);
    expect(await contar('identidade.usuario_unidade')).toBe(3);
  });
});
