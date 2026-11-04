import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';

import { cores, fontes, medidas } from '../../../tema';

/** Tela Sobre (TELA-09 → Sobre): nome e versão do app, para o suporte. */
export default function Sobre() {
  const versao = Constants.expoConfig?.version ?? '—';
  return (
    <View style={estilos.tela}>
      <Text accessibilityRole="header" style={estilos.titulo}>
        Lavajato
      </Text>
      <Text style={estilos.texto}>Versão {versao}</Text>
      <Text style={estilos.texto}>Controle do que entra e do que sai do lava-jato.</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: medidas.margemTela, gap: 8 },
  titulo: { fontSize: fontes.titulo, fontWeight: 'bold', color: cores.texto },
  texto: { fontSize: fontes.corpo, color: cores.textoSecundario },
});
