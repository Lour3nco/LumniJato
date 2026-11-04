import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, fontes, medidas } from '../tema';

type Acao = { rotulo: string; aoTocar: () => void };

type Props = {
  visivel: boolean;
  mensagem: string;
  /** Até duas ações, ex.: "Desfazer" e "Mais um igual" (02-design §5.6). */
  acoes?: Acao[];
  aoSumir: () => void;
  /** Some sozinho depois deste tempo (padrão ~5 s). */
  duracaoMs?: number;
};

/**
 * Aviso inferior que não bloqueia a tela: "Saída de R$ 25,00 salva · Desfazer".
 * O leitor de tela anuncia a mensagem assim que aparece.
 */
export function AvisoInferior({ visivel, mensagem, acoes = [], aoSumir, duracaoMs = 5000 }: Props) {
  useEffect(() => {
    if (!visivel) return;
    const temporizador = setTimeout(aoSumir, duracaoMs);
    return () => clearTimeout(temporizador);
  }, [visivel, duracaoMs, aoSumir]);

  if (!visivel) return null;
  return (
    <View style={estilos.aviso} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Text style={estilos.mensagem}>{mensagem}</Text>
      {acoes.slice(0, 2).map((acao) => (
        <Pressable
          key={acao.rotulo}
          accessibilityRole="button"
          accessibilityLabel={acao.rotulo}
          onPress={() => {
            acao.aoTocar();
            aoSumir();
          }}
          style={estilos.acao}>
          <Text style={estilos.rotuloAcao}>{acao.rotulo}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  aviso: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: medidas.espacoEntreAlvos,
    marginHorizontal: medidas.margemTela,
    marginBottom: medidas.margemTela,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
    borderRadius: medidas.raio,
    backgroundColor: cores.avisoInferior,
  },
  mensagem: { flexShrink: 1, flexGrow: 1, fontSize: fontes.corpo, color: cores.textoSobreCor, paddingVertical: 8 },
  acao: { minHeight: medidas.toqueMinimo, minWidth: medidas.toqueMinimo, justifyContent: 'center', paddingHorizontal: 8 },
  rotuloAcao: { fontSize: fontes.corpo, fontWeight: 'bold', color: '#A5D6A7' },
});
