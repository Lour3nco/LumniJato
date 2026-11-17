import type { ResultadoDoToken } from '../sessao/servico-de-sessao';
import {
  type OperacaoDaFila,
  type TransacaoDaFila,
  ErroDeSessaoRecusada,
  ErroTemporarioDeEnvio,
  criarConectorDeEnvio,
} from '../sincronizacao/conector-envio';

/** Fila local falsa no formato do PowerSync: transações em ordem, saem só com complete(). */
function filaFalsa(operacoes: OperacaoDaFila[][]) {
  const fila = [...operacoes];
  return {
    fila,
    async getNextCrudTransaction(): Promise<TransacaoDaFila | null> {
      const proxima = fila[0];
      if (!proxima) return null;
      return {
        crud: proxima,
        complete: async () => {
          fila.shift();
        },
      };
    },
  };
}

let sequencia = 0;
function lancamento(): OperacaoDaFila {
  sequencia += 1;
  return {
    op: 'PUT',
    table: 'lancamento',
    id: `0192f0c1-0000-7000-8000-${String(sequencia).padStart(12, '0')}`,
    opData: { valor_centavos: 2500 },
  };
}

/** "Servidor" que guarda o que recebeu por id (como a idempotência da §4.1). */
function servidorFalso() {
  const gravados = new Map<string, unknown>();
  let online = false;
  const pedidos: { url: string; autorizacao: string | undefined }[] = [];
  const buscar = jest.fn(async (url: string, init?: RequestInit) => {
    if (!online) throw new TypeError('Network request failed');
    const headers = init?.headers as Record<string, string>;
    pedidos.push({ url, autorizacao: headers.authorization });
    const corpo = JSON.parse(String(init?.body)) as { operacoes: { id: string; dados: unknown }[] };
    for (const op of corpo.operacoes) if (!gravados.has(op.id)) gravados.set(op.id, op.dados);
    return new Response(
      JSON.stringify({ resultados: corpo.operacoes.map((o) => ({ id: o.id, situacao: 'aceita' })) }),
      { status: 200 },
    );
  });
  return {
    gravados,
    pedidos,
    buscar,
    ligar: () => {
      online = true;
    },
  };
}

function conector(servidor: ReturnType<typeof servidorFalso>, aoRecusar = jest.fn(async () => undefined)) {
  return criarConectorDeEnvio({
    urlDaApi: 'https://api.exemplo.com/',
    urlDoPowerSync: 'https://instancia.powersync.exemplo',
    obterToken: async () => ({ situacao: 'ok' as const, token: 'token-do-supabase' }),
    aoSessaoRecusada: jest.fn(),
    aoRecusar,
    fetch: servidor.buscar as unknown as typeof fetch,
  });
}

