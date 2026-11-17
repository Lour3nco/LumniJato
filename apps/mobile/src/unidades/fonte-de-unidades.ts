import type { ResultadoDoToken } from '../sessao/servico-de-sessao';

export interface Unidade {
  id: string;
  nome: string;
}

/** Onde o app encontra as unidades do dono e guarda a unidade escolhida (config_local, §3.2). */
export interface FonteDeUnidades {
  /** Unidades já guardadas no aparelho (funciona sem internet). */
  carregarDoAparelho(): Promise<Unidade[]>;
  /** Busca na nuvem e guarda no aparelho; `null` se não deu (sem internet, sem sessão). */
  atualizar(): Promise<Unidade[] | null>;
  lerEscolhida(): Promise<string | null>;
  guardarEscolhida(escolha: string): Promise<void>;
}

export interface ArmazenamentoDeTexto {
  getItem(chave: string): Promise<string | null>;
  setItem(chave: string, valor: string): Promise<void>;
}

export const CHAVE_UNIDADES = 'lavajato.unidades';
export const CHAVE_UNIDADE_ESCOLHIDA = 'lavajato.unidade-escolhida';

type Dependencias = {
  armazenamento: ArmazenamentoDeTexto;
  /** URL da API NestJS (EXPO_PUBLIC_API_URL); sem ela, só o que já está no aparelho. */
  urlDaApi: string | undefined;
  obterToken: () => Promise<ResultadoDoToken>;
  fetch?: typeof fetch;
};

/**
 * [PROVISÓRIO até a FIN-US-07.1] As unidades vêm de `GET /eu` da API e ficam guardadas no
 * aparelho para funcionar sem internet. Com o PowerSync, passam a vir do banco local
 * sincronizado (tabela `unidade`), e esta fonte troca de implementação sem mudar as telas.
 */
export function criarFonteDeUnidades({ armazenamento, urlDaApi, obterToken, fetch: buscar = fetch }: Dependencias): FonteDeUnidades {
  async function lerLista(): Promise<Unidade[]> {
    try {
      return JSON.parse((await armazenamento.getItem(CHAVE_UNIDADES)) ?? '[]') as Unidade[];
    } catch {
      return [];
    }
  }

  return {
    carregarDoAparelho: lerLista,

    async atualizar() {
      if (!urlDaApi) return null;
      const token = await obterToken();
      if (token.situacao !== 'ok') return null;
      try {
        const resposta = await buscar(`${urlDaApi.replace(/\/+$/, '')}/eu`, {
          headers: { authorization: `Bearer ${token.token}` },
        });
        if (!resposta.ok) return null;
        const corpo = (await resposta.json()) as { unidades: Unidade[] };
        const unidades = corpo.unidades.map(({ id, nome }) => ({ id, nome }));
        await armazenamento.setItem(CHAVE_UNIDADES, JSON.stringify(unidades));
        return unidades;
      } catch {
        return null;
      }
    },

    lerEscolhida: () => armazenamento.getItem(CHAVE_UNIDADE_ESCOLHIDA),
    guardarEscolhida: (escolha) => armazenamento.setItem(CHAVE_UNIDADE_ESCOLHIDA, escolha),
  };
}
