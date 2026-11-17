import {
  LIMITE_CONFIRMACAO_CENTAVOS,
  apagarDigito,
  digitarDigito,
  formatarReais,
  pedeConfirmacao,
} from '@lavajato/dominio-compartilhado';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvisoInferior, BotaoGrande, CampoDeValor, Chip, FolhaInferior, Icone, TecladoNumerico } from '../componentes';
import { cores, fontes, medidas } from '../tema';
import { TODAS_AS_UNIDADES, useUnidades } from '../unidades/ProvedorDeUnidades';

export type TipoDeFormulario = 'servico' | 'entrada' | 'saida';

const CONFIGURACAO: Record<TipoDeFormulario, { titulo: string; idTela: string; cor: string }> = {
  servico: { titulo: 'Novo serviço', idTela: 'TELA-02', cor: cores.verde },
  entrada: { titulo: 'Nova entrada', idTela: 'TELA-04', cor: cores.verde },
  saida: { titulo: 'Nova saída', idTela: 'TELA-03', cor: cores.vermelho },
};

export type DadosDoFormulario = { centavos: number; unidadeId: string };

type Props = {
  tipo: TipoDeFormulario;
  /**
   * Grava o lançamento, uma única vez por formulário (CB-a.5). Ausente = a gravação ainda não
   * existe nesta versão: a tela AVISA que não grava (sugestão da Arquitetura, passo 5).
   */
  aoSalvar?: (dados: DadosDoFormulario) => Promise<void> | void;
  aoFechar: () => void;
};

export const AVISO_NAO_GRAVA =
  'Esta versão ainda não grava lançamentos. Você pode testar o valor, mas nada é salvo.';

/**
 * Formulário de lançamento — por ora com o VALOR (FIN-US-02.1) e a UNIDADE (FIN-US-08.3): o
 * lançamento novo vem com a unidade atual; com "Todas as unidades", o formulário pede a
 * unidade, sem valor padrão (JOR-j). Os demais campos entram nas FIN-US-02.2 a 02.5.
 */
