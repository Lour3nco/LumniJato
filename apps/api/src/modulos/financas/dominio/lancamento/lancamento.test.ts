import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ErroDeDominio } from '../../../../compartilhado/dominio/erros';
import type { AutoriaDaOperacao } from './eventos';
import {
  type CategoriaDoLancamento,
  type ContextoDaOperacao,
  type DadosParaEditar,
  type DadosParaRegistrar,
  Lancamento,
} from './lancamento';

/** FIN-US-01.14 · Agregado Lancamento, sem banco (CA-01.14.1 a CA-01.14.9). */

const ALIMENTACAO: CategoriaDoLancamento = { id: 'cat-alim', tipo: 'saida', ehServicos: false, ativa: true };
const ENERGIA: CategoriaDoLancamento = { id: 'cat-energia', tipo: 'saida', ehServicos: false, ativa: true };
const SERVICOS: CategoriaDoLancamento = { id: 'cat-serv', tipo: 'entrada', ehServicos: true, ativa: true };
const VENDA: CategoriaDoLancamento = { id: 'cat-venda', tipo: 'entrada', ehServicos: false, ativa: true };

// 04/11 12h00 em São Paulo
const CONTEXTO: ContextoDaOperacao = { fusoDaUnidade: 'America/Sao_Paulo', agoraServidor: new Date('2026-11-04T15:00:00Z') };
const AUTORIA: AutoriaDaOperacao = {
  usuarioId: 'u-dono',
  dispositivoId: 'd-celular',
  quando: new Date('2026-11-04T14:59:00Z'),
};
let sequencia = 0;
const novoId = () => `0192f0c1-0000-7000-8000-${String(++sequencia).padStart(12, '0')}`;

function saida(extra: Partial<DadosParaRegistrar> = {}): DadosParaRegistrar {
  return {
    id: novoId(),
    unidadeId: 'U1',
    tipo: 'saida',
    natureza: 'empresa',
    valorCentavos: 2500,
    dataLancamento: '2026-11-04',
    categoria: ALIMENTACAO,
    formaPagamentoId: 'pix',
    ...extra,
  };
}

function servico(extra: Partial<DadosParaRegistrar> = {}): DadosParaRegistrar {
  return saida({ tipo: 'entrada', categoria: SERVICOS, tipoVeiculoId: 'carro', valorCentavos: 6000, ...extra });
}

function edicaoDe(lancamento: Lancamento, extra: Partial<DadosParaEditar> = {}): DadosParaEditar {
  const e = lancamento.instantaneo();
  const categoria = [ALIMENTACAO, ENERGIA, SERVICOS, VENDA].find((c) => c.id === e.categoriaId)!;
  return {
    tipo: e.tipo,
    natureza: e.natureza,
    valorCentavos: e.valorCentavos,
    dataLancamento: e.dataLancamento,
    categoria,
    tipoServicoId: e.tipoServicoId,
    tipoVeiculoId: e.tipoVeiculoId,
    formaPagamentoId: e.formaPagamentoId,
    descricao: e.descricao,
    ...extra,
  };
}

function codigoDoErro(acao: () => unknown): string | undefined {
  try {
    acao();
  } catch (erro) {
    if (erro instanceof ErroDeDominio) return erro.codigo;
    throw erro;
  }
  return undefined;
}

