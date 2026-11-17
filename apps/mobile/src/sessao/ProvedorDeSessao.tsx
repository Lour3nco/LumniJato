import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { ResultadoAoEntrar, ResultadoDoToken, ServicoDeSessao, SessaoLocal } from './servico-de-sessao';

/**
 * - `reautenticar`: o Supabase recusou a sessão (§4.6). O app pede para entrar de novo, mas a
 *   sessão local, os dados e a fila continuam no celular.
 */
type EstadoDaSessao = 'carregando' | 'sem-sessao' | 'conectado' | 'reautenticar';

type ValorDoContexto = {
  estado: EstadoDaSessao;
  sessao: SessaoLocal | null;
  entrar: (email: string, senha: string) => Promise<ResultadoAoEntrar>;
  obterTokenDeAcesso: (opcoes?: { forcarRenovacao?: boolean }) => Promise<ResultadoDoToken>;
  sair: () => Promise<void>;
};

const ContextoDaSessao = createContext<ValorDoContexto | null>(null);

/** Guarda a sessão local e decide se o app abre na Início ou na TELA-13 (Entrar). */
export function ProvedorDeSessao({ servico, children }: { servico: ServicoDeSessao; children: ReactNode }) {
  const [sessao, setSessao] = useState<SessaoLocal | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [sessaoRecusada, setSessaoRecusada] = useState(false);

  useEffect(() => {
    let ativo = true;
    servico
      .carregar()
      .catch(() => null)
      .then((guardada) => {
        if (!ativo) return;
        setSessao(guardada);
        setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [servico]);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const resultado = await servico.entrar(email, senha);
      if (resultado.ok) {
        setSessao(resultado.sessao);
        setSessaoRecusada(false);
      }
      return resultado;
    },
    [servico],
  );

  const sair = useCallback(async () => {
    await servico.sair();
    setSessao(null);
    setSessaoRecusada(false);
  }, [servico]);

  const obterTokenDeAcesso = useCallback(
    async (opcoes?: { forcarRenovacao?: boolean }) => {
      const resultado = await servico.obterTokenDeAcesso(opcoes);
      if (resultado.situacao === 'sessao_recusada') setSessaoRecusada(true);
      return resultado;
    },
    [servico],
  );

  const valor = useMemo<ValorDoContexto>(
    () => ({
      estado: carregando ? 'carregando' : !sessao ? 'sem-sessao' : sessaoRecusada ? 'reautenticar' : 'conectado',
      sessao,
      entrar,
      obterTokenDeAcesso,
      sair,
    }),
    [carregando, sessao, sessaoRecusada, entrar, obterTokenDeAcesso, sair],
  );

  return <ContextoDaSessao.Provider value={valor}>{children}</ContextoDaSessao.Provider>;
}

export function useSessao(): ValorDoContexto {
  const valor = useContext(ContextoDaSessao);
  if (!valor) throw new Error('useSessao precisa estar dentro de <ProvedorDeSessao>');
  return valor;
}
