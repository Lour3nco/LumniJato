import {
  LIMITE_CONFIRMACAO_CENTAVOS,
  apagarDigito,
  digitarDigito,
  formatarReais,
  pedeConfirmacao,
} from '@lavajato/dominio-compartilhado';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotaoGrande, CampoDeValor, FolhaInferior, Icone, TecladoNumerico } from '../componentes';
import { cores, fontes, medidas } from '../tema';

export type TipoDeFormulario = 'servico' | 'entrada' | 'saida';

const CONFIGURACAO: Record<TipoDeFormulario, { titulo: string; idTela: string; cor: string }> = {
  servico: { titulo: 'Novo serviço', idTela: 'TELA-02', cor: cores.verde },
  entrada: { titulo: 'Nova entrada', idTela: 'TELA-04', cor: cores.verde },
  saida: { titulo: 'Nova saída', idTela: 'TELA-03', cor: cores.vermelho },
};

type Props = {
  tipo: TipoDeFormulario;
  /** Grava o lançamento. Chamado uma única vez por formulário (CB-a.5). */
  aoSalvar: (centavos: number) => Promise<void> | void;
  aoFechar: () => void;
};

/**
 * Formulário de lançamento — por ora com o VALOR (FIN-US-02.1): teclado do app já aberto,
 * digitação de caixa registradora, Salvar desabilitado em R$ 0,00 e "Confere?" acima de
 * R$ 10.000,00. Os demais campos (categoria, serviço, veículo, forma de pagamento, Pessoal/
 * Empresa, data) entram nas FIN-US-02.2 a 02.5.
 */
export function TelaDeLancamento({ tipo, aoSalvar, aoFechar }: Props) {
  const { titulo, idTela, cor } = CONFIGURACAO[tipo];
  const [centavos, setCentavos] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const salvando = useRef(false);

  async function salvarDeVez() {
    // Dois toques seguidos gravam um lançamento só (CB-a.5).
    if (salvando.current) return;
    salvando.current = true;
    setConfirmando(false);
    try {
      await aoSalvar(centavos);
    } catch (erro) {
      salvando.current = false;
      throw erro;
    }
  }

  function aoTocarSalvar() {
    if (centavos <= 0) return;
    if (pedeConfirmacao(centavos)) setConfirmando(true);
    else void salvarDeVez();
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.cabecalho}>
        <Pressable
          onPress={aoFechar}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          style={estilos.fechar}>
          <Icone nome="fechar" />
        </Pressable>
        <Text accessibilityRole="header" style={estilos.titulo}>
          {titulo}
        </Text>
      </View>

      <View style={estilos.corpo}>
        <CampoDeValor centavos={centavos} cor={cor} />
        <Text style={estilos.aviso}>{idTela} · os outros campos entram nas próximas etapas</Text>
      </View>

      <View style={estilos.salvar}>
        <BotaoGrande
          rotulo="Salvar"
          rotuloAcessivel="Salvar"
          variante={tipo === 'saida' ? 'saida' : 'entrada'}
          desabilitado={centavos <= 0}
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
        <Text style={estilos.explicacao}>
          O valor passa de {formatarReais(LIMITE_CONFIRMACAO_CENTAVOS)}. Está certo?
        </Text>
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
  titulo: { fontSize: fontes.titulo, fontWeight: 'bold', color: cores.texto },
  corpo: { flex: 1, justifyContent: 'center', paddingHorizontal: medidas.margemTela },
  aviso: { textAlign: 'center', fontSize: fontes.pequeno, color: cores.textoSecundario, marginTop: 8 },
  salvar: { paddingHorizontal: medidas.margemTela, paddingVertical: 8 },
  confere: { fontSize: fontes.valorDigitado, fontWeight: 'bold', color: cores.texto, textAlign: 'center', marginVertical: 8 },
  explicacao: { fontSize: fontes.corpo, color: cores.textoSecundario, textAlign: 'center' },
  botoesConfere: { flexDirection: 'row', gap: medidas.espacoEntreAlvos, marginTop: 16 },
  botaoConfere: { flex: 1 },
});