export function TelaDeLancamento({ tipo, aoSalvar, aoFechar }: Props) {
  const { titulo, idTela, cor } = CONFIGURACAO[tipo];
  const { unidades, escolha, nomeDa } = useUnidades();
  const [centavos, setCentavos] = useState(0);
  const [unidadeId, setUnidadeId] = useState<string | null>(
    escolha && escolha !== TODAS_AS_UNIDADES ? escolha : null,
  );
  const [confirmando, setConfirmando] = useState(false);
  const [avisoNaoGravou, setAvisoNaoGravou] = useState(false);
  const salvando = useRef(false);

  const podeSalvar = centavos > 0 && unidadeId !== null;

  async function salvarDeVez() {
    setConfirmando(false);
    if (!aoSalvar) {
      setAvisoNaoGravou(true);
      return;
    }
    // Dois toques seguidos gravam um lançamento só (CB-a.5).
    if (salvando.current || unidadeId === null) return;
    salvando.current = true;
    try {
      await aoSalvar({ centavos, unidadeId });
    } catch (erro) {
      salvando.current = false;
      throw erro;
    }
  }

  function aoTocarSalvar() {
    if (!podeSalvar) return;
    if (pedeConfirmacao(centavos)) setConfirmando(true);
    else void salvarDeVez();
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.cabecalho}>
        <Pressable onPress={aoFechar} accessibilityRole="button" accessibilityLabel="Fechar" style={estilos.fechar}>
          <Icone nome="fechar" />
        </Pressable>
        <Text accessibilityRole="header" style={estilos.titulo}>
          {titulo}
        </Text>
        {unidadeId ? (
          <Text style={estilos.unidade} accessibilityLabel={`Unidade: ${nomeDa(unidadeId)}`}>
            📍 {nomeDa(unidadeId)}
          </Text>
        ) : null}
      </View>

      {!aoSalvar ? (
        <Text accessibilityRole="alert" style={estilos.naoGrava} testID="aviso-nao-grava">
          ⚠ {AVISO_NAO_GRAVA}
        </Text>
      ) : null}

      <ScrollView contentContainerStyle={estilos.corpo}>
        {escolha === TODAS_AS_UNIDADES ? (
          <View style={estilos.escolhaDeUnidade}>
            <Text style={estilos.pergunta}>Em qual unidade?</Text>
            <View style={estilos.chips}>
              {unidades.map((u) => (
                <Chip key={u.id} rotulo={u.nome} selecionado={u.id === unidadeId} aoTocar={() => setUnidadeId(u.id)} />
              ))}
            </View>
            {unidadeId === null ? <Text style={estilos.faltando}>Escolha a unidade antes de salvar.</Text> : null}
          </View>
        ) : null}
        <CampoDeValor centavos={centavos} cor={cor} />
        <Text style={estilos.aviso}>{idTela} · os outros campos entram nas próximas etapas</Text>
      </ScrollView>

      <AvisoInferior
        visivel={avisoNaoGravou}
        mensagem="Nada foi gravado: esta versão ainda não salva lançamentos."
        aoSumir={() => setAvisoNaoGravou(false)}
      />
      <View style={estilos.salvar}>
        <BotaoGrande
          rotulo="Salvar"
          rotuloAcessivel="Salvar"
          variante={tipo === 'saida' ? 'saida' : 'entrada'}
          desabilitado={!podeSalvar}
          aoTocar={aoTocarSalvar}
        />
      </View>
      <TecladoNumerico
        aoDigitar={(d) => setCentavos((v) => digitarDigito(v, d))}
        aoApagar={() => setCentavos(apagarDigito)}
        aoZerar={() => setCentavos(0)}
      />

      <FolhaInferior visivel={confirmando} titulo="Confere?" aoFechar={() => setConfirmando(false)}>
        <Text style={estilos.confere}>{formatarReais(centavos)}</Text>
        <Text style={estilos.explicacao}>O valor passa de {formatarReais(LIMITE_CONFIRMACAO_CENTAVOS)}. Está certo?</Text>
        <View style={estilos.botoesConfere}>
          <View style={estilos.botaoConfere}>
            <BotaoGrande rotulo="Corrigir" rotuloAcessivel="Corrigir o valor" variante="neutro" aoTocar={() => setConfirmando(false)} />
          </View>
          <View style={estilos.botaoConfere}>
            <BotaoGrande rotulo="Salvar" rotuloAcessivel="Confirmar e salvar" aoTocar={() => void salvarDeVez()} />
          </View>
        </View>
      </FolhaInferior>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, gap: 4 },
  fechar: { minWidth: medidas.toqueMinimo, minHeight: medidas.toqueMinimo, alignItems: 'center', justifyContent: 'center' },
  titulo: { flex: 1, fontSize: fontes.titulo, fontWeight: 'bold', color: cores.texto },
  unidade: { fontSize: fontes.pequeno, color: cores.textoSecundario, paddingRight: medidas.margemTela },
  naoGrava: {
    fontSize: fontes.corpo,
    color: cores.ambar,
    backgroundColor: cores.fundoAmbar,
    padding: 12,
    marginHorizontal: medidas.margemTela,
    borderRadius: medidas.raio,
  },
  corpo: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: medidas.margemTela, gap: 8 },
  escolhaDeUnidade: { gap: 8 },
  pergunta: { fontSize: fontes.corpo, fontWeight: 'bold', color: cores.texto },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: medidas.espacoEntreAlvos },
  faltando: { fontSize: fontes.pequeno, color: cores.ambar },
  aviso: { textAlign: 'center', fontSize: fontes.pequeno, color: cores.textoSecundario, marginTop: 8 },
  salvar: { paddingHorizontal: medidas.margemTela, paddingVertical: 8 },
  confere: { fontSize: fontes.valorDigitado, fontWeight: 'bold', color: cores.texto, textAlign: 'center', marginVertical: 8 },
  explicacao: { fontSize: fontes.corpo, color: cores.textoSecundario, textAlign: 'center' },
  botoesConfere: { flexDirection: 'row', gap: medidas.espacoEntreAlvos, marginTop: 16 },
  botaoConfere: { flex: 1 },
});
