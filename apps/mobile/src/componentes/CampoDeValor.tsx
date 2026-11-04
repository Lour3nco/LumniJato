import { formatarReais } from '@lavajato/dominio-compartilhado';
import { StyleSheet, Text, View } from 'react-native';

import { cores, fontes } from '../tema';

type Props = {
  centavos: number;
  /** Cor do valor digitado: verde nas entradas, vermelho nas saídas (02-design §4.2/§4.3). */
  cor: string;
  rotulo?: string;
};

/**
 * Valor sendo digitado (FIN-US-02.1): começa em "R$ 0,00" cinza e muda de cor quando há
 * valor. Fonte ≥ 32 sp, sem limite de linhas (fonte grande do sistema, CA-01.9.5).
 */
export function CampoDeValor({ centavos, cor, rotulo = 'Valor' }: Props) {
  const texto = formatarReais(centavos);
  const vazio = centavos === 0;
  return (
    <View style={estilos.campo} accessible accessibilityLabel={`${rotulo}: ${texto}`} accessibilityLiveRegion="polite">
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text testID="valor-digitado" style={[estilos.valor, { color: vazio ? cores.textoSecundario : cor }]}>
        {texto}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { alignItems: 'center', paddingVertical: 8 },
  rotulo: { fontSize: fontes.corpo, color: cores.textoSecundario },
  valor: { fontSize: fontes.valorDigitado + 4, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
});
