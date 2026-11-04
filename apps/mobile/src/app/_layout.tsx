import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ProvedorDeSessao, useSessao } from '../sessao/ProvedorDeSessao';
import { servicoDeSessao } from '../sessao/servico-padrao';

/**
 * Sem sessão local, só a TELA-13 (Entrar) fica acessível; com sessão, o grupo (protegido) —
 * abas, lançamentos e ajustes. Toda tela nova vai DENTRO desse grupo. Não há tela de
 * criar conta (ST-07).
 */
function Navegacao() {
  const { estado } = useSessao();
  // Enquanto lê a sessão guardada (instantâneo, sem rede), mantém a tela de abertura.
  if (estado === 'carregando') return null;
  const conectado = estado === 'conectado';
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={conectado}>
        <Stack.Screen name="(protegido)" />
      </Stack.Protected>
      <Stack.Protected guard={!conectado}>
        <Stack.Screen name="entrar" />
      </Stack.Protected>
    </Stack>
  );
}

export default function LayoutRaiz() {
  return (
    <ProvedorDeSessao servico={servicoDeSessao}>
      <Navegacao />
      <StatusBar style="dark" />
    </ProvedorDeSessao>
  );
}
