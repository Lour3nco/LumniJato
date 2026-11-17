import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { ProvedorDeSessao, useSessao } from '../sessao/ProvedorDeSessao';
import type { ResultadoDoToken } from '../sessao/servico-de-sessao';
import { SESSAO_DO_DONO, criarSessaoFalsa } from '../testes/apoio/sessao-falsa';
import { CHAVE_UNIDADES, criarFonteDeUnidades } from '../unidades/fonte-de-unidades';

function memoria() {
  const dados = new Map<string, string>();
  return {
    dados,
    getItem: async (k: string) => dados.get(k) ?? null,
    setItem: async (k: string, v: string) => void dados.set(k, v),
  };
}

describe('fonte de unidades (FIN-US-08.3, provisória até a 07.1)', () => {
  it('busca em GET /eu com o token e guarda no aparelho para usar sem internet', async () => {
    const armazenamento = memoria();
    const buscar = jest.fn(async () =>
      new Response(JSON.stringify({ unidades: [{ id: 'u1', nome: 'Centro', papel: 'dono' }] }), { status: 200 }),
    );
    const fonte = criarFonteDeUnidades({
      armazenamento,
      urlDaApi: 'https://api.exemplo.com/',
      obterToken: async () => ({ situacao: 'ok', token: 'tk' }),
      fetch: buscar as unknown as typeof fetch,
    });
    expect(await fonte.atualizar()).toEqual([{ id: 'u1', nome: 'Centro' }]);
    expect(buscar).toHaveBeenCalledWith('https://api.exemplo.com/eu', { headers: { authorization: 'Bearer tk' } });

    const semInternet = criarFonteDeUnidades({
      armazenamento,
      urlDaApi: 'https://api.exemplo.com',
      obterToken: async () => ({ situacao: 'sem_internet' }),
    });
    expect(await semInternet.atualizar()).toBeNull();
    expect(await semInternet.carregarDoAparelho()).toEqual([{ id: 'u1', nome: 'Centro' }]);
    expect(armazenamento.dados.has(CHAVE_UNIDADES)).toBe(true);
  });

  it('sem URL da API configurada, fica só com o que está no aparelho', async () => {
    const fonte = criarFonteDeUnidades({ armazenamento: memoria(), urlDaApi: undefined, obterToken: jest.fn() });
    expect(await fonte.atualizar()).toBeNull();
    expect(await fonte.carregarDoAparelho()).toEqual([]);
  });
});

function montarSessao(token: ResultadoDoToken) {
  const { servico, estado } = criarSessaoFalsa(SESSAO_DO_DONO);
  estado.token = token;
  const envoltorio = ({ children }: { children: ReactNode }) => <ProvedorDeSessao servico={servico}>{children}</ProvedorDeSessao>;
  return renderHook(() => useSessao(), { wrapper: envoltorio });
}

describe('sessão recusada na nuvem (§4.6, sugestão b)', () => {
  it.each([
    ['sem_internet', 'conectado'],
    ['sessao_recusada', 'reautenticar'],
  ] as const)('token "%s" deixa a sessão em "%s", sem apagar a sessão local', async (situacao, esperado) => {
    const { result } = await montarSessao({ situacao });
    await waitFor(() => expect(result.current.estado).toBe('conectado'));
    await act(async () => {
      await result.current.obterTokenDeAcesso();
    });
    expect(result.current.estado).toBe(esperado);
    expect(result.current.sessao).not.toBeNull();
  });

  it('entrar de novo volta ao normal', async () => {
    const { result } = await montarSessao({ situacao: 'sessao_recusada' });
    await waitFor(() => expect(result.current.estado).toBe('conectado'));
    await act(async () => {
      await result.current.obterTokenDeAcesso();
    });
    expect(result.current.estado).toBe('reautenticar');
    await act(async () => {
      await result.current.entrar('dono@exemplo.com', 'senha');
    });
    expect(result.current.estado).toBe('conectado');
  });
});
