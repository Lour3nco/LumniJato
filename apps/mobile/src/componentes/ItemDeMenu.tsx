import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, fontes, medidas } from '../tema';
import { Icone } from './Icone';

type Props = {
  icone: string;
  rotulo: string;
  /** Texto à direita, ex.: o padrão atual "Empresa". */
  valor?: string;
  aoTocar: () => void;
  /** Ações que mudam o estado da conta (ex.: Sair) ganham cor de alerta. */
  destaque?: boolean;
};

/** Linha de menu da TELA-09 (Mais / Ajustes), com 56 dp de altura. */
export function ItemDeMenu({ icone, rotulo, valor, aoTocar, destaque }: Props) {
  const cor = destaque ? cores.ambar : cores.texto;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={valor ? `${rotulo}: ${valor}` : rotulo}
      onPress={aoTocar}
      style={({ pressed }) => [estilos.linha, pressed && estilos.pressionada]}>
      <Icone nome={icone} cor={cor} />
      <Text style={[estilos.rotulo, { color: cor }]}>{rotulo}</Text>
      <View style={estilos.direita}>
        {valor ? <Text style={estilos.valor}>{valor}</Text> : null}
        <Text style={estilos.seta}>›</Text>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: medidas.toqueMinimo + 8,
    paddingHorizontal: medidas.margemTela,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  pressionada: { backgroundColor: cores.superficie },
  rotulo: { flex: 1, fontSize: fontes.corpo },
  direita: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  valor: { fontSize: fontes.corpo, color: cores.textoSecundario },
  seta: { fontSize: 24, color: cores.textoSecundario },
});
