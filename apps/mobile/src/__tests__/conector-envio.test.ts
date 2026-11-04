import {
  type OperacaoDaFila,
  type TransacaoDaFila,
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
    obterToken: async () => 'token-do-supabase',
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

  it('servidor fora (5xx) ou sessão vencida (401) mantêm a operação na fila', async () => {
    for (const status of [500, 503, 401]) {
      const fila = filaFalsa([[lancamento()]]);
      const envio = criarConectorDeEnvio({
        urlDaApi: 'https://api.exemplo.com',
        urlDoPowerSync: 'x',
        obterToken: async () => 't',
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
      obterToken: async () => 't',
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
      obterToken: async () => null,
      aoRecusar: jest.fn(),
    });
    expect(await semSessao.fetchCredentials()).toBeNull();
  });
});
