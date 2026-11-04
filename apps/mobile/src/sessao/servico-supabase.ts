import {
  MENSAGENS_AO_ENTRAR,
  type MotivoFalhaAoEntrar,
  type ResultadoAoEntrar,
  type ServicoDeSessao,
  type SessaoLocal,
} from './servico-de-sessao';

/** Parte do cliente de autenticação do Supabase que o app usa (facilita testar sem rede). */
export interface ClienteDeAutenticacao {
  signInWithPassword(credenciais: { email: string; password: string }): Promise<{
    data: { user: { id: string; email?: string } | null; session: unknown };
    error: { name?: string; code?: string; status?: number; message: string } | null;
  }>;
  getSession(): Promise<{ data: { session: { access_token: string; expires_at?: number } | null } }>;
  refreshSession(): Promise<{ data: { session: { access_token: string } | null } }>;
}

/** Armazenamento chave → texto (AsyncStorage no app, memória nos testes). */
export interface Armazenamento {
  getItem(chave: string): Promise<string | null>;
  setItem(chave: string, valor: string): Promise<void>;
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

    async obterTokenDeAcesso() {
      const cliente = obterCliente();
      if (!cliente) return null;
      try {
        const { data } = await cliente.getSession();
        const sessao = data.session;
        if (!sessao) return null;
        const venceEmMs = (sessao.expires_at ?? 0) * 1000;
        if (venceEmMs - agora() > MARGEM_DE_RENOVACAO_MS) return sessao.access_token;
        const renovada = await cliente.refreshSession();
        return renovada.data.session?.access_token ?? null;
      } catch {
        return null;
      }
    },
  };
}
