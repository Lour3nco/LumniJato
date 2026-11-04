import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, medidas } from '../tema';
import { Icone } from './Icone';

type Props = {
  aoDigitar: (digito: number) => void;
  aoApagar: () => void;
  /** Segurar ⌫ zera o valor (E2-03). */
  aoZerar: () => void;
};

const LINHAS: (number | 'apagar' | null)[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [null, 0, 'apagar'],
];

/**
 * Teclado numérico do próprio app (02-design §5.4 e §5.8): igual em todos os aparelhos, sem
 * vírgula (ela é automática) e sem depender do teclado do Android. Já aparece aberto.
 */
export function TecladoNumerico({ aoDigitar, aoApagar, aoZerar }: Props) {
  return (
    <View style={estilos.teclado}>
      {LINHAS.map((linha, i) => (
        <View key={i} style={estilos.linha}>
          {linha.map((tecla, j) => {
            if (tecla === null) return <View key={j} style={estilos.vazio} />;
            if (tecla === 'apagar') {
              return (
                <Pressable
                  key={j}
                  accessibilityRole="button"
                  accessibilityLabel="Apagar"
                  accessibilityHint="Toque para apagar o último número. Segure para zerar."
                  onPress={aoApagar}
                  onLongPress={aoZerar}
                  style={({ pressed }) => [estilos.tecla, pressed && estilos.pressionada]}>
                  <Icone nome="apagar" tamanho={28} />
                </Pressable>
              );
            }
            return (
              <Pressable
                key={j}
                accessibilityRole="button"
                accessibilityLabel={String(tecla)}
                onPress={() => aoDigitar(tecla)}
                style={({ pressed }) => [estilos.tecla, pressed && estilos.pressionada]}>
                <Text style={estilos.digito}>{tecla}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  teclado: { backgroundColor: cores.superficie, paddingVertical: 4, paddingHorizontal: 8 },
  linha: { flexDirection: 'row' },
  tecla: {
    flex: 1,
    minHeight: 56,
    margin: 4,
    borderRadius: medidas.raio,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vazio: { flex: 1, margin: 4 },
  pressionada: { backgroundColor: cores.borda },
  digito: { fontSize: 26, color: cores.texto },
});
