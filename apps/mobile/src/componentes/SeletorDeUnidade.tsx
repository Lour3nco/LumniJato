import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TODAS_AS_UNIDADES, useUnidades } from '../unidades/ProvedorDeUnidades';
import { cores, fontes, medidas } from '../tema';
import { FolhaInferior } from './FolhaInferior';
import { Icone } from './Icone';

/**
 * Topo da Início com a unidade atual ("📍 Unidade Centro ▾"), na cor da unidade, e a TELA-08:
 * folha inferior com as unidades (marca na atual) e "Todas as unidades" (FIN-US-08.3, JOR-j).
 */
export function SeletorDeUnidade() {
  const { unidades, escolha, escolher, corDa, nomeDa } = useUnidades();
  const [aberto, setAberto] = useState(false);
  const nome = nomeDa(escolha);

  const opcoes = [...unidades, { id: TODAS_AS_UNIDADES, nome: 'Todas as unidades' }];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Unidade atual: ${nome}. Toque para trocar.`}
        onPress={() => setAberto(true)}
        style={[estilos.topo, { backgroundColor: corDa(escolha) }]}
        testID="topo-da-unidade">
        <Icone nome="unidade" cor={cores.textoSobreCor} />
        <Text style={estilos.nome}>{nome}</Text>
        <Text style={estilos.seta}>▾</Text>
      </Pressable>

      <FolhaInferior visivel={aberto} titulo="Escolha a unidade" aoFechar={() => setAberto(false)}>
        {unidades.length === 0 ? (
          <Text style={estilos.vazio}>
            Nenhuma unidade no celular ainda. Conecte-se à internet para baixar as suas unidades.
          </Text>
        ) : (
          opcoes.map((opcao) => {
            const marcada = opcao.id === escolha;
            return (
              <Pressable
                key={opcao.id}
                accessibilityRole="radio"
                accessibilityLabel={opcao.nome}
                accessibilityState={{ checked: marcada, selected: marcada }}
                onPress={() => {
                  setAberto(false);
                  void escolher(opcao.id);
                }}
                style={estilos.opcao}>
                <View style={[estilos.bolinha, { backgroundColor: corDa(opcao.id) }]} />
                <Text style={[estilos.rotulo, marcada && estilos.rotuloMarcado]}>{opcao.nome}</Text>
                {marcada ? <Text style={estilos.marca}>✓</Text> : null}
              </Pressable>
            );
          })
        )}
      </FolhaInferior>
    </>
  );
}

const estilos = StyleSheet.create({
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: medidas.toqueMinimo + 8,
    paddingHorizontal: medidas.margemTela,
  },
  nome: { flexShrink: 1, fontSize: fontes.corpo + 2, fontWeight: 'bold', color: cores.textoSobreCor },
  seta: { fontSize: fontes.corpo, color: cores.textoSobreCor },
  vazio: { fontSize: fontes.corpo, color: cores.textoSecundario, marginVertical: 12 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: medidas.toqueMinimo + 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  bolinha: { width: 16, height: 16, borderRadius: 8 },
  rotulo: { flex: 1, fontSize: fontes.corpo, color: cores.texto },
  rotuloMarcado: { fontWeight: 'bold' },
  marca: { fontSize: 20, color: cores.verde, fontWeight: 'bold' },
});