describe('agregado Lancamento (FIN-US-01.14)', () => {
  // CA-01.14.1
  it.each([
    [0, 'valor_invalido'],
    [-1, 'valor_invalido'],
    [1, undefined],
    [99999999, undefined],
    [100000000, 'valor_acima_do_maximo'],
    [10.5, 'valor_invalido'],
  ])('valor de %d centavos → %s', (valorCentavos, esperado) => {
    expect(codigoDoErro(() => Lancamento.registrar(saida({ valorCentavos }), AUTORIA, CONTEXTO))).toBe(esperado);
  });

  // CA-01.14.2
  describe('data no fuso da unidade', () => {
    // 04/11 02h30 UTC = 03/11 23h30 em São Paulo
    const madrugada: ContextoDaOperacao = { fusoDaUnidade: 'America/Sao_Paulo', agoraServidor: new Date('2026-11-04T02:30:00Z') };

    it('03/11 é aceito (é "hoje" em São Paulo)', () => {
      expect(codigoDoErro(() => Lancamento.registrar(saida({ dataLancamento: '2026-11-03' }), AUTORIA, madrugada))).toBeUndefined();
    });

    it('04/11 é recusado como data futura', () => {
      expect(codigoDoErro(() => Lancamento.registrar(saida({ dataLancamento: '2026-11-04' }), AUTORIA, madrugada))).toBe('data_futura');
    });

    it('data passada é permitida, sem limite', () => {
      expect(codigoDoErro(() => Lancamento.registrar(saida({ dataLancamento: '2020-01-01' }), AUTORIA, CONTEXTO))).toBeUndefined();
    });
  });

  // CA-01.14.3
  describe('categoria', () => {
    it('de tipo diferente do lançamento é recusada', () => {
      expect(codigoDoErro(() => Lancamento.registrar(saida({ categoria: VENDA }), AUTORIA, CONTEXTO))).toBe('categoria_de_outro_tipo');
    });

    it('desativada é recusada num lançamento novo', () => {
      const desativada = { ...ALIMENTACAO, ativa: false };
      expect(codigoDoErro(() => Lancamento.registrar(saida({ categoria: desativada }), AUTORIA, CONTEXTO))).toBe('categoria_desativada');
    });

    it('editar um lançamento antigo cuja categoria foi desativada depois continua permitido', () => {
      const lancamento = Lancamento.registrar(saida(), AUTORIA, CONTEXTO);
      const desativadaDepois = { ...ALIMENTACAO, ativa: false };
      expect(codigoDoErro(() => lancamento.editar(edicaoDe(lancamento, { categoria: desativadaDepois, valorCentavos: 3000 }), AUTORIA, CONTEXTO))).toBeUndefined();
    });

    it('trocar para outra categoria desativada na edição é recusado', () => {
      const lancamento = Lancamento.registrar(saida(), AUTORIA, CONTEXTO);
      expect(codigoDoErro(() => lancamento.editar(edicaoDe(lancamento, { categoria: { ...ENERGIA, ativa: false } }), AUTORIA, CONTEXTO))).toBe('categoria_desativada');
    });
  });

  // CA-01.14.4
  describe('serviço × veículo (E2-04 a)', () => {
    it('Serviços com veículo e sem tipo de serviço é aceito', () => {
      expect(codigoDoErro(() => Lancamento.registrar(servico({ tipoServicoId: null }), AUTORIA, CONTEXTO))).toBeUndefined();
    });

    it('Serviços sem veículo é recusado', () => {
      expect(codigoDoErro(() => Lancamento.registrar(servico({ tipoVeiculoId: null, tipoServicoId: 'polimento' }), AUTORIA, CONTEXTO))).toBe('veiculo_obrigatorio');
    });

    it('vale para a categoria de código servicos mesmo renomeada', () => {
      const renomeada = { ...SERVICOS, id: 'cat-lavagens' }; // nome não importa, só ehServicos
      expect(codigoDoErro(() => Lancamento.registrar(servico({ categoria: renomeada, tipoVeiculoId: null }), AUTORIA, CONTEXTO))).toBe('veiculo_obrigatorio');
    });

    it.each([
      ['saída com veículo', { tipoVeiculoId: 'carro' }],
      ['saída com tipo de serviço', { tipoServicoId: 'polimento' }],
    ])('%s é recusada', (_caso, extra) => {
      expect(codigoDoErro(() => Lancamento.registrar(saida(extra), AUTORIA, CONTEXTO))).toBe('servico_ou_veiculo_fora_de_servicos');
    });

    it('outra entrada com veículo é recusada', () => {
      expect(codigoDoErro(() => Lancamento.registrar(saida({ tipo: 'entrada', categoria: VENDA, tipoVeiculoId: 'carro' }), AUTORIA, CONTEXTO))).toBe('servico_ou_veiculo_fora_de_servicos');
    });
  });

  // CA-01.14.5
  describe('edição não troca o tipo (F-13)', () => {
    it('trocar entrada ↔ saída é recusado', () => {
      const lancamento = Lancamento.registrar(saida(), AUTORIA, CONTEXTO);
      expect(codigoDoErro(() => lancamento.editar(edicaoDe(lancamento, { tipo: 'entrada', categoria: VENDA }), AUTORIA, CONTEXTO))).toBe('troca_de_tipo');
    });

    it('passar de outra entrada para Serviços é recusado', () => {
      const lancamento = Lancamento.registrar(saida({ tipo: 'entrada', categoria: VENDA }), AUTORIA, CONTEXTO);
      expect(codigoDoErro(() => lancamento.editar(edicaoDe(lancamento, { categoria: SERVICOS, tipoVeiculoId: 'carro' }), AUTORIA, CONTEXTO))).toBe('troca_de_tipo');
    });

    it('passar de Serviços para outra entrada é recusado', () => {
      const lancamento = Lancamento.registrar(servico(), AUTORIA, CONTEXTO);
      expect(codigoDoErro(() => lancamento.editar(edicaoDe(lancamento, { categoria: VENDA, tipoVeiculoId: null }), AUTORIA, CONTEXTO))).toBe('troca_de_tipo');
    });

    it('trocar entre outras categorias do mesmo tipo é permitido', () => {
      const lancamento = Lancamento.registrar(saida(), AUTORIA, CONTEXTO);
      expect(codigoDoErro(() => lancamento.editar(edicaoDe(lancamento, { categoria: ENERGIA }), AUTORIA, CONTEXTO))).toBeUndefined();
    });
  });

  // CA-01.14.6
  it('lançamento excluído não pode ser editado, só restaurado', () => {
    const lancamento = Lancamento.registrar(saida(), AUTORIA, CONTEXTO);
    lancamento.excluir(AUTORIA);
    expect(codigoDoErro(() => lancamento.editar(edicaoDe(lancamento, { valorCentavos: 9999 }), AUTORIA, CONTEXTO))).toBe('lancamento_excluido');
    expect(codigoDoErro(() => lancamento.restaurar(AUTORIA, CONTEXTO))).toBeUndefined();
    expect(lancamento.excluido).toBe(false);
  });

  // CA-01.14.7
  describe('lixeira de 90 dias (F-09)', () => {
    function excluidoHa(dias: number) {
      const lancamento = Lancamento.registrar(saida({ dataLancamento: '2026-01-01' }), AUTORIA, CONTEXTO);
      const excluidoEm = new Date(CONTEXTO.agoraServidor.getTime() - dias * 24 * 60 * 60 * 1000);
      lancamento.excluir({ ...AUTORIA, quando: excluidoEm });
      return lancamento;
    }

    it('excluído há 90 dias pode ser restaurado', () => {
      expect(codigoDoErro(() => excluidoHa(90).restaurar(AUTORIA, CONTEXTO))).toBeUndefined();
    });

    it('excluído há 91 dias é recusado', () => {
      expect(codigoDoErro(() => excluidoHa(91).restaurar(AUTORIA, CONTEXTO))).toBe('prazo_da_lixeira_vencido');
    });
  });

  // CA-01.14.8
  describe('eventos de domínio', () => {
    it('criar emite LancamentoRegistrado com o estado criado', () => {
      const lancamento = Lancamento.registrar(saida({ descricao: '  almoço  ' }), AUTORIA, CONTEXTO);
      const eventos = lancamento.retirarEventos();
      expect(eventos.map((e) => e.nome)).toEqual(['lancamento.criado']);
      expect(lancamento.instantaneo()).toMatchObject({
        versao: 1,
        situacao: 'realizado',
        origem: 'manual',
        descricao: 'almoço',
        criadoPor: 'u-dono',
        dispositivoId: 'd-celular',
      });
    });

    it('editar emite LancamentoAlterado com os campos alterados e sobe a versão', () => {
      const lancamento = Lancamento.registrar(saida(), AUTORIA, CONTEXTO);
      lancamento.retirarEventos();
      lancamento.editar(edicaoDe(lancamento, { valorCentavos: 3500, categoria: ENERGIA }), AUTORIA, CONTEXTO);
      const [evento] = lancamento.retirarEventos();
      expect(evento).toMatchObject({
        nome: 'lancamento.alterado',
        camposAlterados: ['valorCentavos', 'categoriaId'],
        antes: expect.objectContaining({ valorCentavos: 2500, versao: 1 }),
        depois: expect.objectContaining({ valorCentavos: 3500, versao: 2 }),
        conflito: false,
      });
    });

    it('editar sem mudar nada não emite evento nem sobe a versão', () => {
      const lancamento = Lancamento.registrar(saida(), AUTORIA, CONTEXTO);
      lancamento.retirarEventos();
      lancamento.editar(edicaoDe(lancamento), AUTORIA, CONTEXTO);
      expect(lancamento.retirarEventos()).toEqual([]);
      expect(lancamento.instantaneo().versao).toBe(1);
    });

    it('edição sobre versão antiga é marcada como conflito (para a v1.1)', () => {
      const lancamento = Lancamento.registrar(saida(), AUTORIA, CONTEXTO);
      lancamento.editar(edicaoDe(lancamento, { valorCentavos: 3000 }), AUTORIA, CONTEXTO);
      lancamento.retirarEventos();
      lancamento.editar(edicaoDe(lancamento, { valorCentavos: 4000, versaoBase: 1 }), AUTORIA, CONTEXTO);
      expect(lancamento.retirarEventos()[0]).toMatchObject({ conflito: true });
    });

    it('excluir e restaurar emitem LancamentoExcluido e LancamentoRestaurado', () => {
      const lancamento = Lancamento.registrar(saida(), AUTORIA, CONTEXTO);
      lancamento.retirarEventos();
      lancamento.excluir(AUTORIA);
      lancamento.restaurar(AUTORIA, CONTEXTO);
      expect(lancamento.retirarEventos().map((e) => e.nome)).toEqual(['lancamento.excluido', 'lancamento.restaurado']);
      expect(lancamento.instantaneo().versao).toBe(3);
    });

    it('excluir de novo um excluído não emite nada [SUPOSIÇÃO CA-01.15.5]', () => {
      const lancamento = Lancamento.registrar(saida(), AUTORIA, CONTEXTO);
      lancamento.excluir(AUTORIA);
      lancamento.retirarEventos();
      lancamento.excluir(AUTORIA);
      expect(lancamento.retirarEventos()).toEqual([]);
    });

    it('operação recusada não emite nada', () => {
      const lancamento = Lancamento.registrar(saida(), AUTORIA, CONTEXTO);
      lancamento.retirarEventos();
      expect(() => lancamento.editar(edicaoDe(lancamento, { valorCentavos: 0 }), AUTORIA, CONTEXTO)).toThrow(ErroDeDominio);
      expect(lancamento.retirarEventos()).toEqual([]);
      expect(lancamento.instantaneo().valorCentavos).toBe(2500);
    });
  });

  it('descrição acima de 200 caracteres é recusada', () => {
    expect(codigoDoErro(() => Lancamento.registrar(saida({ descricao: 'x'.repeat(201) }), AUTORIA, CONTEXTO))).toBe('descricao_longa');
  });

  // CA-01.14.9
  it('o domínio de Finanças não importa NestJS, driver de banco nem HTTP', () => {
    const pasta = join(__dirname, '..');
    const arquivos: string[] = [];
    const visitar = (dir: string) => {
      for (const nome of readdirSync(dir)) {
        const caminho = join(dir, nome);
        if (statSync(caminho).isDirectory()) visitar(caminho);
        else if (caminho.endsWith('.ts') && !caminho.endsWith('.test.ts')) arquivos.push(caminho);
      }
    };
    visitar(pasta);
    expect(arquivos.length).toBeGreaterThan(0);
    const proibidos = /from ['"](@nestjs\/|pg['"]|kysely|express|node:http|axios|@supabase\/)/;
    const violacoes = arquivos.filter((arquivo) => proibidos.test(readFileSync(arquivo, 'utf8')));
    expect(violacoes).toEqual([]);
  });
});
