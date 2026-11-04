import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores, fontes, medidas } from '../tema';
import { Icone } from './Icone';

type Props = {
  visivel: boolean;
  titulo: string;
  aoFechar: () => void;
  children: ReactNode;
};

/**
 * Folha inferior (seletor de unidade, período, "+ Novo serviço"…). Fecha pelo ✕, tocando
 * fora ou pelo botão Voltar do Android (02-design §5.8). Fica acima da barra de gestos.
 */
export function FolhaInferior({ visivel, titulo, aoFechar, children }: Props) {
  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
      <View style={estilos.fundo}>
        <Pressable
          style={estilos.areaFora}
          onPress={aoFechar}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        />
        <SafeAreaView edges={['bottom']} style={estilos.folha}>
          <View style={estilos.cabecalho}>
            <Text accessibilityRole="header" style={estilos.titulo}>
              {titulo}
            </Text>
            <Pressable
              onPress={aoFechar}
              accessibilityRole="button"
              accessibilityLabel={`Fechar ${titulo}`}
              style={estilos.fechar}>
              <Icone nome="fechar" />
            </Pressable>
          </View>
          {children}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  areaFora: { flex: 1 },
  folha: {
    backgroundColor: cores.fundo,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: medidas.margemTela,
    paddingBottom: medidas.margemTela,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  titulo: { fontSize: fontes.titulo, fontWeight: 'bold', color: cores.texto, flexShrink: 1 },
  fechar: { minWidth: medidas.toqueMinimo, minHeight: medidas.toqueMinimo, alignItems: 'center', justifyContent: 'center' },
});
