import type { PGlite } from '@electric-sql/pglite';
import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ErroDeAutorizacao, ErroDeDominio } from '../src/compartilhado/dominio/erros';
import { CadastroDeCategorias } from '../src/modulos/financas/aplicacao/cadastros/cadastro-de-categorias';
import {
  CadastroDeTiposDeServico,
  CadastroDeTiposDeVeiculo,
} from '../src/modulos/financas/aplicacao/cadastros/cadastro-de-tipos';
import { DefinirNaturezaPadrao } from '../src/modulos/financas/aplicacao/cadastros/definir-natureza-padrao';
import { FormasDePagamento } from '../src/modulos/financas/aplicacao/cadastros/formas-de-pagamento';
import type { UsuarioAutenticado } from '../src/modulos/identidade-acesso/publico';
import { DONO_A, DONO_B, subirAppComDoisDonos } from './apoio/app-de-teste';

/** FIN-US-01.16 · Cadastros e preferências com o banco real (CA-01.16.1 a CA-01.16.7). */

let sequencia = 0;
const novoId = () => `0192f0c1-0000-7000-8000-${String(2000 + ++sequencia).padStart(12, '0')}`;

async function codigoDoErro(promessa: Promise<unknown>): Promise<string | undefined> {
  try {
    await promessa;
  } catch (erro) {
    if (erro instanceof ErroDeDominio || erro instanceof ErroDeAutorizacao) return erro.codigo;
    throw erro;
  }
  return undefined;
}

