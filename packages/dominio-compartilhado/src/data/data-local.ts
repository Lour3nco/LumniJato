/**
 * Datas do lançamento sem hora, no formato "AAAA-MM-DD" (03-arquitetura §5.2).
 * "Hoje" é calculado no fuso da unidade (padrão America/Sao_Paulo), não no do aparelho.
 */

export const FUSO_PADRAO = 'America/Sao_Paulo';

const PADRAO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Confere se o texto é uma data válida "AAAA-MM-DD" (ex.: recusa 2026-02-30). */
export function ehDataValida(data: string): boolean {
  const partes = PADRAO_DATA.exec(data);
  if (!partes) return false;
  const [ano, mes, dia] = [Number(partes[1]), Number(partes[2]), Number(partes[3])];
  const emUtc = new Date(Date.UTC(ano, mes - 1, dia));
  return emUtc.getUTCFullYear() === ano && emUtc.getUTCMonth() === mes - 1 && emUtc.getUTCDate() === dia;
}

/** Dia de hoje ("AAAA-MM-DD") no fuso informado. */
export function hojeNoFuso(fuso: string = FUSO_PADRAO, agora: Date = new Date()): string {
  // en-CA formata como AAAA-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(agora);
}

/** Soma (ou subtrai) dias a uma data "AAAA-MM-DD". */
export function somarDias(data: string, dias: number): string {
  if (!ehDataValida(data)) throw new RangeError(`Data inválida: ${data}`);
  const [ano, mes, dia] = data.split('-').map(Number);
  const resultado = new Date(Date.UTC(ano, mes - 1, dia + dias));
  return resultado.toISOString().slice(0, 10);
}

/**
 * Rótulo da data nas listas (02-design §5.1, CA-01.9.3): "Hoje", "Ontem" ou "DD/MM".
 * `hoje` deve vir de `hojeNoFuso(fuso da unidade)`.
 */
export function rotuloData(data: string, hoje: string): string {
  if (!ehDataValida(data)) throw new RangeError(`Data inválida: ${data}`);
  if (data === hoje) return 'Hoje';
  if (data === somarDias(hoje, -1)) return 'Ontem';
  const [, mes, dia] = data.split('-');
  return `${dia}/${mes}`;
}
