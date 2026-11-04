import AsyncStorage from '@react-native-async-storage/async-storage';

import { obterClienteSupabase } from './cliente-supabase';
import type { ServicoDeSessao } from './servico-de-sessao';
import { criarServicoSupabase } from './servico-supabase';

/** Serviço de sessão do app de verdade (Supabase Auth + AsyncStorage). */
export const servicoDeSessao: ServicoDeSessao = criarServicoSupabase({
  obterCliente: () => obterClienteSupabase()?.auth ?? null,
  armazenamento: AsyncStorage,
});
