import AsyncStorage from '@react-native-async-storage/async-storage';
import { type SupabaseClient, createClient } from '@supabase/supabase-js';
import { getRandomBytes } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';

import { criarArmazenamentoCifrado } from './armazenamento-cifrado';

/**
 * Cliente do Supabase Auth no app. A URL e a chave pública (anon/publishable) vêm do
 * `apps/mobile/.env` (EXPO_PUBLIC_*), nunca do código. A chave pública pode ir no APK: sem
 * políticas RLS para `anon` e `authenticated` (FIN-US-01.4), ela não lê nem grava nada.
 * A service_role NUNCA vai no app (RNF-18).
 */
let cliente: SupabaseClient | null | undefined;

export function obterClienteSupabase(): SupabaseClient | null {
  if (cliente !== undefined) return cliente;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const chavePublica = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chavePublica) {
    cliente = null;
    return cliente;
  }
  cliente = createClient(url, chavePublica, {
    auth: {
      // Tokens guardados cifrados: chave no cofre do Android, dados no AsyncStorage.
      storage: criarArmazenamentoCifrado({ cofre: SecureStore, armazenamento: AsyncStorage, bytesAleatorios: getRandomBytes }),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  // Renova o token só com o app aberto (recomendação do Supabase para React Native).
  AppState.addEventListener('change', (estado) => {
    if (!cliente) return;
    if (estado === 'active') void cliente.auth.startAutoRefresh();
    else void cliente.auth.stopAutoRefresh();
  });
  return cliente;
}
