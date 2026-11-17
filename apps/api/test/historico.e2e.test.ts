import type { PGlite } from '@electric-sql/pglite';
import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { UnidadeDeTrabalho } from '../src/compartilhado/aplicacao/unidade-de-trabalho';
import { CONEXAO_BANCO, type ConexaoBanco } from '../src/compartilhado/infraestrutura/banco/conexao';
import { UnidadeDeTrabalhoPostgres } from '../src/compartilhado/infraestrutura/banco/unidade-de-trabalho-postgres';
import { BarramentoEmMemoria } from '../src/compartilhado/infraestrutura/eventos/barramento-em-memoria';
import type { AutoriaDaOperacao } from '../src/modulos/financas/dominio/lancamento/eventos';
import { type CategoriaDoLancamento, Lancamento } from '../src/modulos/financas/dominio/lancamento/lancamento';
import { LancamentoRepositorio } from '../src/modulos/financas/dominio/lancamento/lancamento-repositorio';
import { LancamentoRepositorioPostgres } from '../src/modulos/financas/infraestrutura/persistencia/lancamento-repositorio-postgres';
import { DONO_A, subirAppComDoisDonos } from './apoio/app-de-teste';

/**
 * FIN-US-01.5 · Histórico gravado na mesma transação, a partir dos eventos do Lancamento
 * (manipulador "na transação" do kernel). Os casos de uso de lançamento são a FIN-US-01.15;
 * aqui o teste faz o mesmo que eles: agregado → repositório → eventos → commit.
 */
const APARELHO = '0192f0c1-0000-7000-8000-0000000000d1';
const CONTEXTO = { fusoDaUnidade: 'America/Sao_Paulo', agoraServidor: new Date() };
let sequencia = 0;
const novoId = () => `0192f0c1-0000-7000-8000-${String(1000 + ++sequencia).padStart(12, '0')}`;

