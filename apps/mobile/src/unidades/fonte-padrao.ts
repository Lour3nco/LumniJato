import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ResultadoDoToken } from '../sessao/servico-de-sessao';
import { type FonteDeUnidades, criarFonteDeUnidades } from './fonte-de-unidades';

/** Fonte de unidades do app de verdade (API + AsyncStorage). Os testes trocam este módulo. */
export function criarFonteDeUnidadesPadrao(obterToken: () => Promise<ResultadoDoToken>): FonteDeUnidades {
  return criarFonteDeUnidades({
    armazenamento: AsyncStorage,
    urlDaApi: process.env.EXPO_PUBLIC_API_URL,
    obterToken,
  });
}
