import { describe, expect, it } from 'vitest';
import { PADRAO_UUID_V7, gerarUuidV7, horarioDoUuidV7 } from './uuid-v7';

describe('gerarUuidV7', () => {
  it('gera UUID versão 7 com a variante da RFC', () => {
    expect(gerarUuidV7()).toMatch(PADRAO_UUID_V7);
  });

  it('grava o horário em milissegundos', () => {
    const ms = Date.UTC(2030, 0, 1);
    expect(horarioDoUuidV7(gerarUuidV7(ms))).toBe(ms);
  });

  it('fica em ordem crescente, inclusive dentro do mesmo milissegundo', () => {
    const ms = Date.UTC(2031, 5, 1);
    const ids = Array.from({ length: 1000 }, (_, i) => gerarUuidV7(ms + Math.floor(i / 100)));
    expect([...ids].sort()).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('não volta no tempo se o relógio atrasar', () => {
    const primeiro = gerarUuidV7(Date.UTC(2032, 0, 1));
    const depois = gerarUuidV7(Date.UTC(2031, 0, 1));
    expect(depois > primeiro).toBe(true);
  });
});