describe('histórico do lançamento (FIN-US-01.5)', () => {
  let app: INestApplication;
  let pglite: PGlite;
  let uow: UnidadeDeTrabalho;
  let repositorio: LancamentoRepositorio;
  let unidade: string;
  let alimentacao: CategoriaDoLancamento;
  let energia: CategoriaDoLancamento;
  let pix: string;

  const autoria = (quando = new Date('2026-11-04T12:00:00Z')): AutoriaDaOperacao => ({
    usuarioId: DONO_A,
    dispositivoId: APARELHO,
    quando,
  });

  beforeAll(async () => {
    const teste = await subirAppComDoisDonos();
    ({ app, pglite } = teste);
    uow = app.get(UnidadeDeTrabalho);
    repositorio = app.get(LancamentoRepositorio);
    unidade = await teste.idDe(`select id from identidade.unidade where nome = 'Centro A'`);
    const org = await teste.idDe(`select organizacao_id as id from identidade.unidade where nome = 'Centro A'`);
    alimentacao = { id: await teste.idDe(`select id from financas.categoria where organizacao_id = $1 and nome = 'Alimentação'`, [org]), tipo: 'saida', ehServicos: false, ativa: true };
    energia = { id: await teste.idDe(`select id from financas.categoria where organizacao_id = $1 and nome = 'Energia'`, [org]), tipo: 'saida', ehServicos: false, ativa: true };
    pix = await teste.idDe(`select id from financas.forma_pagamento where organizacao_id = $1 and nome = 'Pix'`, [org]);
    await pglite.query(`insert into identidade.dispositivo (id, usuario_id, nome) values ($1, $2, 'Celular')`, [APARELHO, DONO_A]);
  });

  afterAll(async () => {
    await app.close();
    await pglite.close();
  });

  async function registrar(id = novoId()): Promise<string> {
    await uow.executar(async () => {
      const lancamento = Lancamento.registrar(
        { id, unidadeId: unidade, tipo: 'saida', natureza: 'empresa', valorCentavos: 2500, dataLancamento: '2026-11-04', categoria: alimentacao, formaPagamentoId: pix },
        autoria(),
        CONTEXTO,
      );
      await repositorio.salvar(lancamento);
      uow.registrarEventos(lancamento.retirarEventos());
    });
    return id;
  }

  async function mudar(id: string, acao: (l: Lancamento) => void): Promise<void> {
    await uow.executar(async () => {
      const lancamento = (await repositorio.buscarPorId(id))!;
      acao(lancamento);
      await repositorio.salvar(lancamento);
      uow.registrarEventos(lancamento.retirarEventos());
    });
  }

  async function historico(id: string) {
    const { rows } = await pglite.query<{
      acao: string;
      dados_antes: Record<string, unknown> | null;
      dados_depois: Record<string, unknown>;
      campos_alterados: string[] | null;
      alterado_por: string;
      dispositivo_id: string;
      recebido_servidor_em: Date;
    }>(
      `select acao, dados_antes, dados_depois, campos_alterados, alterado_por, dispositivo_id, recebido_servidor_em
         from financas.lancamento_historico where lancamento_id = $1 order by recebido_servidor_em, id`,
      [id],
    );
    return rows;
  }

  // CA-01.5.1
  it('criação: hora do servidor, versão 1 e linha "criacao" com o estado completo', async () => {
    const antes = Date.now();
    const id = await registrar();
    const { rows } = await pglite.query<{ versao: number; recebido_servidor_em: Date }>(
      'select versao, recebido_servidor_em from financas.lancamento where id = $1',
      [id],
    );
    expect(rows[0].versao).toBe(1);
    // Hora do servidor, não a do aparelho (que foi 04/11 12h00 fixo no teste).
    expect(new Date(rows[0].recebido_servidor_em).getTime()).toBeGreaterThanOrEqual(antes - 5000);

    const [linha, ...outras] = await historico(id);
    expect(outras).toEqual([]);
    expect(linha).toMatchObject({ acao: 'criacao', dados_antes: null, campos_alterados: null, alterado_por: DONO_A, dispositivo_id: APARELHO });
    expect(linha.dados_depois).toMatchObject({ id, valor_centavos: 2500, categoria_id: alimentacao.id, versao: 1 });
  });

  // CA-01.5.2 + mitigação de volume: só os campos alterados
  it('alteração: versão N+1 e linha "alteracao" só com os campos que mudaram', async () => {
    const id = await registrar();
    await mudar(id, (l) =>
      l.editar(
        { tipo: 'saida', natureza: 'empresa', valorCentavos: 3500, dataLancamento: '2026-11-04', categoria: energia, formaPagamentoId: pix },
        autoria(new Date('2026-11-04T13:00:00Z')),
        CONTEXTO,
      ),
    );
    const { rows } = await pglite.query<{ versao: number }>('select versao from financas.lancamento where id = $1', [id]);
    expect(rows[0].versao).toBe(2);
    const alteracao = (await historico(id))[1];
    expect(alteracao).toMatchObject({
      acao: 'alteracao',
      campos_alterados: ['valor_centavos', 'categoria_id'],
      dados_antes: { valor_centavos: 2500, categoria_id: alimentacao.id },
      dados_depois: { valor_centavos: 3500, categoria_id: energia.id },
      alterado_por: DONO_A,
      dispositivo_id: APARELHO,
    });
    // jsonb não guarda a ordem das chaves
    expect(Object.keys(alteracao.dados_depois).sort()).toEqual(['categoria_id', 'valor_centavos']);
  });

  // CA-01.5.3
  it('exclusão e restauração geram "exclusao" e "restauracao"', async () => {
    const id = await registrar();
    await mudar(id, (l) => l.excluir(autoria()));
    await mudar(id, (l) => l.restaurar(autoria(), CONTEXTO));
    const linhas = await historico(id);
    expect(linhas.map((l) => l.acao)).toEqual(['criacao', 'exclusao', 'restauracao']);
    expect(linhas[1].campos_alterados).toEqual(['excluido_em', 'excluido_por']);
    expect(linhas[2].dados_depois).toEqual({ excluido_em: null, excluido_por: null });
  });

  // CA-01.5.4 e CA-01.18.5
  it('falha ao gravar o histórico: nem o lançamento nem o histórico ficam gravados', async () => {
    const barramento = new BarramentoEmMemoria();
    barramento.assinarNaTransacao('lancamento.criado', async () => {
      throw new Error('falha simulada ao gravar o histórico');
    });
    const uowComFalha = new UnidadeDeTrabalhoPostgres(app.get<ConexaoBanco>(CONEXAO_BANCO), barramento);
    const repositorioComFalha = new LancamentoRepositorioPostgres(uowComFalha);
    const id = novoId();
    await expect(
      uowComFalha.executar(async () => {
        const lancamento = Lancamento.registrar(
          { id, unidadeId: unidade, tipo: 'saida', natureza: 'empresa', valorCentavos: 100, dataLancamento: '2026-11-04', categoria: alimentacao, formaPagamentoId: pix },
          autoria(),
          CONTEXTO,
        );
        await repositorioComFalha.salvar(lancamento);
        uowComFalha.registrarEventos(lancamento.retirarEventos());
      }),
    ).rejects.toThrow('falha simulada');
    const { rows } = await pglite.query('select id from financas.lancamento where id = $1', [id]);
    expect(rows).toEqual([]);
    expect(await historico(id)).toEqual([]);
  });

  it('editar sem mudar nada não gera linha nova', async () => {
    const id = await registrar();
    await mudar(id, (l) =>
      l.editar(
        { tipo: 'saida', natureza: 'empresa', valorCentavos: 2500, dataLancamento: '2026-11-04', categoria: alimentacao, formaPagamentoId: pix },
        autoria(),
        CONTEXTO,
      ),
    );
    expect((await historico(id)).map((l) => l.acao)).toEqual(['criacao']);
  });
});
