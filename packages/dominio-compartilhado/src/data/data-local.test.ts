import { describe, expect, it } from 'vitest';
import { ehDataValida, hojeNoFuso, rotuloData, somarDias } from './data-local';

describe('datas locais', () => {
  it('calcula "hoje" no fuso da unidade, não em UTC', () => {
    // 05/11 02:30 em UTC ainda é 04/11 23:30 em São Paulo (UTC−3).
    const agora = new Date('2026-11-05T02:30:00Z');
    expect(hojeNoFuso('America/Sao_Paulo', agora)).toBe('2026-11-04');
    expect(hojeNoFuso('UTC', agora)).toBe('2026-11-05');
  });

  // CA-01.9.3
  it.each([
    ['2026-11-04', 'Hoje'],
    ['2026-11-03', 'Ontem'],
    ['2026-11-02', '02/11'],
    ['2026-10-31', '31/10'],
  ])('rotula %s como "%s" quando hoje é 04/11', (data, esperado) => {
    expect(rotuloData(data, '2026-11-04')).toBe(esperado);
  });

  it('reconhece "Ontem" na virada do mês e do ano', () => {
    expect(rotuloData('2026-10-31', '2026-11-01')).toBe('Ontem');
    expect(rotuloData('2025-12-31', '2026-01-01')).toBe('Ontem');
  });

  it('soma dias atravessando meses', () => {
    expect(somarDias('2026-02-28', 1)).toBe('2026-03-01');
    expect(somarDias('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('recusa datas inexistentes', () => {
    expect(ehDataValida('2026-02-30')).toBe(false);
    expect(ehDataValida('2026-11-04')).toBe(true);
    expect(() => rotuloData('04/11/2026', '2026-11-04')).toThrow(RangeError);
  });
});
