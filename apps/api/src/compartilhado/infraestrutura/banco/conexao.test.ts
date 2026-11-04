import { describe, expect, it } from 'vitest';
import { converterInt8 } from './conexao';

describe('int8 do Postgres como número seguro (Dinheiro em centavos)', () => {
  it('converte bigint em number', () => {
    expect(converterInt8('3550')).toBe(3550);
    expect(converterInt8('-2550')).toBe(-2550);
    expect(converterInt8('9007199254740991')).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('recusa valor que perderia precisão', () => {
    expect(() => converterInt8('9007199254740993')).toThrow(RangeError);
  });
});
