import { describe, expect, it } from 'vitest';
import { ErroDeConfiguracao, carregarConfiguracao } from './configuracao';

const URL_API = 'postgresql://api_lavajato:segredo@db.exemplo.supabase.co:5432/postgres';

describe('configuração por variáveis de ambiente', () => {
  // CA-01.12.5
  it('não sobe sem DATABASE_URL e diz qual variável falta, sem mostrar valores', () => {
    try {
      carregarConfiguracao({ PORTA: '3000', DATABASE_URL: '' });
      expect.unreachable();
    } catch (erro) {
      expect(erro).toBeInstanceOf(ErroDeConfiguracao);
      expect((erro as Error).message).toContain('DATABASE_URL');
    }
  });

  it('carrega a configuração válida, com porta padrão 3000', () => {
    expect(carregarConfiguracao({ DATABASE_URL: URL_API })).toEqual({ PORTA: 3000, DATABASE_URL: URL_API });
  });

  // CA-01.12.6
  it.each([
    'postgresql://postgres:segredo@db.exemplo.supabase.co:5432/postgres',
    'postgresql://postgres.abcdef:segredo@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    'postgresql://service_role:segredo@db.exemplo.supabase.co:5432/postgres',
  ])('recusa usuário administrador fora da máquina local (%s)', (url) => {
    expect(() => carregarConfiguracao({ DATABASE_URL: url })).toThrow(/api_lavajato/);
  });

  it('a mensagem de erro não mostra a senha', () => {
    expect(() =>
      carregarConfiguracao({ DATABASE_URL: 'postgresql://postgres:minha-senha@db.exemplo.supabase.co/postgres' }),
    ).toThrow(expect.objectContaining({ message: expect.not.stringContaining('minha-senha') }));
  });

  it('aceita postgres no Supabase local (só desenvolvimento)', () => {
    const local = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
    expect(carregarConfiguracao({ DATABASE_URL: local }).DATABASE_URL).toBe(local);
  });
});
