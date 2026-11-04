/**
 * Tabela de nomes de teste da normalização (F-16), usada em dois lugares para que o app e o
 * banco decidam igual (CA-01.17.2, risco R-18):
 * - no teste unitário de `normalizarNome` (este pacote);
 * - no teste de paridade com a coluna `nome_chave` do Postgres (`infra/testes`).
 *
 * Cada caso é [nome digitado, chave esperada]. Cobre ç, ã, é, ü, maiúsculas, espaços nas
 * pontas e no meio, e letras que o `unaccent` troca mas o NFD não decompõe (ß, ø).
 */
export const CASOS_NORMALIZACAO_NOME: ReadonlyArray<readonly [string, string]> = [
  // CA-01.17.1
  [' Água ', 'agua'],
  ['ÁGUA', 'agua'],
  ['Higienização interna', 'higienizacao interna'],
  ['Caminhonete/Picape', 'caminhonete/picape'],
  // variantes de "água" que precisam dar a mesma chave
  ['água', 'agua'],
  ['Agua', 'agua'],
  [' agua ', 'agua'],
  ['AGUA', 'agua'],
  // ç, ã, é, ü e outros acentos
  ['Açaí', 'acai'],
  ['Pão de açúcar', 'pao de acucar'],
  ['Café', 'cafe'],
  ['Lingüiça', 'linguica'],
  ['Mão de obra', 'mao de obra'],
  ['Ônibus', 'onibus'],
  ['Lavagem rápida', 'lavagem rapida'],
  ['Polimento', 'polimento'],
  ['CRISTALIZAÇÃO', 'cristalizacao'],
  // espaços: pontas saem, meio fica
  ['  Higienização  ', 'higienizacao'],
  ['Lavagem  completa', 'lavagem  completa'],
  [' Venda de  produtos ', 'venda de  produtos'],
  // letras sem decomposição no NFD
  ['Straße', 'strasse'],
  ['Øleo', 'oleo'],
];
