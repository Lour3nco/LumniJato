import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotaoGrande, Chip, FolhaInferior, ItemDeMenu } from '../../../componentes';
import { useSessao } from '../../../sessao/ProvedorDeSessao';
import { cores, fontes, medidas } from '../../../tema';

type Natureza = 'empresa' | 'pessoal';
const ROTULO_NATUREZA: Record<Natureza, string> = { empresa: 'Empresa', pessoal: 'Pessoal' };

/**
 * TELA-09 · Mais / Ajustes (FIN-US-08.1). Unidades e Formas de pagamento NÃO aparecem no MVP:
 * são cadastradas pela equipe na implantação (F-08).
 */
export default function Mais() {
  const router = useRouter();
  const { sair } = useSessao();
  // [PROVISÓRIO] O padrão fica só na memória da tela; gravar e sincronizar é a FIN-US-08.2.
  const [natureza, setNatureza] = useState<Natureza>('empresa');
  const [escolhendoPadrao, setEscolhendoPadrao] = useState(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <Text accessibilityRole="header" style={estilos.titulo}>
        Mais
      </Text>
      <ScrollView>
        <ItemDeMenu icone="outros" rotulo="Categorias" aoTocar={() => router.push('/ajustes/categorias')} />
        <ItemDeMenu icone="servicos" rotulo="Tipos de serviço" aoTocar={() => router.push('/ajustes/tipos-de-servico')} />
        <ItemDeMenu icone="carro" rotulo="Tipos de veículo" aoTocar={() => router.push('/ajustes/tipos-de-veiculo')} />
        <ItemDeMenu
          icone="unidade"
          rotulo="Padrão Pessoal/Empresa"
          valor={ROTULO_NATUREZA[natureza]}
          aoTocar={() => setEscolhendoPadrao(true)}
        />
        <ItemDeMenu icone="excluir" rotulo="Lixeira" aoTocar={() => router.push('/ajustes/lixeira')} />
        <ItemDeMenu icone="nuvem-ok" rotulo="Sincronização" aoTocar={() => router.push('/ajustes/sincronizacao')} />
        <ItemDeMenu icone="historico" rotulo="Sobre" aoTocar={() => router.push('/ajustes/sobre')} />
        <ItemDeMenu icone="cadeado" rotulo="Sair" destaque aoTocar={() => setConfirmandoSaida(true)} />
      </ScrollView>

      <FolhaInferior visivel={escolhendoPadrao} titulo="Padrão dos lançamentos" aoFechar={() => setEscolhendoPadrao(false)}>
        <Text style={estilos.texto}>Os lançamentos novos já vêm marcados assim. Dá para trocar em cada um.</Text>
        <View style={estilos.chips}>
          {(['empresa', 'pessoal'] as const).map((opcao) => (
            <Chip
              key={opcao}
              rotulo={ROTULO_NATUREZA[opcao]}
              selecionado={natureza === opcao}
              aoTocar={() => {
                setNatureza(opcao);
                setEscolhendoPadrao(false);
              }}
            />
          ))}
        </View>
      </FolhaInferior>

      {/* Fluxo de saída (FIN-US-09.1): a conferência de pendências entra com a fila de envio. */}
      <FolhaInferior visivel={confirmandoSaida} titulo="Sair da conta?" aoFechar={() => setConfirmandoSaida(false)}>
        <Text style={estilos.texto}>
          Os dados deste celular serão apagados. Para usar de novo, entre com seu e-mail e senha.
        </Text>
        <View style={estilos.botoes}>
          <View style={estilos.botao}>
            <BotaoGrande rotulo="Cancelar" rotuloAcessivel="Cancelar" variante="neutro" aoTocar={() => setConfirmandoSaida(false)} />
          </View>
          <View style={estilos.botao}>
            <BotaoGrande
              rotulo="Sair"
              rotuloAcessivel="Confirmar sair da conta"
              variante="saida"
              aoTocar={() => {
                setConfirmandoSaida(false);
                void sair();
              }}
            />
          </View>
        </View>
      </FolhaInferior>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  titulo: { fontSize: 28, fontWeight: 'bold', color: cores.texto, padding: medidas.margemTela },
  texto: { fontSize: fontes.corpo, color: cores.textoSecundario, marginVertical: 8 },
  chips: { flexDirection: 'row', gap: medidas.espacoEntreAlvos, marginVertical: 8 },
  botoes: { flexDirection: 'row', gap: medidas.espacoEntreAlvos, marginTop: 8 },
  botao: { flex: 1 },
});
