import { Pressable, StyleSheet, Text } from 'react-native';

import { cores, fontes, medidas } from '../tema';

type Props = {
  rotulo: string;
  selecionado?: boolean;
  aoTocar: () => void;
  /** Quando o rótulo visível não basta, ex.: "Filtrar por período: 27/10 a 02/11". */
  rotuloAcessivel?: string;
};

/** Chip de filtro ou de escolha (Período, Unidade, Empresa/Pessoal…), com 48 dp de altura. */
export function Chip({ rotulo, selecionado = false, aoTocar, rotuloAcessivel }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel ?? rotulo}
      accessibilityState={{ selected: selecionado }}
      onPress={aoTocar}
      style={[estilos.chip, selecionado && estilos.selecionado]}>
      <Text style={[estilos.rotulo, selecionado && estilos.rotuloSelecionado]}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    minHeight: medidas.toqueMinimo,
    paddingHorizontal: 16,
    borderRadius: medidas.toqueMinimo / 2,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
    justifyContent: 'center',
  },
  selecionado: { backgroundColor: cores.texto, borderColor: cores.texto },
  rotulo: { fontSize: fontes.corpo, color: cores.texto },
  rotuloSelecionado: { color: cores.textoSobreCor, fontWeight: 'bold' },
});
