import { describe, expect, it } from 'vitest';
import { CASOS_NORMALIZACAO_NOME } from './casos-normalizacao';
import { normalizarNome } from './normalizar-nome';

describe('normalizarNome (F-16)', () => {
  // CA-01.17.1 e base do CA-01.17.2: a mesma tabela é comparada com o `nome_chave` do Postgres.
  it.each(CASOS_NORMALIZACAO_NOME)('"%s" → "%s"', (entrada, esperado) => {
    expect(normalizarNome(entrada)).toBe(esperado);
  });

  it('trata como iguais nomes que só diferem em maiúsculas, acentos e espaços nas pontas', () => {
    const variantes = ['água', 'Água', 'Agua', ' agua ', 'AGUA'];
    expect(new Set(variantes.map(normalizarNome)).size).toBe(1);
  });

  it('tira só o caractere espaço das pontas, como o btrim do Postgres', () => {
    expect(normalizarNome('\tÁgua')).toBe('\tagua');
  });

  it('não muda o que já está normalizado', () => {
    const nome = 'lavagem rapida';
    expect(normalizarNome(normalizarNome(nome))).toBe(nome);
  });
});
