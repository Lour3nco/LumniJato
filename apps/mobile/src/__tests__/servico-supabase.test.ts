import {
  type Armazenamento,
  CHAVE_SESSAO_LOCAL,
  type ClienteDeAutenticacao,
  criarServicoSupabase,
} from '../sessao/servico-supabase';

const AGORA = Date.parse('2026-11-04T12:00:00Z');

function armazenamentoEmMemoria(): Armazenamento & { dados: Map<string, string> } {
  const dados = new Map<string, string>();
  return {
    dados,
    getItem: async (chave) => dados.get(chave) ?? null,
    setItem: async (chave, valor) => {
      dados.set(chave, valor);
    },
    removeItem: async (chave) => {
      dados.delete(chave);
    },
  };
}

function clienteFalso(sobrescrever: Partial<ClienteDeAutenticacao> = {}): ClienteDeAutenticacao {
  return {
    signInWithPassword: jest.fn(async () => ({
      data: { user: { id: 'u-1', email: 'dono@exemplo.com' }, session: {} },
      error: null,
    })),
    getSession: jest.fn(async () => ({ data: { session: null } })),
    refreshSession: jest.fn(async () => ({ data: { session: { access_token: 'token-novo' } } })),
    signOut: jest.fn(async () => ({ error: null })),
    ...sobrescrever,
  };
}

