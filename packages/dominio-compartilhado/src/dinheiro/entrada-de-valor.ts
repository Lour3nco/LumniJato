/**
 * Limites de valor do lançamento (03-arquitetura §5.1) e a digitação estilo caixa registradora
 * (02-design §5.4, FIN-US-02.1). O app usa para avisar antes de salvar; o domínio do NestJS usa
 * os mesmos limites para decidir (a regra que vale é a do back-end, ST-04).
 */

/** Valor mínimo: R$ 0,01. */
export const VALOR_MINIMO_CENTAVOS = 1;

/** Valor máximo por lançamento: R$ 999.999,99 [SUPOSIÇÃO §5.1, D-QA-10]. */
export const VALOR_MAXIMO_CENTAVOS = 99_999_999;

/** Acima deste valor (estritamente maior) o app pede "Confere?": R$ 10.000,00 [SUPOSIÇÃO, CB-a.4]. */
export const LIMITE_CONFIRMACAO_CENTAVOS = 1_000_000;

/** O valor é aceito pelo domínio? (1 a 99.999.999 centavos inteiros) */
export function valorDentroDoLimite(centavos: number): boolean {
  return Number.isSafeInteger(centavos) && centavos >= VALOR_MINIMO_CENTAVOS && centavos <= VALOR_MAXIMO_CENTAVOS;
}

/** O valor pede a confirmação "Confere?" antes de salvar? */
export function pedeConfirmacao(centavos: number): boolean {
  return centavos > LIMITE_CONFIRMACAO_CENTAVOS;
}

/**
 * Digita um dígito: entra pela direita, nos centavos (`2` `5` → R$ 0,25). Zeros à esquerda não
 * contam (CB-a.8). Passar do máximo não muda o valor (CA-02.1.6, CB-a.2).
 */
export function digitarDigito(centavos: number, digito: number): number {
  if (!Number.isInteger(digito) || digito < 0 || digito > 9) return centavos;
  const novo = centavos * 10 + digito;
  return novo > VALOR_MAXIMO_CENTAVOS ? centavos : novo;
}

/** ⌫: apaga o último dígito (R$ 25,00 → R$ 2,50, CA-02.1.3). */
export function apagarDigito(centavos: number): number {
  return Math.floor(centavos / 10);
}

/**
 * Texto colado (CB-a.9): só os dígitos contam, na ordem, como se fossem digitados um a um.
 * "12,5" vira 125 centavos; "abc" não muda nada. Nunca vira número com vírgula.
 */
export function digitarTexto(centavos: number, texto: string): number {
  let valor = centavos;
  for (const caractere of texto) {
    if (caractere >= '0' && caractere <= '9') valor = digitarDigito(valor, Number(caractere));
  }
  return valor;
}
