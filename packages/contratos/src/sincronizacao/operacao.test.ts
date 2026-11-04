import { describe, expect, it } from 'vitest';
import { loteSincronizacaoSchema } from './operacao';
import { resultadoLoteSchema } from './resultado';

describe('contrato do lote de sincronização', () => {
  it('aceita um lote com uma operação válida', () => {
    const lote = {
      operacoes: [
        {
          op: 'PUT',
          tabela: 'lancamento',
          id: '0192f1a0-7c3e-7b1a-9d4e-1a2b3c4d5e6f',
          dados: { valor_centavos: 2500 },
        },
      ],
    };
    expect(loteSincronizacaoSchema.safeParse(lote).success).toBe(true);
  });

  it('recusa operação desconhecida, id inválido e lote vazio', () => {
    expect(
      loteSincronizacaoSchema.safeParse({
        operacoes: [{ op: 'MERGE', tabela: 'lancamento', id: '1' }],
      }).success,
    ).toBe(false);
    expect(loteSincronizacaoSchema.safeParse({ operacoes: [] }).success).toBe(false);
  });
});

describe('contrato do resultado do lote', () => {
  it('aceita resultado aceito e recusado com motivo', () => {
    const resposta = {
      resultados: [
        { id: '0192f1a0-7c3e-7b1a-9d4e-1a2b3c4d5e6f', situacao: 'aceita' },
        {
          id: '0192f1a0-7c3e-7b1a-9d4e-1a2b3c4d5e70',
          situacao: 'recusada',
          motivo: 'dados',
          codigo: 'valor_invalido',
          mensagem: 'O valor precisa ser maior que zero.',
        },
      ],
    };
    expect(resultadoLoteSchema.safeParse(resposta).success).toBe(true);
    expect(
      resultadoLoteSchema.safeParse({ resultados: [{ id: resposta.resultados[1].id, situacao: 'recusada' }] }).success,
    ).toBe(false);
  });
});
