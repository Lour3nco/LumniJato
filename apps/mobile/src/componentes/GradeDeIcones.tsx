import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, fontes, medidas } from '../tema';
import { Icone } from './Icone';

export type ItemDaGrade = {
  id: string;
  rotulo: string;
  icone: string;
  /** Cor própria da categoria (02-design §5.2). */
  cor?: string;
};

type Props = {
  itens: ItemDaGrade[];
  selecionadoId?: string | null;
  /** Recebe `null` quando o item marcado é desmarcado. */
  aoSelecionar: (id: string | null) => void;
  colunas?: number;
  /** Tocar no item marcado desmarca (ex.: tipo de serviço opcional, E2-04). */
  permitirDesmarcar?: boolean;
};

/** Grade de ícones grandes para escolher categoria, serviço ou veículo com um toque. */
export function GradeDeIcones({ itens, selecionadoId, aoSelecionar, colunas = 4, permitirDesmarcar = false }: Props) {
  return (
    <View style={estilos.grade} accessibilityRole="radiogroup">
      {itens.map((item) => {
        const selecionado = item.id === selecionadoId;
        const cor = item.cor ?? cores.texto;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="radio"
            accessibilityLabel={item.rotulo}
            accessibilityState={{ checked: selecionado, selected: selecionado }}
            onPress={() => aoSelecionar(selecionado && permitirDesmarcar ? null : item.id)}
            style={[
              estilos.item,
              { width: `${100 / colunas}%` },
            ]}>
            <View style={[estilos.caixa, selecionado && { borderColor: cor, backgroundColor: cores.superficie }]}>
              <Icone nome={item.icone} cor={cor} tamanho={28} />
              <Text style={[estilos.rotulo, selecionado && estilos.rotuloSelecionado]}>{item.rotulo}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -medidas.espacoEntreAlvos / 2 },
  item: { padding: medidas.espacoEntreAlvos / 2 },
  caixa: {
    minHeight: medidas.botaoGrande,
    borderRadius: medidas.raio,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  rotulo: { fontSize: fontes.pequeno, color: cores.texto, textAlign: 'center' },
  rotuloSelecionado: { fontWeight: 'bold' },
});
