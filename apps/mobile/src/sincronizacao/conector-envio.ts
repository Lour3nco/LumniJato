import {
  type LoteSincronizacao,
  type ResultadoOperacao,
  loteSincronizacaoSchema,
  resultadoLoteSchema,
} from '@lavajato/contratos';

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

type Dependencias = {
  /** URL da API NestJS, ex.: https://api.exemplo.com */
  urlDaApi: string;
  /** URL da instância do PowerSync (vem da conta do dono). */
  urlDoPowerSync: string;
  /** Token do Supabase Auth, renovado antes de vencer (FIN-US-01.7). `null` sem sessão/rede. */
  obterToken: () => Promise<string | null>;
  /**
   * Operação recusada de vez pelo servidor (regra de domínio ou permissão). Quem recebe guarda
   * o dado como erro para o dono ver e corrigir (§4.6, FIN-US-07.6); nunca é descartada sozinha.
   */
  aoRecusar: (operacao: OperacaoDaFila, resultado: Extract<ResultadoOperacao, { situacao: 'recusada' }>) => Promise<void>;
  fetch?: typeof fetch;
};

export function criarConectorDeEnvio({ urlDaApi, urlDoPowerSync, obterToken, aoRecusar, fetch: buscar = fetch }: Dependencias) {
  return {
    /** O PowerSync usa o MESMO token do Supabase Auth que o NestJS (CA-07.10.5). */
    async fetchCredentials(): Promise<CredenciaisPowerSync | null> {
      const token = await obterToken();
      return token ? { endpoint: urlDoPowerSync, token } : null;
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

        const token = await obterToken();
        if (!token) throw new ErroTemporarioDeEnvio('sem sessão ou sem internet');

        const lote: LoteSincronizacao = loteSincronizacaoSchema.parse({
          operacoes: transacao.crud.map((o) => ({ op: o.op, tabela: o.table, id: o.id, dados: o.opData })),
        });

        let resposta: Response;
        try {
          resposta = await buscar(`${urlDaApi.replace(/\/+$/, '')}/sync/upload`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
            body: JSON.stringify(lote),
          });
        } catch {
          throw new ErroTemporarioDeEnvio('sem internet');
        }
        if (resposta.status === 401) throw new ErroTemporarioDeEnvio('sessão vencida; renova e tenta de novo');
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
