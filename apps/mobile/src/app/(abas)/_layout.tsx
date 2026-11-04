import { Tabs } from 'expo-router';

import { cores } from '../../tema';

/**
 * Barra inferior com 4 itens: Início · Extrato · Resumo · Mais (02-design §3, SUP-D08).
 * Os ícones entram com o catálogo de ícones da FIN-US-01.9; por ora, só o rótulo.
 */
export default function LayoutAbas() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.verde,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarIcon: () => null,
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: { fontSize: 16 },
        // Área de toque de pelo menos 48 dp (RNF-01, CA-01.1.3).
        tabBarItemStyle: { minHeight: 48, justifyContent: 'center' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarAccessibilityLabel: 'Início' }} />
      <Tabs.Screen name="extrato" options={{ title: 'Extrato', tabBarAccessibilityLabel: 'Extrato' }} />
      <Tabs.Screen name="resumo" options={{ title: 'Resumo', tabBarAccessibilityLabel: 'Resumo' }} />
      <Tabs.Screen name="mais" options={{ title: 'Mais', tabBarAccessibilityLabel: 'Mais' }} />
    </Tabs>
  );
}
