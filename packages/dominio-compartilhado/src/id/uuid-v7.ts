/**
 * Gerador de UUID v7 (RFC 9562): 48 bits com o horário em milissegundos, depois bits
 * aleatórios. Ids gerados no aparelho e no servidor ficam ordenáveis pelo tempo
 * (03-arquitetura §3.1 e §4.1).
 *
 * Dentro do mesmo milissegundo, os 12 bits `rand_a` funcionam como contador (método 1 da
 * RFC), para que ids gerados em sequência continuem em ordem crescente.
 */

type FonteAleatoria = (bytes: Uint8Array<ArrayBuffer>) => Uint8Array<ArrayBuffer>;

const fontePadrao: FonteAleatoria = (bytes) => globalThis.crypto.getRandomValues(bytes);

let ultimoMs = -1;
let contador = 0;

export const PADRAO_UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function gerarUuidV7(agoraMs: number = Date.now(), aleatorio: FonteAleatoria = fontePadrao): string {
  const bytes = aleatorio(new Uint8Array(16));

  let ms = Math.floor(agoraMs);
  if (ms <= ultimoMs) {
    // Mesmo milissegundo (ou relógio voltou): segue do último e incrementa o contador.
    ms = ultimoMs;
    contador += 1;
    if (contador > 0xfff) {
      ms += 1;
      contador = 0;
    }
  } else {
    // Novo milissegundo: contador começa num valor aleatório da metade de baixo, para sobrar espaço.
    contador = ((bytes[6] & 0x07) << 8) | bytes[7];
  }
  ultimoMs = ms;

  // 48 bits do horário (big-endian).
  let resto = ms;
  for (let i = 5; i >= 0; i -= 1) {
    bytes[i] = resto % 256;
    resto = Math.floor(resto / 256);
  }
  bytes[6] = 0x70 | ((contador >> 8) & 0x0f); // versão 7 + 4 bits altos do contador
  bytes[7] = contador & 0xff;
  bytes[8] = 0x80 | (bytes[8] & 0x3f); // variante RFC

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Milissegundos gravados no UUID v7. */
export function horarioDoUuidV7(id: string): number {
  return parseInt(id.replace(/-/g, '').slice(0, 12), 16);
}