describe('conector de envio para POST /sync/upload (FIN-US-07.10)', () => {
  // Simulação do CA-07.10.4 (o teste real é no aparelho, com o PowerSync, no roteiro da prova)
  it('50 lançamentos feitos sem internet chegam todos, uma vez só, quando a internet volta', async () => {
    const servidor = servidorFalso();
    const ops = Array.from({ length: 50 }, lancamento);
    const fila = filaFalsa(ops.map((o) => [o]));
    const envio = conector(servidor);

    await expect(envio.uploadData(fila)).rejects.toBeInstanceOf(ErroTemporarioDeEnvio);
    expect(fila.fila).toHaveLength(50); // nada perdido sem internet

    servidor.ligar();
    await envio.uploadData(fila);
    expect(fila.fila).toHaveLength(0);
    expect(servidor.gravados.size).toBe(50);
    expect([...servidor.gravados.keys()]).toEqual(ops.map((o) => o.id)); // em ordem
  });

  it('usa o endpoint da API e o token do Supabase', async () => {
    const servidor = servidorFalso();
    servidor.ligar();
    await conector(servidor).uploadData(filaFalsa([[lancamento()]]));
    expect(servidor.pedidos[0]).toEqual({
      url: 'https://api.exemplo.com/sync/upload',
      autorizacao: 'Bearer token-do-supabase',
    });
  });

  it('reenviar a mesma operação não duplica no servidor', async () => {
    const servidor = servidorFalso();
    servidor.ligar();
    const op = lancamento();
    await conector(servidor).uploadData(filaFalsa([[op]]));
    await conector(servidor).uploadData(filaFalsa([[op]]));
    expect(servidor.gravados.size).toBe(1);
  });

  it('servidor fora (5xx) mantém a operação na fila', async () => {
    for (const status of [500, 503]) {
      const fila = filaFalsa([[lancamento()]]);
      const envio = criarConectorDeEnvio({
        urlDaApi: 'https://api.exemplo.com',
        urlDoPowerSync: 'x',
        obterToken: async () => ({ situacao: 'ok' as const, token: 't' }),
        aoSessaoRecusada: jest.fn(),
        aoRecusar: jest.fn(),
        fetch: (async () => new Response('{}', { status })) as unknown as typeof fetch,
      });
      await expect(envio.uploadData(fila)).rejects.toBeInstanceOf(ErroTemporarioDeEnvio);
      expect(fila.fila).toHaveLength(1);
    }
  });

  it('operação recusada vai para o tratamento de erro e não trava as outras', async () => {
    const [boa, ruim] = [lancamento(), lancamento()];
    const aoRecusar = jest.fn(async () => undefined);
    const envio = criarConectorDeEnvio({
      urlDaApi: 'https://api.exemplo.com',
      urlDoPowerSync: 'x',
      obterToken: async () => ({ situacao: 'ok' as const, token: 't' }),
      aoSessaoRecusada: jest.fn(),
      aoRecusar,
      fetch: (async () =>
        new Response(
          JSON.stringify({
            resultados: [
              { id: boa.id, situacao: 'aceita' },
              { id: ruim.id, situacao: 'recusada', motivo: 'dados', codigo: 'valor_invalido', mensagem: 'O valor precisa ser maior que zero.' },
            ],
          }),
          { status: 200 },
        )) as unknown as typeof fetch,
    });
    const fila = filaFalsa([[boa, ruim]]);
    await envio.uploadData(fila);
    expect(fila.fila).toHaveLength(0);
    expect(aoRecusar).toHaveBeenCalledWith(ruim, expect.objectContaining({ codigo: 'valor_invalido' }));
  });

  // CA-07.10.5 (lado do app): o PowerSync recebe o mesmo token do Supabase
  it('entrega ao PowerSync o mesmo token do Supabase; sem sessão, não conecta', async () => {
    const servidor = servidorFalso();
    expect(await conector(servidor).fetchCredentials()).toEqual({
      endpoint: 'https://instancia.powersync.exemplo',
      token: 'token-do-supabase',
    });
    const semSessao = criarConectorDeEnvio({
      urlDaApi: 'x',
      urlDoPowerSync: 'y',
      obterToken: async () => ({ situacao: 'sem_internet' as const }),
      aoSessaoRecusada: jest.fn(),
      aoRecusar: jest.fn(),
    });
    expect(await semSessao.fetchCredentials()).toBeNull();
  });

  // Sugestão da Arquitetura (passo 5), §4.6
  describe('sem internet × sessão recusada na nuvem', () => {
    function conectorCom(tokens: ResultadoDoToken[], respostas: number[]) {
      const aoSessaoRecusada = jest.fn();
      const fila = filaFalsa([[lancamento()]]);
      const envio = criarConectorDeEnvio({
        urlDaApi: 'https://api.exemplo.com',
        urlDoPowerSync: 'x',
        obterToken: jest.fn(async () => tokens.shift() ?? { situacao: 'sem_internet' as const }),
        aoSessaoRecusada,
        aoRecusar: jest.fn(),
        fetch: (async () =>
          new Response(
            JSON.stringify({ resultados: fila.fila[0]?.map((o) => ({ id: o.id, situacao: 'aceita' })) ?? [] }),
            { status: respostas.shift() ?? 200 },
          )) as unknown as typeof fetch,
      });
      return { envio, fila, aoSessaoRecusada };
    }

    it('sem internet: fica na fila e NÃO pede login', async () => {
      const { envio, fila, aoSessaoRecusada } = conectorCom([{ situacao: 'sem_internet' }], []);
      await expect(envio.uploadData(fila)).rejects.toBeInstanceOf(ErroTemporarioDeEnvio);
      expect(fila.fila).toHaveLength(1);
      expect(aoSessaoRecusada).not.toHaveBeenCalled();
    });

    it('sessão recusada pelo Supabase: pede login e NÃO apaga a fila', async () => {
      const { envio, fila, aoSessaoRecusada } = conectorCom([{ situacao: 'sessao_recusada' }], []);
      await expect(envio.uploadData(fila)).rejects.toBeInstanceOf(ErroDeSessaoRecusada);
      expect(fila.fila).toHaveLength(1);
      expect(aoSessaoRecusada).toHaveBeenCalledTimes(1);
    });

    it('401 da API: renova o token e tenta de novo; se passar, envia normalmente', async () => {
      const { envio, fila, aoSessaoRecusada } = conectorCom(
        [
          { situacao: 'ok', token: 'velho' },
          { situacao: 'ok', token: 'novo' },
        ],
        [401, 200],
      );
      await envio.uploadData(fila);
      expect(fila.fila).toHaveLength(0);
      expect(aoSessaoRecusada).not.toHaveBeenCalled();
    });

    it('401 de novo depois de renovar: sessão recusada, fila intacta', async () => {
      const { envio, fila, aoSessaoRecusada } = conectorCom(
        [
          { situacao: 'ok', token: 'a' },
          { situacao: 'ok', token: 'b' },
        ],
        [401, 401],
      );
      await expect(envio.uploadData(fila)).rejects.toBeInstanceOf(ErroDeSessaoRecusada);
      expect(fila.fila).toHaveLength(1);
      expect(aoSessaoRecusada).toHaveBeenCalledTimes(1);
    });

    it('PowerSync sem credenciais quando a sessão é recusada', async () => {
      const { envio, aoSessaoRecusada } = conectorCom([{ situacao: 'sessao_recusada' }], []);
      expect(await envio.fetchCredentials()).toBeNull();
      expect(aoSessaoRecusada).toHaveBeenCalled();
    });
  });
});
