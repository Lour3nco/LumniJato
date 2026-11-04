import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores } from '../tema';

type Props = {
  /** Título da tela, ex.: "Início". */
  titulo: string;
  /** ID da tela no 02-design, ex.: "TELA-01". */
  idTela: string;
};

/** Tela provisória: marca o lugar de cada tela principal até ela ser construída. */
export function TelaVazia({ titulo, idTela }: Props) {
  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <View style={estilos.conteudo}>
        <Text accessibilityRole="header" style={estilos.titulo}>
          {titulo}
        </Text>
        <Text style={estilos.subtitulo}>{idTela} · em construção</Text>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: cores.texto,
  },
  subtitulo: {
    marginTop: 8,
    fontSize: 16,
    color: cores.textoSecundario,
  },
});
