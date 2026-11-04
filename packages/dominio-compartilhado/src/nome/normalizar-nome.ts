/**
 * Letras que a extensão `unaccent` do Postgres troca, mas que a decomposição
 * Unicode (NFD) não separa em "letra + acento". Sem este mapa, o app e o banco
 * dariam chaves diferentes para nomes como "Øleo" ou "Straße".
 */
const LETRAS_SEM_DECOMPOSICAO: Record<string, string> = {
  Æ: 'AE',
  æ: 'ae',
  Œ: 'OE',
  œ: 'oe',
  ß: 'ss',
  Ø: 'O',
  ø: 'o',
  Ł: 'L',
  ł: 'l',
  Đ: 'D',
  đ: 'd',
  Ð: 'D',
  ð: 'd',
  Þ: 'TH',
  þ: 'th',
  Ħ: 'H',
  ħ: 'h',
  ı: 'i',
};

const PADRAO_LETRAS_SEM_DECOMPOSICAO = new RegExp(
  `[${Object.keys(LETRAS_SEM_DECOMPOSICAO).join('')}]`,
  'g',
);

/**
 * Chave de comparação de nomes de categoria, tipo de serviço e tipo de veículo
 * [CONFIRMADO F-16]: ignora maiúsculas, acentos e espaços nas pontas.
 *
 * Deve dar o mesmo resultado que a coluna gerada `nome_chave` do Postgres,
 * `lower(f_unaccent(btrim(nome)))` (03-arquitetura §3.1). Por isso:
 * - tira só o caractere espaço das pontas, como o `btrim` sem segundo argumento;
 * - não mexe nos espaços do meio [SUPOSIÇÃO de 03-arquitetura §3.1].
 *
 * Exemplos: " Água " → "agua"; "Higienização interna" → "higienizacao interna".
 */
export function normalizarNome(nome: string): string {
  return nome
    .replace(/^ +| +$/g, '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(PADRAO_LETRAS_SEM_DECOMPOSICAO, (letra) => LETRAS_SEM_DECOMPOSICAO[letra])
    .toLowerCase();
}
