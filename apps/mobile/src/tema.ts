/**
 * Cores e medidas da interface (02-design §5.2 e §5.3).
 * Todas as cores de texto têm contraste de pelo menos 4,5:1 sobre o fundo branco (WCAG AA).
 */
export const cores = {
  fundo: '#FFFFFF',
  superficie: '#F3F4F6',
  borda: '#C9CED6',
  texto: '#1A1A1A',
  textoSecundario: '#5C5C5C',
  textoSobreCor: '#FFFFFF',
  /** Entrada: Entrou, + Carro, + Entrou. */
  verde: '#1B7F3B',
  /** Saída: Saiu, − Saiu; também "Sobrou" negativo. */
  vermelho: '#C62828',
  /** Aviso e erro de sincronização (nunca vermelho, para não confundir com "Saiu"). */
  ambar: '#8D5B00',
  fundoAmbar: '#FFF4D6',
  /** Rótulo discreto "Pessoal". */
  roxo: '#6A1B9A',
  /** Pendente de sincronizar. */
  pendente: '#666666',
  /** Fundo do aviso inferior. */
  avisoInferior: '#263238',
} as const;

export const medidas = {
  /** Área mínima de toque (RNF-01). */
  toqueMinimo: 48,
  /** Botões de lançamento e de tipo de serviço. */
  botaoGrande: 64,
  /** Espaço mínimo entre alvos tocáveis. */
  espacoEntreAlvos: 8,
  margemTela: 16,
  raio: 12,
} as const;

/** Tamanhos de fonte em sp; o tamanho de fonte do sistema é respeitado (allowFontScaling). */
export const fontes = {
  corpo: 16,
  pequeno: 14,
  titulo: 22,
  valorDigitado: 32,
  sobrou: 28,
} as const;