describe('serviço de sessão com Supabase Auth (FIN-US-01.7)', () => {
  it('guarda a sessão local ao entrar e a lê de volta sem rede', async () => {
    const armazenamento = armazenamentoEmMemoria();
    const servico = criarServicoSupabase({ obterCliente: () => clienteFalso(), armazenamento, agora: () => AGORA });

    const resultado = await servico.entrar(' dono@exemplo.com ', 'senha');
    expect(resultado).toEqual({
      ok: true,
      sessao: { usuarioId: 'u-1', email: 'dono@exemplo.com', entrouEm: '2026-11-04T12:00:00.000Z' },
    });

    // CA-01.7.4: outro "abrir o app", sem cliente (sem rede/servidor): a sessão local continua.
    const offline = criarServicoSupabase({ obterCliente: () => null, armazenamento });
    expect(await offline.carregar()).toEqual(resultado.ok && resultado.sessao);
    expect(armazenamento.dados.has(CHAVE_SESSAO_LOCAL)).toBe(true);
  });

  it('manda o e-mail sem espaços nas pontas', async () => {
    const cliente = clienteFalso();
    const servico = criarServicoSupabase({ obterCliente: () => cliente, armazenamento: armazenamentoEmMemoria() });
    await servico.entrar('  dono@exemplo.com ', 'x');
    expect(cliente.signInWithPassword).toHaveBeenCalledWith({ email: 'dono@exemplo.com', password: 'x' });
  });

  // CA-01.7.2
  it('traduz credencial inválida em mensagem simples e não guarda sessão', async () => {
    const armazenamento = armazenamentoEmMemoria();
    const cliente = clienteFalso({
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { name: 'AuthApiError', code: 'invalid_credentials', status: 400, message: 'Invalid login credentials' },
      }),
    });
    const servico = criarServicoSupabase({ obterCliente: () => cliente, armazenamento });
    const resultado = await servico.entrar('dono@exemplo.com', 'errada');
    expect(resultado).toMatchObject({ ok: false, motivo: 'credenciais_invalidas' });
    expect(await servico.carregar()).toBeNull();
  });

  // CA-01.7.3
  it.each([
    ['erro de rede do supabase-js', async () => ({
      data: { user: null, session: null },
      error: { name: 'AuthRetryableFetchError', status: 0, message: 'Failed to fetch' },
    })],
    ['fetch rejeitado', async () => {
      throw new TypeError('Network request failed');
    }],
  ])('sem internet (%s): avisa que o primeiro acesso precisa de internet', async (_caso, signInWithPassword) => {
    const servico = criarServicoSupabase({
      obterCliente: () => clienteFalso({ signInWithPassword }),
      armazenamento: armazenamentoEmMemoria(),
    });
    expect(await servico.entrar('dono@exemplo.com', 'x')).toMatchObject({ ok: false, motivo: 'sem_internet' });
  });

  it('app gerado sem a configuração do Supabase avisa em vez de travar', async () => {
    const servico = criarServicoSupabase({ obterCliente: () => null, armazenamento: armazenamentoEmMemoria() });
    expect(await servico.entrar('a@b.com', 'x')).toMatchObject({ ok: false, motivo: 'app_sem_configuracao' });
    expect(await servico.obterTokenDeAcesso()).toEqual({ situacao: 'sem_configuracao' });
  });

  // CA-01.7.6
  it('usa o token atual quando ainda falta tempo para vencer', async () => {
    const cliente = clienteFalso({
      getSession: async () => ({ data: { session: { access_token: 'token-atual', expires_at: AGORA / 1000 + 3600 } } }),
    });
    const servico = criarServicoSupabase({ obterCliente: () => cliente, armazenamento: armazenamentoEmMemoria(), agora: () => AGORA });
    expect(await servico.obterTokenDeAcesso()).toEqual({ situacao: 'ok', token: 'token-atual' });
    expect(cliente.refreshSession).not.toHaveBeenCalled();
  });

  it('renova sozinho o token perto de vencer, sem pedir login', async () => {
    const cliente = clienteFalso({
      getSession: async () => ({ data: { session: { access_token: 'token-velho', expires_at: AGORA / 1000 + 30 } } }),
    });
    const servico = criarServicoSupabase({ obterCliente: () => cliente, armazenamento: armazenamentoEmMemoria(), agora: () => AGORA });
    expect(await servico.obterTokenDeAcesso()).toEqual({ situacao: 'ok', token: 'token-novo' });
    expect(cliente.refreshSession).toHaveBeenCalledTimes(1);
  });

  it('sem internet para renovar: sem_internet, sem derrubar a sessão local', async () => {
    const armazenamento = armazenamentoEmMemoria();
    const cliente = clienteFalso({
      getSession: async () => ({ data: { session: { access_token: 'velho', expires_at: AGORA / 1000 - 10 } } }),
      refreshSession: async () => {
        throw new TypeError('Network request failed');
      },
    });
    const servico = criarServicoSupabase({ obterCliente: () => cliente, armazenamento, agora: () => AGORA });
    await servico.entrar('dono@exemplo.com', 'x');
    expect(await servico.obterTokenDeAcesso()).toEqual({ situacao: 'sem_internet' });
    expect(await servico.carregar()).not.toBeNull();
  });

  it('sair apaga a sessão local mesmo sem internet', async () => {
    const armazenamento = armazenamentoEmMemoria();
    const cliente = clienteFalso({
      signOut: async () => {
        throw new TypeError('Network request failed');
      },
    });
    const servico = criarServicoSupabase({ obterCliente: () => cliente, armazenamento });
    await servico.entrar('dono@exemplo.com', 'x');
    await servico.sair();
    expect(await servico.carregar()).toBeNull();
  });

  // Sugestão da Arquitetura (passo 5), §4.6
  it('renovação recusada pelo Supabase: sessao_recusada, sessão local mantida', async () => {
    const armazenamento = armazenamentoEmMemoria();
    const cliente = clienteFalso({
      getSession: async () => ({ data: { session: { access_token: 'velho', expires_at: AGORA / 1000 - 10 } } }),
      refreshSession: async () => ({
        data: { session: null },
        error: { name: 'AuthApiError', code: 'refresh_token_not_found', status: 400, message: 'Invalid Refresh Token' },
      }),
    });
    const servico = criarServicoSupabase({ obterCliente: () => cliente, armazenamento, agora: () => AGORA });
    await servico.entrar('dono@exemplo.com', 'x');
    expect(await servico.obterTokenDeAcesso()).toEqual({ situacao: 'sessao_recusada' });
    expect(await servico.carregar()).not.toBeNull();
  });

  it('erro de rede na renovação: sem_internet', async () => {
    const cliente = clienteFalso({
      getSession: async () => ({ data: { session: { access_token: 'velho', expires_at: AGORA / 1000 - 10 } } }),
      refreshSession: async () => ({
        data: { session: null },
        error: { name: 'AuthRetryableFetchError', status: 0, message: 'Failed to fetch' },
      }),
    });
    const servico = criarServicoSupabase({ obterCliente: () => cliente, armazenamento: armazenamentoEmMemoria(), agora: () => AGORA });
    expect(await servico.obterTokenDeAcesso()).toEqual({ situacao: 'sem_internet' });
  });

  it('forcarRenovacao renova mesmo com o token ainda válido', async () => {
    const cliente = clienteFalso({
      getSession: async () => ({ data: { session: { access_token: 'atual', expires_at: AGORA / 1000 + 3600 } } }),
    });
    const servico = criarServicoSupabase({ obterCliente: () => cliente, armazenamento: armazenamentoEmMemoria(), agora: () => AGORA });
    expect(await servico.obterTokenDeAcesso({ forcarRenovacao: true })).toEqual({ situacao: 'ok', token: 'token-novo' });
  });
});
