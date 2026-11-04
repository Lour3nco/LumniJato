import { describe, expect, it } from 'vitest';
import { ErroDeConfiguracao, carregarConfiguracao } from './configuracao';

const URL_API = 'postgresql://api_lavajato:segredo@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';
const SUPABASE_URL = 'https://exemplo.supabase.co';

describe('configuração por variáveis de ambiente', () => {
  // CA-01.12.5
  it('não sobe sem DATABASE_URL e diz qual variável falta, sem mostrar valores', () => {
    try {
      carregarConfiguracao({ PORTA: '3000', DATABASE_URL: '', SUPABASE_URL });
      expect.unreachable();
    } catch (erro) {
      expect(erro).toBeInstanceOf(ErroDeConfiguracao);
      expect((erro as Error).message).toContain('DATABASE_URL');
    }
  });

  it('não sobe sem SUPABASE_URL (validação do JWT, FIN-US-01.13)', () => {
    expect(() => carregarConfiguracao({ DATABASE_URL: URL_API })).toThrow(/SUPABASE_URL/);
  });

  it('carrega a configuração válida, com porta padrão 3000', () => {
    expect(carregarConfiguracao({ DATABASE_URL: URL_API, SUPABASE_URL })).toEqual({
      PORTA: 3000,
      DATABASE_URL: URL_API,
      SUPABASE_URL,
    });
  });

  it('aceita api_lavajato no formato do pooler (usuario.<ref>)', () => {
    const pooler = 'postgresql://api_lavajato.abcdef:segredo@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';
    expect(carregarConfiguracao({ DATABASE_URL: pooler, SUPABASE_URL }).DATABASE_URL).toBe(pooler);
  });

  // CA-01.12.6 — lista permitida: fora do localhost, só api_lavajato
  it.each([
    'postgresql://postgres:segredo@db.exemplo.supabase.co:5432/postgres',
    'postgresql://postgres.abcdef:segredo@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    'postgresql://service_role:segredo@db.exemplo.supabase.co:5432/postgres',
    'postgresql://powersync_replicacao:segredo@db.exemplo.supabase.co:5432/postgres',
    'postgresql://qualquer_outro:segredo@db.exemplo.supabase.co:5432/postgres',
  ])('recusa outro usuário fora da máquina local (%s)', (url) => {
    expect(() => carregarConfiguracao({ DATABASE_URL: url, SUPABASE_URL })).toThrow(/api_lavajato/);
  });

  it('a mensagem de erro não mostra a senha', () => {
    expect(() =>
      carregarConfiguracao({
        DATABASE_URL: 'postgresql://postgres:minha-senha@db.exemplo.supabase.co/postgres',
        SUPABASE_URL,
      }),
    ).toThrow(expect.objectContaining({ message: expect.not.stringContaining('minha-senha') }));
  });

  it('aceita postgres no Supabase local (só desenvolvimento)', () => {
    const local = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
    expect(carregarConfiguracao({ DATABASE_URL: local, SUPABASE_URL }).DATABASE_URL).toBe(local);
  });
});
