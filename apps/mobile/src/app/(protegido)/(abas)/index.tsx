import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotaoGrande, SeletorDeUnidade } from '../../../componentes';
import { cores, fontes, medidas } from '../../../tema';

/** Altura dos botões de lançamento na zona do polegar (02-design §4.1, CA-02.11.1). */
const ALTURA_BOTOES_DE_LANCAMENTO = 72;

/**
 * TELA-01 · Início. Por ora: a unidade atual no topo (FIN-US-08.3) e os três botões de
 * lançamento (FIN-US-02.11), fixos embaixo, acima da barra. Cartão Entrou/Saiu/Sobrou e últimos
 * lançamentos entram nas próximas histórias (FIN-US-05.x).
 */
export default function Inicio() {
  const router = useRouter();
  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      {/* Topo com a unidade atual e o seletor (TELA-08, FIN-US-08.3). */}
      <SeletorDeUnidade />
      <View style={estilos.conteudo}>
        <Text accessibilityRole="header" style={estilos.titulo}>
          Início
        </Text>
        <Text style={estilos.subtitulo}>TELA-01 · saldo e últimos lançamentos em construção</Text>
      </View>
      {/* Fora da área que rola: os botões ficam sempre visíveis, na parte de baixo. */}
      <View style={estilos.botoes} testID="botoes-de-lancamento">
        <View style={estilos.botao}>
          <BotaoGrande
            rotulo="+ Carro"
            rotuloAcessivel="Adicionar carro"
            icone="carro"
            variante="entrada"
            alturaMinima={ALTURA_BOTOES_DE_LANCAMENTO}
            aoTocar={() => router.push('/lancar/servico')}
          />
        </View>
        <View style={estilos.botao}>
          <BotaoGrande
            rotulo="+ Entrou"
            rotuloAcessivel="Registrar entrada"
            icone="adicionar"
            variante="entrada"
            alturaMinima={ALTURA_BOTOES_DE_LANCAMENTO}
            aoTocar={() => router.push('/lancar/entrada')}
          />
        </View>
        <View style={estilos.botao}>
          <BotaoGrande
            rotulo="− Saiu"
            rotuloAcessivel="Registrar saída"
            icone="subtrair"
            variante="saida"
            alturaMinima={ALTURA_BOTOES_DE_LANCAMENTO}
            aoTocar={() => router.push('/lancar/saida')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: medidas.margemTela },
  titulo: { fontSize: 28, fontWeight: 'bold', color: cores.texto },
  subtitulo: { marginTop: 8, fontSize: fontes.corpo, color: cores.textoSecundario, textAlign: 'center' },
  botoes: {
    flexDirection: 'row',
    gap: medidas.espacoEntreAlvos,
    paddingHorizontal: medidas.margemTela,
    paddingVertical: medidas.espacoEntreAlvos,
  },
  botao: { flex: 1 },
});
