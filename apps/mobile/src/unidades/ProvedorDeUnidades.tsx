import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { FonteDeUnidades, Unidade } from './fonte-de-unidades';

/** "Todas as unidades": ver o consolidado; para lançar, o formulário pede a unidade (JOR-j). */
export const TODAS_AS_UNIDADES = 'todas';

/**
 * Cor de cada unidade no topo, pela ordem do nome (02-design JOR-j: "o topo muda de cor/nome")
 * [SUPOSIÇÃO de paleta]. Todas com contraste ≥ 4,5:1 com texto branco.
 */
const CORES_DAS_UNIDADES = ['#0D47A1', '#4A148C', '#004D40', '#BF360C', '#37474F', '#880E4F'];
const COR_TODAS = '#263238';

type ValorDoContexto = {
  unidades: Unidade[];
  /** Id da unidade atual, `TODAS_AS_UNIDADES` ou `null` (nenhuma baixada ainda). */
  escolha: string | null;
  unidadeAtual: Unidade | null;
  escolher: (escolha: string) => Promise<void>;
  corDa: (escolha: string | null) => string;
  nomeDa: (escolha: string | null) => string;
};

const ContextoDeUnidades = createContext<ValorDoContexto | null>(null);

/** Unidade atual da Início e dos lançamentos novos, lembrada até o dono trocar (CA-08.3.3). */
export function ProvedorDeUnidades({ fonte, children }: { fonte: FonteDeUnidades; children: ReactNode }) {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [escolhaGuardada, setEscolhaGuardada] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    void (async () => {
      const [doAparelho, escolhida] = await Promise.all([fonte.carregarDoAparelho(), fonte.lerEscolhida()]);
      if (!ativo) return;
      setUnidades(ordenar(doAparelho));
      setEscolhaGuardada(escolhida);
      const atualizadas = await fonte.atualizar();
      if (ativo && atualizadas) setUnidades(ordenar(atualizadas));
    })();
    return () => {
      ativo = false;
    };
  }, [fonte]);

  const escolher = useCallback(
    async (nova: string) => {
      setEscolhaGuardada(nova);
      await fonte.guardarEscolhida(nova);
    },
    [fonte],
  );

  const valor = useMemo<ValorDoContexto>(() => {
    // Escolha guardada que não existe mais (unidade removida) volta para a primeira.
    const valida =
      escolhaGuardada === TODAS_AS_UNIDADES || unidades.some((u) => u.id === escolhaGuardada) ? escolhaGuardada : null;
    const escolha = valida ?? unidades[0]?.id ?? null;
    const unidadeAtual = unidades.find((u) => u.id === escolha) ?? null;
    return {
      unidades,
      escolha,
      unidadeAtual,
      escolher,
      corDa: (e) => {
        if (e === TODAS_AS_UNIDADES) return COR_TODAS;
        const indice = unidades.findIndex((u) => u.id === e);
        return CORES_DAS_UNIDADES[Math.max(indice, 0) % CORES_DAS_UNIDADES.length];
      },
      nomeDa: (e) => (e === TODAS_AS_UNIDADES ? 'Todas as unidades' : (unidades.find((u) => u.id === e)?.nome ?? 'Sem unidade')),
    };
  }, [unidades, escolhaGuardada, escolher]);

  return <ContextoDeUnidades.Provider value={valor}>{children}</ContextoDeUnidades.Provider>;
}

function ordenar(unidades: Unidade[]): Unidade[] {
  return [...unidades].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function useUnidades(): ValorDoContexto {
  const valor = useContext(ContextoDeUnidades);
  if (!valor) throw new Error('useUnidades precisa estar dentro de <ProvedorDeUnidades>');
  return valor;
}
