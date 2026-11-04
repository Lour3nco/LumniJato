import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, fontes, medidas } from '../tema';
import { Icone } from './Icone';

export type VarianteBotao = 'entrada' | 'saida' | 'primario' | 'neutro';

type Props = {
  rotulo: string;
  /** Texto lido pelo leitor de tela, ex.: "Adicionar carro" (CA-01.9.4). Obrigatório. */
  rotuloAcessivel: string;
  aoTocar: () => void;
  variante?: VarianteBotao;
  icone?: string;
  desabilitado?: boolean;
  /** Dica extra do leitor de tela, ex.: "Abre o formulário de nova saída". */
  dica?: string;
  /** Altura mínima em dp; padrão 64. Os botões de lançamento da Início usam ~72 (CA-02.11.1). */
  alturaMinima?: number;
};

const fundoPorVariante: Record<VarianteBotao, string> = {
  entrada: cores.verde,
  saida: cores.vermelho,
  primario: cores.texto,
  neutro: cores.superficie,
};

/**
 * Botão grande (≥ 64 dp de altura) para lançar e salvar, na zona do polegar (02-design §5.3).
 * Verde para entrada, vermelho para saída; o rótulo sempre traz "+"/"−" ou texto, porque a
 * cor nunca é o único sinal.
 */
export function BotaoGrande({
  rotulo,
  rotuloAcessivel,
  aoTocar,
  variante = 'primario',
  icone,
  desabilitado = false,
  dica,
  alturaMinima = medidas.botaoGrande,
}: Props) {
  const corDoTexto = variante === 'neutro' ? cores.texto : cores.textoSobreCor;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel}
      accessibilityHint={dica}
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={aoTocar}
      style={({ pressed }) => [
        estilos.botao,
        { backgroundColor: fundoPorVariante[variante], minHeight: alturaMinima },
        desabilitado && estilos.desabilitado,
        pressed && estilos.pressionado,
      ]}>
      <View style={estilos.conteudo}>
        {icone ? <Icone nome={icone} cor={corDoTexto} tamanho={28} /> : null}
        <Text style={[estilos.rotulo, { color: corDoTexto }]}>{rotulo}</Text>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    minHeight: medidas.botaoGrande,
    borderRadius: medidas.raio,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conteudo: { alignItems: 'center', gap: 4 },
  rotulo: { fontSize: fontes.corpo + 2, fontWeight: 'bold', textAlign: 'center' },
  desabilitado: { opacity: 0.45 },
  pressionado: { opacity: 0.8 },
});
