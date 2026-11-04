import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { glifoDoIcone } from '../icones/catalogo';
import { cores } from '../tema';

type Props = {
  /** Nome do catálogo (ex.: "carro", "alimentacao"). */
  nome: string;
  tamanho?: number;
  cor?: string;
};

/**
 * Ícone do catálogo. É sempre decorativo: o leitor de tela lê o rótulo do botão ou do item
 * em volta, nunca o nome do desenho.
 */
export function Icone({ nome, tamanho = 24, cor = cores.texto }: Props) {
  return (
    <MaterialCommunityIcons
      name={glifoDoIcone(nome)}
      size={tamanho}
      color={cor}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      testID={`icone-${nome}`}
    />
  );
}
