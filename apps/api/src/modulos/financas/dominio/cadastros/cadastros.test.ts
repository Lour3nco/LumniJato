import { describe, expect, it } from 'vitest';
import { ErroDeDominio } from '../../../../compartilhado/dominio/erros';
import { Categoria, type EstadoDaCategoria } from './categoria';
import { NomeNormalizado } from './nome-normalizado';
import { ICONE_GENERICO_DE_VEICULO, TipoDeCadastro } from './tipo-de-cadastro';

/** FIN-US-01.16 · Agregados de cadastro e NomeNormalizado, sem banco (CA-01.16.8). */

const AUTORIA = { usuarioId: 'u-dono', quando: new Date('2026-11-04T12:00:00Z') };
let n = 0;
const novoId = () => `0192f0c1-0000-7000-8000-${String(++n).padStart(12, '0')}`;

function codigoDoErro(acao: () => unknown): string | undefined {
  try {
    acao();
  } catch (erro) {
    if (erro instanceof ErroDeDominio) return erro.codigo;
    throw erro;
  }
  return undefined;
}

function categoriaDeSistema(): Categoria {
  const estado: EstadoDaCategoria = {
    id: novoId(),
    organizacaoId: 'O1',
    tipo: 'entrada',
    nome: 'Serviços',
    icone: 'servicos',
    cor: '#1B7F3B',
    aplicaA: 'ambos',
    sistema: true,
    codigo: 'servicos',
    ordem: 1,
    ativa: true,
    versao: 1,
    criadoEm: AUTORIA.quando,
    criadoPor: null,
    alteradoEm: AUTORIA.quando,
    alteradoPor: null,
  };
  return Categoria.reconstituir(estado);
}

describe('NomeNormalizado (F-16)', () => {
  it.each(['agua', ' Água ', 'ÁGUA', 'Agua'])('"%s" tem a mesma chave que "Água"', (nome) => {
    expect(NomeNormalizado.de(nome).mesmaChave(NomeNormalizado.de('Água'))).toBe(true);
  });

  it('tira só os espaços das pontas e guarda como o dono escreveu', () => {
    expect(NomeNormalizado.de('  Lavagem  completa ').nome).toBe('Lavagem  completa');
  });

  it('recusa nome vazio ou longo demais', () => {
    expect(codigoDoErro(() => NomeNormalizado.de('   '))).toBe('nome_obrigatorio');
    expect(codigoDoErro(() => NomeNormalizado.de('x'.repeat(61)))).toBe('nome_longo');
  });
});

describe('Categoria', () => {
  it('a criada pelo dono nasce ativa, sem sistema e sem código', () => {
    const categoria = Categoria.criar({ id: novoId(), organizacaoId: 'O1', tipo: 'saida', nome: ' Energia ', cor: '#F9A825' }, AUTORIA);
    expect(categoria.instantaneo()).toMatchObject({ nome: 'Energia', sistema: false, codigo: null, ativa: true, versao: 1 });
    expect(categoria.retirarEventos().map((e) => e.nome)).toEqual(['categoria.alterada']);
  });

  // CA-01.16.3
  it('a de sistema troca nome, ícone e cor', () => {
    const categoria = categoriaDeSistema();
    expect(categoria.alterar({ nome: 'Lavagens', icone: 'carro', cor: '#00695C' }, AUTORIA)).toBe(true);
    expect(categoria.instantaneo()).toMatchObject({ nome: 'Lavagens', icone: 'carro', cor: '#00695C', versao: 2, codigo: 'servicos' });
  });

  it('a de sistema não pode ser desativada', () => {
    expect(codigoDoErro(() => categoriaDeSistema().alterar({ ativa: false }, AUTORIA))).toBe('categoria_de_sistema_nao_desativa');
  });

  it('ninguém transforma categoria comum em de sistema (nem muda o código)', () => {
    const comum = Categoria.criar({ id: novoId(), organizacaoId: 'O1', tipo: 'saida', nome: 'Gás' }, AUTORIA);
    expect(codigoDoErro(() => comum.alterar({ sistema: true }, AUTORIA))).toBe('categoria_de_sistema_imutavel');
    expect(codigoDoErro(() => categoriaDeSistema().alterar({ codigo: 'produtos' }, AUTORIA))).toBe('categoria_de_sistema_imutavel');
  });

  // CA-01.16.4
  it('o tipo (entrada ↔ saída) não muda', () => {
    const comum = Categoria.criar({ id: novoId(), organizacaoId: 'O1', tipo: 'saida', nome: 'Gás' }, AUTORIA);
    expect(codigoDoErro(() => comum.alterar({ tipo: 'entrada' }, AUTORIA))).toBe('troca_de_tipo_da_categoria');
  });

  it('desativar e reativar a comum funciona; sem mudança, nada acontece', () => {
    const comum = Categoria.criar({ id: novoId(), organizacaoId: 'O1', tipo: 'saida', nome: 'Gás' }, AUTORIA);
    comum.retirarEventos();
    expect(comum.alterar({ ativa: false }, AUTORIA)).toBe(true);
    expect(comum.alterar({ ativa: true }, AUTORIA)).toBe(true);
    expect(comum.alterar({ nome: 'Gás' }, AUTORIA)).toBe(false);
    expect(comum.retirarEventos()).toHaveLength(2);
  });

  it('recusa cor fora do formato #RRGGBB', () => {
    expect(codigoDoErro(() => Categoria.criar({ id: novoId(), organizacaoId: 'O1', tipo: 'saida', nome: 'X', cor: 'azul' }, AUTORIA))).toBe('cor_invalida');
  });
});

describe('TipoServico e TipoVeiculo', () => {
  // CA-01.16.5
  it('tipo de veículo criado sem ícone recebe o genérico', () => {
    const veiculo = TipoDeCadastro.criar('tipo_veiculo', { id: novoId(), organizacaoId: 'O1', nome: 'Ônibus' }, AUTORIA);
    expect(veiculo.instantaneo().icone).toBe(ICONE_GENERICO_DE_VEICULO);
    expect(veiculo.retirarEventos().map((e) => e.nome)).toEqual(['tipo_veiculo.alterado']);
  });

  it('tipo de serviço não tem ícone', () => {
    const servico = TipoDeCadastro.criar('tipo_servico', { id: novoId(), organizacaoId: 'O1', nome: 'Cera', icone: 'x' }, AUTORIA);
    expect(servico.instantaneo().icone).toBeNull();
    expect(codigoDoErro(() => servico.alterar({ icone: 'carro' }, AUTORIA))).toBe('campo_invalido');
  });

  it('renomear, desativar, reativar e reordenar sobem a versão', () => {
    const servico = TipoDeCadastro.criar('tipo_servico', { id: novoId(), organizacaoId: 'O1', nome: 'Cera' }, AUTORIA);
    servico.alterar({ nome: 'Cera líquida' }, AUTORIA);
    servico.alterar({ ativo: false }, AUTORIA);
    servico.alterar({ ativo: true, ordem: 9 }, AUTORIA);
    expect(servico.instantaneo()).toMatchObject({ nome: 'Cera líquida', ativo: true, ordem: 9, versao: 4 });
  });
});
