import { Stack } from 'expo-router';
import { useMemo } from 'react';

import { useSessao } from '../../sessao/ProvedorDeSessao';
import { cores } from '../../tema';
import { ProvedorDeUnidades } from '../../unidades/ProvedorDeUnidades';
import { criarFonteDeUnidadesPadrao } from '../../unidades/fonte-padrao';

/** Telas que só abrem com sessão (o layout raiz protege este grupo inteiro). */
export default function LayoutProtegido() {
  const { obterTokenDeAcesso } = useSessao();
  const fonte = useMemo(() => criarFonteDeUnidadesPadrao(obterTokenDeAcesso), [obterTokenDeAcesso]);
  return (
    <ProvedorDeUnidades fonte={fonte}>
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: cores.texto,
        headerTitleStyle: { fontSize: 20 },
      }}>
      <Stack.Screen name="(abas)" />
      <Stack.Screen name="lancar/servico" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="lancar/entrada" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="lancar/saida" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="ajustes/categorias" options={{ headerShown: true, title: 'Categorias' }} />
      <Stack.Screen name="ajustes/tipos-de-servico" options={{ headerShown: true, title: 'Tipos de serviço' }} />
      <Stack.Screen name="ajustes/tipos-de-veiculo" options={{ headerShown: true, title: 'Tipos de veículo' }} />
      <Stack.Screen name="ajustes/lixeira" options={{ headerShown: true, title: 'Lixeira' }} />
      <Stack.Screen name="ajustes/sincronizacao" options={{ headerShown: true, title: 'Sincronização' }} />
      <Stack.Screen name="ajustes/sobre" options={{ headerShown: true, title: 'Sobre' }} />
    </Stack>
    </ProvedorDeUnidades>
  );
}
