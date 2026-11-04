import { SINAL_MENOS, formatarReais } from '@lavajato/dominio-compartilhado';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, fontes, medidas } from '../tema';
import { Icone } from './Icone';

type Props = {
  icone: string;
  corDoIcone?: string;
  /** Ex.: "Lavagem completa" ou "Alimentação". */
  titulo: string;
  /** Ex.: "SUV · Pix · Centro". */
  detalhe?: string;
  tipo: 'entrada' | 'saida';
  valorCentavos: number;
  /** Rótulo de data já pronto ("Hoje", "Ontem", "03/11"). */
  data?: string;
  pessoal?: boolean;
  /** Ainda não foi enviado para a nuvem (§4.5). */
  pendente?: boolean;
  aoTocar?: () => void;
};

/**
 * Linha de lançamento do extrato e da Início. Entrada em verde com "+", saída em vermelho com
 * "−" (a cor nunca é o único sinal). O leitor de tela lê a linha inteira de uma vez.
 */
export function ItemDeLista({
  icone,
  corDoIcone,
  titulo,
  detalhe,
  tipo,
  valorCentavos,
  data,
  pessoal,
  pendente,
  aoTocar,
}: Props) {
  const entrada = tipo === 'entrada';
  const valorTexto = `${entrada ? '+' : SINAL_MENOS}${formatarReais(valorCentavos)}`;
  const rotuloAcessivel = [
    titulo,
    detalhe,
    `${entrada ? 'entrada' : 'saída'} de ${formatarReais(valorCentavos)}`,
    data,
    pessoal ? 'pessoal' : undefined,
    pendente ? 'aguardando envio' : undefined,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      accessibilityRole={aoTocar ? 'button' : undefined}
      accessible
      accessibilityLabel={rotuloAcessivel}
      onPress={aoTocar}
      disabled={!aoTocar}
      style={estilos.linha}>
      <Icone nome={icone} cor={corDoIcone ?? cores.texto} tamanho={28} />
      <View style={estilos.textos}>
        <Text style={estilos.titulo}>{titulo}</Text>
        {detalhe || pessoal ? (
          <Text style={estilos.detalhe}>
            {detalhe}
            {pessoal ? <Text style={estilos.pessoal}>{detalhe ? ' · ' : ''}Pessoal</Text> : null}
          </Text>
        ) : null}
      </View>
      <View style={estilos.direita}>
        <Text style={[estilos.valor, { color: entrada ? cores.verde : cores.vermelho }]}>{valorTexto}</Text>
        {pendente ? (
          <View style={estilos.pendente}>
            <Icone nome="pendente" cor={cores.pendente} tamanho={14} />
            <Text style={estilos.textoPendente}>aguardando envio</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: medidas.toqueMinimo + 8,
    paddingVertical: 8,
    gap: 12,
  },
  textos: { flex: 1 },
  titulo: { fontSize: fontes.corpo, color: cores.texto },
  detalhe: { fontSize: fontes.pequeno, color: cores.textoSecundario },
  pessoal: { color: cores.roxo, fontWeight: 'bold' },
  direita: { alignItems: 'flex-end', flexShrink: 0, maxWidth: '50%' },
  valor: { fontSize: fontes.corpo, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  pendente: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  textoPendente: { fontSize: 12, color: cores.pendente },
});