describe('cadastros e preferências (FIN-US-01.16)', () => {
  let app: INestApplication;
  let pglite: PGlite;
  let donoA: UsuarioAutenticado;
  let donoB: UsuarioAutenticado;
  let orgA: string;
  let idDe: (sql: string, p?: unknown[]) => Promise<string>;

  beforeAll(async () => {
    const teste = await subirAppComDoisDonos();
    ({ app, pglite, idDe } = teste);
    donoA = await teste.usuario(DONO_A);
    donoB = await teste.usuario(DONO_B);
    orgA = donoA.vinculos[0].organizacaoId;
  });

  afterAll(async () => {
    await app.close();
    await pglite.close();
  });

  const categorias = () => app.get(CadastroDeCategorias);
  const servicos = () => app.get(CadastroDeTiposDeServico);
  const veiculos = () => app.get(CadastroDeTiposDeVeiculo);

  // CA-01.16.1
  describe('nome repetido normalizado (F-16)', () => {
    it('categoria "agua" com "Água" ativa do mesmo tipo é recusada; de outro tipo é aceita', async () => {
      expect(await codigoDoErro(categorias().criar(donoA, { id: novoId(), organizacaoId: orgA, tipo: 'saida', nome: 'agua' }))).toBe('nome_repetido');
      expect(await codigoDoErro(categorias().criar(donoA, { id: novoId(), organizacaoId: orgA, tipo: 'entrada', nome: 'agua' }))).toBeUndefined();
    });

    it('renomear outra categoria para "ÁGUA" é recusado', async () => {
      const gas = novoId();
      await categorias().criar(donoA, { id: gas, organizacaoId: orgA, tipo: 'saida', nome: 'Gás' });
      expect(await codigoDoErro(categorias().alterar(donoA, gas, { nome: ' ÁGUA ' }))).toBe('nome_repetido');
    });

    it('tipo de serviço " POLIMENTO " e veículo "moto" são recusados', async () => {
      expect(await codigoDoErro(servicos().criar(donoA, { id: novoId(), organizacaoId: orgA, nome: ' POLIMENTO ' }))).toBe('nome_repetido');
      expect(await codigoDoErro(veiculos().criar(donoA, { id: novoId(), organizacaoId: orgA, nome: 'moto' }))).toBe('nome_repetido');
    });

    it('a mensagem mostra o nome que já existe', async () => {
      await expect(servicos().criar(donoA, { id: novoId(), organizacaoId: orgA, nome: 'polimento' })).rejects.toThrow(
        "Já existe um serviço com esse nome: 'Polimento'.",
      );
    });
  });

  // CA-01.16.2
  it('reativar "Cera" funciona; com outro "cera" ativo, é recusado', async () => {
    const cera = novoId();
    await servicos().criar(donoA, { id: cera, organizacaoId: orgA, nome: 'Cera' });
    await servicos().alterar(donoA, cera, { ativo: false });
    expect(await codigoDoErro(servicos().alterar(donoA, cera, { ativo: true }))).toBeUndefined();

    await servicos().alterar(donoA, cera, { ativo: false });
    await servicos().criar(donoA, { id: novoId(), organizacaoId: orgA, nome: 'cera' });
    expect(await codigoDoErro(servicos().alterar(donoA, cera, { ativo: true }))).toBe('nome_repetido');
  });

  // CA-01.16.3
  it('categoria de sistema troca nome, ícone e cor, mas não desativa', async () => {
    const servicosId = await idDe(`select id from financas.categoria where organizacao_id = $1 and codigo = 'servicos'`, [orgA]);
    await categorias().alterar(donoA, servicosId, { nome: 'Lavagens', icone: 'carro', cor: '#00695C' });
    const { rows } = await pglite.query<{ nome: string; codigo: string; versao: number }>(
      'select nome, codigo, versao from financas.categoria where id = $1',
      [servicosId],
    );
    expect(rows[0]).toEqual({ nome: 'Lavagens', codigo: 'servicos', versao: 2 });
    expect(await codigoDoErro(categorias().alterar(donoA, servicosId, { ativa: false }))).toBe('categoria_de_sistema_nao_desativa');
  });

  // CA-01.16.4
  it('trocar o tipo de uma categoria é recusado', async () => {
    const id = await idDe(`select id from financas.categoria where organizacao_id = $1 and nome = 'Passagem'`, [orgA]);
    expect(await codigoDoErro(categorias().alterar(donoA, id, { tipo: 'entrada' }))).toBe('troca_de_tipo_da_categoria');
  });

  // CA-01.16.5
  it('tipo de veículo criado sem ícone é gravado com o genérico', async () => {
    const id = novoId();
    await veiculos().criar(donoA, { id, organizacaoId: orgA, nome: 'Ônibus' });
    const { rows } = await pglite.query<{ icone: string }>('select icone from financas.tipo_veiculo where id = $1', [id]);
    expect(rows[0].icone).toBe('veiculo');
  });

  // CA-01.16.6
  it('criar ou alterar forma de pagamento é recusado', () => {
    const formas = app.get(FormasDePagamento);
    expect(() => formas.criar()).toThrow(ErroDeDominio);
    expect(() => formas.alterar()).toThrow(ErroDeDominio);
  });

  // CA-01.16.7
  describe('preferência Pessoal/Empresa', () => {
    const preferencia = () => app.get(DefinirNaturezaPadrao);

    it('o dono troca a própria', async () => {
      await preferencia().executar(donoA, { usuarioId: DONO_A, natureza: 'pessoal' });
      await preferencia().executar(donoA, { usuarioId: DONO_A, natureza: 'empresa' });
      const { rows } = await pglite.query<{ natureza_padrao: string; versao: number }>(
        'select natureza_padrao, versao from financas.preferencia_usuario where usuario_id = $1',
        [DONO_A],
      );
      expect(rows[0]).toEqual({ natureza_padrao: 'empresa', versao: 2 });
    });

    it('trocar a de outro usuário → 403; valor fora da lista → 422', async () => {
      expect(await codigoDoErro(preferencia().executar(donoA, { usuarioId: DONO_B, natureza: 'pessoal' }))).toBe('preferencia_de_outro_usuario');
      expect(await codigoDoErro(preferencia().executar(donoA, { usuarioId: DONO_A, natureza: 'familia' }))).toBe('natureza_invalida');
    });
  });

  it('dono de outra organização não mexe nos cadastros desta (403)', async () => {
    const id = await idDe(`select id from financas.categoria where organizacao_id = $1 and nome = 'Aluguel'`, [orgA]);
    expect(await codigoDoErro(categorias().alterar(donoB, id, { nome: 'Invadido' }))).toBe('sem_permissao_na_organizacao');
    expect(await codigoDoErro(categorias().criar(donoB, { id: novoId(), organizacaoId: orgA, tipo: 'saida', nome: 'X' }))).toBe('sem_permissao_na_organizacao');
  });

  it('reenviar a mesma criação não duplica', async () => {
    const id = novoId();
    await veiculos().criar(donoA, { id, organizacaoId: orgA, nome: 'Trator' });
    await veiculos().criar(donoA, { id, organizacaoId: orgA, nome: 'Trator' });
    const { rows } = await pglite.query('select id from financas.tipo_veiculo where id = $1', [id]);
    expect(rows).toHaveLength(1);
  });
});
