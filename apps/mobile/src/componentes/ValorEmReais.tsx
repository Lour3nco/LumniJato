import { formatarReais } from '@lavajato/dominio-compartilhado';
import { StyleSheet, Text, type TextStyle } from 'react-native';

import { cores, fontes } from '../tema';

type Props = {
  /** Valor em centavos inteiros (pode ser negativo, ex.: saldo). */
  centavos: number;
  /** Fonte em sp. */
  tamanho?: number;
  negrito?: boolean;
  /** Cor dos valores positivos; os negativos são sempre vermelhos. */
  cor?: string;
  estilo?: TextStyle;
};

/**
 * Valor em reais formatado a partir do inteiro em centavos (CA-01.9.1). Negativo aparece com
 * o sinal "−" e em vermelho (CA-01.9.2): a cor nunca é o único sinal (02-design §5.2).
 * Sem limite de linhas, para não esconder o valor com a fonte do sistema grande (CA-01.9.5).
 */
export function ValorEmReais({ centavos, tamanho = fontes.corpo, negrito, cor = cores.texto, estilo }: Props) {
  const negativo = centavos < 0;
  return (
    <Text
      style={[
        estilos.valor,
        { fontSize: tamanho, color: negativo ? cores.vermelho : cor },
        negrito && estilos.negrito,
        estilo,
      ]}>
      {formatarReais(centavos)}
    </Text>
  );
}

const estilos = StyleSheet.create({
  valor: { fontVariant: ['tabular-nums'] },
  negrito: { fontWeight: 'bold' },
});
