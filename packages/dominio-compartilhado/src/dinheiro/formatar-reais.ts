/** Sinal de menos tipográfico (U+2212), usado na interface: "−R$ 25,50" (02-design §5.2). */
export const SINAL_MENOS = '−';

/**
 * Formata um valor em centavos no padrão brasileiro: 123456 → "R$ 1.234,56" (03-arquitetura §5.1).
 * Trabalha só com inteiros e texto, sem converter para número com vírgula, para não haver
 * arredondamento (CA-01.9.1). Negativos ganham o sinal "−" antes do R$ (CA-01.9.2).
 */
export function formatarReais(centavos: number): string {
  if (!Number.isSafeInteger(centavos)) {
    throw new RangeError(`Valor em centavos precisa ser inteiro: ${centavos}`);
  }
  const negativo = centavos < 0;
  const digitos = String(Math.abs(centavos)).padStart(3, '0');
  const reais = digitos.slice(0, -2);
  const fracao = digitos.slice(-2);
  const reaisComPontos = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negativo ? SINAL_MENOS : ''}R$ ${reaisComPontos},${fracao}`;
}
