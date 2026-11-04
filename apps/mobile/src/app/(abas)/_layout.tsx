import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { Icone } from '../../componentes';
import { cores } from '../../tema';

/** Ícone da barra: decorativo, o rótulo do item é o que o leitor de tela lê. */
function iconeDaAba(nome: string) {
  function IconeDaAba({ color }: { color: ColorValue }) {
    return <Icone nome={nome} cor={typeof color === 'string' ? color : undefined} />;
  }
  return IconeDaAba;
}

/** Barra inferior com 4 itens: Início · Extrato · Resumo · Mais (02-design §3, SUP-D08). */
export default function LayoutAbas() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.verde,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarLabelStyle: { fontSize: 14 },
        // Área de toque de pelo menos 48 dp (RNF-01, CA-01.1.3).
        tabBarItemStyle: { minHeight: 48, justifyContent: 'center' },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', tabBarAccessibilityLabel: 'Início', tabBarIcon: iconeDaAba('inicio') }}
      />
      <Tabs.Screen
        name="extrato"
        options={{ title: 'Extrato', tabBarAccessibilityLabel: 'Extrato', tabBarIcon: iconeDaAba('extrato') }}
      />
      <Tabs.Screen
        name="resumo"
        options={{ title: 'Resumo', tabBarAccessibilityLabel: 'Resumo', tabBarIcon: iconeDaAba('resumo') }}
      />
      <Tabs.Screen
        name="mais"
        options={{ title: 'Mais', tabBarAccessibilityLabel: 'Mais', tabBarIcon: iconeDaAba('mais') }}
      />
    </Tabs>
  );
}
