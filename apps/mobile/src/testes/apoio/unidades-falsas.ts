import type { FonteDeUnidades, Unidade } from '../../unidades/fonte-de-unidades';

export const UNIDADE_CENTRO: Unidade = { id: 'u-centro', nome: 'Unidade Centro' };
export const UNIDADE_BAIRRO: Unidade = { id: 'u-bairro', nome: 'Unidade Bairro' };

/**
 * Fonte de unidades em memória. A escolha fica guardada entre um "abrir o app" e outro, como no
 * AsyncStorage do aparelho (CA-08.3.3).
 */
export function criarFonteFalsa(unidades: Unidade[] = [UNIDADE_CENTRO, UNIDADE_BAIRRO], escolhaInicial: string | null = UNIDADE_CENTRO.id) {
  const estado = { escolha: escolhaInicial, unidades };
  const fonte: FonteDeUnidades = {
    carregarDoAparelho: async () => estado.unidades,
    atualizar: async () => null,
    lerEscolhida: async () => estado.escolha,
    guardarEscolhida: async (e) => {
      estado.escolha = e;
    },
  };
  return { fonte, estado };
}
