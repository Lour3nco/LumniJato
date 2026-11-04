import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';

type NomeDoGlifo = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Catálogo de ícones do app (FIN-US-01.9). A chave é o nome gravado no banco
 * (`categoria.icone`, `tipo_veiculo.icone`) e nunca muda; o valor é o desenho usado, que
 * pode ser trocado sem migração. Desenhos da família Material Community Icons, de traço,
 * no espírito dos ícones do Figma (02-design §8.1) [SUPOSIÇÃO de família].
 */
export const CATALOGO_DE_ICONES = {
  // Tipos de veículo (E2-07) e o genérico dos criados pelo dono
  carro: 'car-side',
  moto: 'motorbike',
  suv: 'car-estate',
  picape: 'car-pickup',
  van: 'van-utility',
  veiculo: 'car-outline',

  // Categorias de sistema e iniciais (visão §5.1)
  servicos: 'car-wash',
  produtos: 'package-variant-closed',
  'mao-de-obra': 'account-hard-hat-outline',
  reembolso: 'cash-refund',
  alimentacao: 'silverware-fork-knife',
  passagem: 'bus',
  agua: 'water-outline',
  energia: 'lightning-bolt-outline',
  aluguel: 'home-city-outline',
  manutencao: 'wrench-outline',
  'venda-produtos': 'cart-outline',
  'outras-entradas': 'cash-plus',
  outros: 'dots-horizontal-circle-outline',

  // Navegação e ações
  inicio: 'home-outline',
  extrato: 'text-box-outline',
  resumo: 'chart-bar',
  mais: 'menu',
  adicionar: 'plus',
  subtrair: 'minus',
  fechar: 'close',
  editar: 'pencil-outline',
  excluir: 'trash-can-outline',
  restaurar: 'restore',
  historico: 'history',
  calendario: 'calendar-month-outline',
  filtro: 'filter-variant',
  unidade: 'map-marker-outline',
  cadeado: 'lock-outline',
  apagar: 'backspace-outline',

  // Sincronização (§4.5)
  'nuvem-ok': 'cloud-check-outline',
  'nuvem-enviando': 'cloud-upload-outline',
  'sem-internet': 'cloud-off-outline',
  pendente: 'clock-outline',
  alerta: 'alert-outline',
} as const satisfies Record<string, NomeDoGlifo>;

export type NomeDoIcone = keyof typeof CATALOGO_DE_ICONES;

/** Ícone usado quando o nome gravado não existe no catálogo (ex.: app desatualizado). */
export const ICONE_DESCONHECIDO: NomeDoIcone = 'outros';

export function glifoDoIcone(nome: string): NomeDoGlifo {
  return nome in CATALOGO_DE_ICONES
    ? CATALOGO_DE_ICONES[nome as NomeDoIcone]
    : CATALOGO_DE_ICONES[ICONE_DESCONHECIDO];
}
