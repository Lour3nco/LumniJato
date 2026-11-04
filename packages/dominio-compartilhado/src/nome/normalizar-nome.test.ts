import { describe, expect, it } from 'vitest';
import { normalizarNome } from './normalizar-nome';

describe('normalizarNome (F-16)', () => {
  // CA-01.17.1
  it.each([
    [' Água ', 'agua'],
    ['ÁGUA', 'agua'],
    ['Higienização interna', 'higienizacao interna'],
    ['Caminhonete/Picape', 'caminhonete/picape'],
  ])('"%s" → "%s"', (entrada, esperado) => {
    expect(normalizarNome(entrada)).toBe(esperado);
  });

  it('trata como iguais nomes que só diferem em maiúsculas, acentos e espaços nas pontas', () => {
    const variantes = ['água', 'Água', 'Agua', ' agua ', 'AGUA'];
    expect(new Set(variantes.map(normalizarNome)).size).toBe(1);
  });

  // Base para o CA-01.17.2 (a comparação com o `nome_chave` do Postgres entra com o esquema, FIN-US-01.3)
  it.each([
    ['Açaí', 'acai'],
    ['Pão de açúcar', 'pao de acucar'],
    ['Café', 'cafe'],
    ['Lingüiça', 'linguica'],
    ['Polimento', 'polimento'],
    ['Lavagem rápida', 'lavagem rapida'],
    ['Mão de obra', 'mao de obra'],
    ['  Higienização  ', 'higienizacao'],
    ['Ônibus', 'onibus'],
    ['Straße', 'strasse'],
    ['Øleo', 'oleo'],
  ])('"%s" → "%s"', (entrada, esperado) => {
    expect(normalizarNome(entrada)).toBe(esperado);
  });

  it('não altera espaços no meio do nome', () => {
    expect(normalizarNome('Lavagem  completa')).toBe('lavagem  completa');
  });

  it('tira só o caractere espaço das pontas, como o btrim do Postgres', () => {
    expect(normalizarNome('\tÁgua')).toBe('\tagua');
  });

  it('não muda o que já está normalizado', () => {
    const nome = 'lavagem rapida';
    expect(normalizarNome(normalizarNome(nome))).toBe(nome);
  });
});
