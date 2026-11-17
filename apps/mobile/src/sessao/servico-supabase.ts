import {
  MENSAGENS_AO_ENTRAR,
  type MotivoFalhaAoEntrar,
  type ResultadoAoEntrar,
  type ResultadoDoToken,
  type ServicoDeSessao,
  type SessaoLocal,
} from './servico-de-sessao';

type ErroDoSupabase = { name?: string; code?: string; status?: number; message: string };

/** Parte do cliente de autenticação do Supabase que o app usa (facilita testar sem rede). */
export interface ClienteDeAutenticacao {
  signInWithPassword(credenciais: { email: string; password: string }): Promise<{
    data: { user: { id: string; email?: string } | null; session: unknown };
    error: { name?: string; code?: string; status?: number; message: string } | null;
  }>;
  getSession(): Promise<{
    data: { session: { access_token: string; expires_at?: number } | null };
    error?: ErroDoSupabase | null;
  }>;
  refreshSession(): Promise<{ data: { session: { access_token: string } | null }; error?: ErroDoSupabase | null }>;
  signOut(opcoes: { scope: 'local' }): Promise<unknown>;
}

/** Armazenamento chave → texto (AsyncStorage no app, memória nos testes). */
export interface Armazenamento {
  getItem(chave: string): Promise<string | null>;
  setItem(chave: string, valor: string): Promise<void>;
  removeItem(chave: string): Promise<void>;
}

export const CHAVE_SESSAO_LOCAL = 'lavajato.sessao-local';

/** Renova o token quando falta menos que isso para vencer. */
export const MARGEM_DE_RENOVACAO_MS = 60_000;

type Dependencias = {
  /** `null` quando o app foi gerado sem a URL/chave do Supabase. */
  obterCliente: () => ClienteDeAutenticacao | null;
  armazenamento: Armazenamento;
  agora?: () => number;
};

function motivoDoErro(erro: { name?: string; code?: string; status?: number }): MotivoFalhaAoEntrar {
  if (erro.code === 'invalid_credentials' || erro.status === 400) return 'credenciais_invalidas';
  // Falha de rede: o supabase-js usa AuthRetryableFetchError (status 0 ou 5xx).
  if (erro.name === 'AuthRetryableFetchError' || erro.status === 0) return 'sem_internet';
  return 'desconhecido';
}

/** Falha de rede (vale tentar de novo) × recusa do Supabase (precisa entrar de novo). */
function ehFalhaDeRede(erro: ErroDoSupabase): boolean {
  return erro.name === 'AuthRetryableFetchError' || erro.status === 0 || (erro.status ?? 0) >= 500;
}

function situacaoDoErro(erro: ErroDoSupabase): ResultadoDoToken {
  return ehFalhaDeRede(erro) ? { situacao: 'sem_internet' } : { situacao: 'sessao_recusada' };
}

function falha(motivo: MotivoFalhaAoEntrar): ResultadoAoEntrar {
  return { ok: false, motivo, mensagem: MENSAGENS_AO_ENTRAR[motivo] };
}

export function criarServicoSupabase({ obterCliente, armazenamento, agora = Date.now }: Dependencias): ServicoDeSessao {
  return {
    async carregar() {
      const texto = await armazenamento.getItem(CHAVE_SESSAO_LOCAL);
      if (!texto) return null;
      try {
        return JSON.parse(texto) as SessaoLocal;
      } catch {
        return null;
      }
    },

    async entrar(email, senha) {
      const cliente = obterCliente();
      if (!cliente) return falha('app_sem_configuracao');
      let resposta: Awaited<ReturnType<ClienteDeAutenticacao['signInWithPassword']>>;
      try {
        resposta = await cliente.signInWithPassword({ email: email.trim(), password: senha });
      } catch {
        // fetch rejeitado antes de chegar ao Supabase: sem rede.
        return falha('sem_internet');
      }
      if (resposta.error || !resposta.data.user) {
        return falha(resposta.error ? motivoDoErro(resposta.error) : 'desconhecido');
      }
      const sessao: SessaoLocal = {
        usuarioId: resposta.data.user.id,
        email: resposta.data.user.email ?? email.trim(),
        entrouEm: new Date(agora()).toISOString(),
      };
      await armazenamento.setItem(CHAVE_SESSAO_LOCAL, JSON.stringify(sessao));
      return { ok: true, sessao };
    },

    async obterTokenDeAcesso(opcoes = {}) {
      const cliente = obterCliente();
      if (!cliente) return { situacao: 'sem_configuracao' };
      try {
        const { data, error } = await cliente.getSession();
        if (error) return situacaoDoErro(error);
        const sessao = data.session;
        // Sem sessão guardada no aparelho para a nuvem: precisa entrar de novo.
        if (!sessao) return { situacao: 'sessao_recusada' };
        const venceEmMs = (sessao.expires_at ?? 0) * 1000;
        if (!opcoes.forcarRenovacao && venceEmMs - agora() > MARGEM_DE_RENOVACAO_MS) {
          return { situacao: 'ok', token: sessao.access_token };
        }
        const renovada = await cliente.refreshSession();
        if (renovada.error) return situacaoDoErro(renovada.error);
        const token = renovada.data.session?.access_token;
        return token ? { situacao: 'ok', token } : { situacao: 'sessao_recusada' };
      } catch {
        // fetch rejeitado antes de chegar ao Supabase.
        return { situacao: 'sem_internet' };
      }
    },

    async sair() {
      await armazenamento.removeItem(CHAVE_SESSAO_LOCAL);
      try {
        // "local": encerra só neste aparelho, sem precisar de internet.
        await obterCliente()?.signOut({ scope: 'local' });
      } catch {
        // Sem internet ou sem cliente: a sessão local já foi apagada.
      }
    },
  };
}
