import { describe, expect, it } from 'vitest';
import { formatarReais } from './formatar-reais';

describe('formatarReais', () => {
  // CA-01.9.1
  it.each([
    [123456, 'R$ 1.234,56'],
    [5, 'R$ 0,05'],
    [0, 'R$ 0,00'],
    [99999999, 'R$ 999.999,99'],
    [3550, 'R$ 35,50'],
    [100, 'R$ 1,00'],
    [124000, 'R$ 1.240,00'],
    [123456789012, 'R$ 1.234.567.890,12'],
  ])('%i centavos → "%s"', (centavos, esperado) => {
    expect(formatarReais(centavos)).toBe(esperado);
  });

  // CA-01.9.2 (a cor vermelha fica no componente da interface)
  it('mostra negativo com o sinal − antes do R$', () => {
    expect(formatarReais(-2550)).toBe('−R$ 25,50');
  });

  it('recusa valor que não é centavo inteiro', () => {
    expect(() => formatarReais(10.5)).toThrow(RangeError);
  });
});
