import { describe, expect, it } from 'vitest';
import { DataLocal } from './data-local';
import { Dinheiro } from './dinheiro';
import { ErroDeDominio } from './erros';
import { Id } from './id';
import { Resultado } from './resultado';

// CA-01.12.7 · kernel compartilhado
describe('Id', () => {
  it('gera UUID v7 ordenável pelo tempo', () => {
    const ids = Array.from({ length: 50 }, () => Id.gerar().valor);
    expect(ids.every((id) => Id.de(id).ehV7())).toBe(true);
    expect([...ids].sort()).toEqual(ids);
  });

  it('aceita UUID vindo do aparelho e recusa texto inválido', () => {
    expect(Id.de('0192F0C1-0000-7000-8000-000000000001').valor).toBe('0192f0c1-0000-7000-8000-000000000001');
    expect(() => Id.de('nao-e-uuid')).toThrow(ErroDeDominio);
  });
});

describe('Dinheiro', () => {
  it('só aceita centavos inteiros', () => {
    expect(() => Dinheiro.deCentavos(10.5)).toThrow(ErroDeDominio);
    expect(() => Dinheiro.deCentavos(Number.MAX_SAFE_INTEGER + 1)).toThrow(ErroDeDominio);
    expect(Dinheiro.deCentavos(3550).centavos).toBe(3550);
  });

  it('soma sem perda (onde número com vírgula erraria)', () => {
    // 0,1 + 0,2 em ponto flutuante dá 0,30000000000000004; em centavos dá 30 exatos.
    expect(Dinheiro.deCentavos(10).somar(Dinheiro.deCentavos(20)).centavos).toBe(30);
    const muitos = Array.from({ length: 10_000 }, () => Dinheiro.deCentavos(1));
    expect(Dinheiro.somarTodos(muitos).centavos).toBe(10_000);
  });

  it('subtrai e formata em reais', () => {
    const saldo = Dinheiro.deCentavos(1000).subtrair(Dinheiro.deCentavos(3550));
    expect(saldo.centavos).toBe(-2550);
    expect(saldo.toString()).toBe('−R$ 25,50');
  });
});

describe('DataLocal', () => {
  it('calcula "hoje" no fuso informado', () => {
    const agora = new Date('2026-11-05T01:00:00Z'); // 22h do dia 04 em São Paulo
    expect(DataLocal.hoje('America/Sao_Paulo', agora).valor).toBe('2026-11-04');
    expect(DataLocal.hoje('UTC', agora).valor).toBe('2026-11-05');
  });

  it('compara datas e recusa data inválida', () => {
    const hoje = DataLocal.de('2026-11-04');
    expect(DataLocal.de('2026-11-05').ehDepoisDe(hoje)).toBe(true);
    expect(hoje.somarDias(-1).valor).toBe('2026-11-03');
    expect(() => DataLocal.de('2026-13-01')).toThrow(ErroDeDominio);
  });
});

describe('Resultado', () => {
  it('carrega sucesso ou falha sem exceção', () => {
    const ok = Resultado.sucesso(1);
    const falha = Resultado.falha(new ErroDeDominio('x', 'Falhou.'));
    expect(Resultado.obter(ok)).toBe(1);
    expect(() => Resultado.obter(falha)).toThrow('Falhou.');
  });
});
