import {
  type LoteSincronizacao,
  type ResultadoOperacao,
  loteSincronizacaoSchema,
  resultadoLoteSchema,
} from '@lavajato/contratos';

import type { ResultadoDoToken } from '../sessao/servico-de-sessao';

/**
 * Conector de envio do PowerSync (03-arquitetura §2.2, prova de conceito FIN-US-07.10).
 *
 * O PowerSync guarda cada alteração local numa fila persistente e chama `uploadData` quando há
 * internet. Este conector manda a fila para `POST /sync/upload` do NestJS com o JWT do usuário:
 * o app NUNCA grava direto no Postgres (RNF-18).
 *
 * As interfaces abaixo são o pedaço do SDK `@powersync/react-native` que o conector usa
 * (`CrudEntry`, `CrudTransaction`, `getNextCrudTransaction`). O SDK em si só é instalado se a
 * prova de conceito aprovar o PowerSync (FIN-US-07.1); até lá, o conector é testado com uma
 * fila falsa.
 */

/** Uma operação da fila local (formato do `CrudEntry` do PowerSync). */
export interface OperacaoDaFila {
  op: 'PUT' | 'PATCH' | 'DELETE';
  table: string;
  id: string;
  opData?: Record<string, unknown>;
}

/** Uma transação local: tudo o que foi gravado junto (lançamento + fila, §4.2). */
export interface TransacaoDaFila {
  crud: OperacaoDaFila[];
  /** Tira a transação da fila (só depois que o servidor respondeu). */
  complete(): Promise<void>;
}

export interface BancoLocalComFila {
  getNextCrudTransaction(): Promise<TransacaoDaFila | null>;
}

export interface CredenciaisPowerSync {
  endpoint: string;
  token: string;
}

/** Erro temporário: a operação fica na fila e o PowerSync tenta de novo mais tarde (§4.6). */
export class ErroTemporarioDeEnvio extends Error {
  constructor(motivo: string) {
    super(motivo);
    this.name = 'ErroTemporarioDeEnvio';
  }
}

/**
 * O Supabase (ou a API, com 401 mesmo depois de renovar) RECUSOU a sessão: o app pede para
 * entrar de novo. A operação continua na fila — nada é apagado (§4.6).
 */
export class ErroDeSessaoRecusada extends Error {
  constructor() {
    super('sessão recusada na nuvem; entrar de novo');
    this.name = 'ErroDeSessaoRecusada';
  }
}

type Dependencias = {
  /** URL da API NestJS, ex.: https://api.exemplo.com */
  urlDaApi: string;
  /** URL da instância do PowerSync (vem da conta do dono). */
  urlDoPowerSync: string;
  /** Token do Supabase Auth, renovado antes de vencer (FIN-US-01.7). */
  obterToken: (opcoes?: { forcarRenovacao?: boolean }) => Promise<ResultadoDoToken>;
  /** A nuvem recusou a sessão: o app mostra "entre de novo" (sem apagar a fila). */
  aoSessaoRecusada: () => void;
  /**
   * Operação recusada de vez pelo servidor (regra de domínio ou permissão). Quem recebe guarda
   * o dado como erro para o dono ver e corrigir (§4.6, FIN-US-07.6); nunca é descartada sozinha.
   */
  aoRecusar: (operacao: OperacaoDaFila, resultado: Extract<ResultadoOperacao, { situacao: 'recusada' }>) => Promise<void>;
  fetch?: typeof fetch;
};

export function criarConectorDeEnvio({
  urlDaApi,
  urlDoPowerSync,
  obterToken,
  aoSessaoRecusada,
  aoRecusar,
  fetch: buscar = fetch,
}: Dependencias) {
  /** Token válido, ou erro que mantém a fila: sem internet (tenta depois) × sessão recusada. */
  async function tokenOuErro(forcarRenovacao = false): Promise<string> {
    const resultado = await obterToken({ forcarRenovacao });
    if (resultado.situacao === 'ok') return resultado.token;
    if (resultado.situacao === 'sessao_recusada') {
      aoSessaoRecusada();
      throw new ErroDeSessaoRecusada();
    }
    throw new ErroTemporarioDeEnvio(resultado.situacao === 'sem_internet' ? 'sem internet' : 'app sem configuração');
  }

  async function enviar(lote: LoteSincronizacao, token: string): Promise<Response> {
    try {
      return await buscar(`${urlDaApi.replace(/\/+$/, '')}/sync/upload`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify(lote),
      });
    } catch {
      throw new ErroTemporarioDeEnvio('sem internet');
    }
  }

  return {
    /** O PowerSync usa o MESMO token do Supabase Auth que o NestJS (CA-07.10.5). */
    async fetchCredentials(): Promise<CredenciaisPowerSync | null> {
      const resultado = await obterToken();
      if (resultado.situacao === 'ok') return { endpoint: urlDoPowerSync, token: resultado.token };
      if (resultado.situacao === 'sessao_recusada') aoSessaoRecusada();
      return null;
    },

    /**
     * Envia a fila em ordem, uma transação por vez. Só tira da fila depois da resposta do
     * servidor; falha de rede ou servidor fora mantém tudo na fila (RNF-08). Como os ids são
     * gerados no aparelho, reenviar não duplica (§4.1).
     */
    async uploadData(banco: BancoLocalComFila): Promise<void> {
      for (;;) {
        const transacao = await banco.getNextCrudTransaction();
        if (!transacao) return;

        const lote: LoteSincronizacao = loteSincronizacaoSchema.parse({
          operacoes: transacao.crud.map((o) => ({ op: o.op, tabela: o.table, id: o.id, dados: o.opData })),
        });

        let resposta = await enviar(lote, await tokenOuErro());
        if (resposta.status === 401) {
          // Token vencido no caminho: renova e tenta uma vez; 401 de novo = sessão recusada.
          resposta = await enviar(lote, await tokenOuErro(true));
          if (resposta.status === 401) {
            aoSessaoRecusada();
            throw new ErroDeSessaoRecusada();
          }
        }
        if (!resposta.ok) throw new ErroTemporarioDeEnvio(`servidor respondeu ${resposta.status}`);

        const { resultados } = resultadoLoteSchema.parse(await resposta.json());
        for (const operacao of transacao.crud) {
          const resultado = resultados.find((r) => r.id === operacao.id);
          if (!resultado) throw new ErroTemporarioDeEnvio(`servidor não respondeu a operação ${operacao.id}`);
          if (resultado.situacao === 'recusada') await aoRecusar(operacao, resultado);
        }
        await transacao.complete();
      }
    },
  };
}
