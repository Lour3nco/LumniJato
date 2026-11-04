import { describe, expect, it } from 'vitest';
import {
  VALOR_MAXIMO_CENTAVOS,
  apagarDigito,
  digitarDigito,
  digitarTexto,
  pedeConfirmacao,
  valorDentroDoLimite,
} from './entrada-de-valor';

function digitar(sequencia: string, inicial = 0): number {
  return [...sequencia].reduce((valor, d) => digitarDigito(valor, Number(d)), inicial);
}

describe('digitação estilo caixa registradora (FIN-US-02.1)', () => {
  // CA-02.1.2 e CB-a.6
  it.each([
    ['2', 2],
    ['25', 25],
    ['250', 250],
    ['2500', 2500],
    ['124000', 124000],
  ])('digitar %s dá %i centavos', (sequencia, esperado) => {
    expect(digitar(sequencia)).toBe(esperado);
  });

  // CA-02.1.3
  it('⌫ apaga o último dígito: R$ 25,00 → R$ 2,50', () => {
    expect(apagarDigito(2500)).toBe(250);
    expect(apagarDigito(5)).toBe(0);
    expect(apagarDigito(0)).toBe(0);
  });

  // CB-a.8
  it('zeros à esquerda não contam', () => {
    expect(digitar('000')).toBe(0);
    expect(digitar('0025')).toBe(25);
  });

  // CA-02.1.6 e CB-a.2
  it('no máximo R$ 999.999,99, mais um dígito não muda o valor', () => {
    expect(digitar('99999999')).toBe(VALOR_MAXIMO_CENTAVOS);
    expect(digitarDigito(VALOR_MAXIMO_CENTAVOS, 0)).toBe(VALOR_MAXIMO_CENTAVOS);
    expect(digitarDigito(10_000_000, 0)).toBe(10_000_000);
  });

  // CB-a.9
  it('texto colado: só os dígitos contam, sem vírgula', () => {
    expect(digitarTexto(0, '12,5')).toBe(125);
    expect(digitarTexto(0, 'abc')).toBe(0);
    expect(digitarTexto(0, 'R$ 35,50')).toBe(3550);
  });

  it('ignora "dígito" inválido', () => {
    expect(digitarDigito(25, 10)).toBe(25);
    expect(digitarDigito(25, -1)).toBe(25);
  });

  // CA-01.14.1 (mesmos limites do domínio)
  it.each([
    [0, false],
    [-1, false],
    [1, true],
    [99999999, true],
    [100000000, false],
    [10.5, false],
  ])('valor %d dentro do limite? %s', (centavos, esperado) => {
    expect(valorDentroDoLimite(centavos)).toBe(esperado);
  });

  // CB-a.4
  it('pede "Confere?" só acima de R$ 10.000,00', () => {
    expect(pedeConfirmacao(1_000_000)).toBe(false);
    expect(pedeConfirmacao(1_000_001)).toBe(true);
  });
});
