import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { ResultadoAoEntrar, ServicoDeSessao, SessaoLocal } from './servico-de-sessao';

type EstadoDaSessao = 'carregando' | 'sem-sessao' | 'conectado';

type ValorDoContexto = {
  estado: EstadoDaSessao;
  sessao: SessaoLocal | null;
  entrar: (email: string, senha: string) => Promise<ResultadoAoEntrar>;
  obterTokenDeAcesso: () => Promise<string | null>;
  sair: () => Promise<void>;
};

const ContextoDaSessao = createContext<ValorDoContexto | null>(null);

/** Guarda a sessão local e decide se o app abre na Início ou na TELA-13 (Entrar). */
export function ProvedorDeSessao({ servico, children }: { servico: ServicoDeSessao; children: ReactNode }) {
  const [sessao, setSessao] = useState<SessaoLocal | null>(null);
  const [carregando, setCarregando] = useState(true);

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
      if (resultado.ok) setSessao(resultado.sessao);
      return resultado;
    },
    [servico],
  );

  const sair = useCallback(async () => {
    await servico.sair();
    setSessao(null);
  }, [servico]);

  const valor = useMemo<ValorDoContexto>(
    () => ({
      estado: carregando ? 'carregando' : sessao ? 'conectado' : 'sem-sessao',
      sessao,
      entrar,
      obterTokenDeAcesso: () => servico.obterTokenDeAcesso(),
      sair,
    }),
    [carregando, sessao, entrar, sair, servico],
  );

  return <ContextoDaSessao.Provider value={valor}>{children}</ContextoDaSessao.Provider>;
}

export function useSessao(): ValorDoContexto {
  const valor = useContext(ContextoDaSessao);
  if (!valor) throw new Error('useSessao precisa estar dentro de <ProvedorDeSessao>');
  return valor;
}
