/**
 * Sessão do dono no aparelho (FIN-US-01.7).
 *
 * Há duas coisas diferentes:
 * - a **sessão local**: "este aparelho já entrou com a conta X". Ela decide se o app abre
 *   direto na Início e não depende de internet nem da validade do token (CA-01.7.4, RNF-04);
 * - o **token** (JWT do Supabase Auth): só serve para falar com a nuvem (API NestJS e
 *   PowerSync) e é renovado sozinho quando há internet (CA-01.7.6).
 *
 * Sem autocadastro (ST-07): só existe "entrar"; a conta é criada pela equipe.
 */

export type SessaoLocal = {
  usuarioId: string;
  email: string;
  /** ISO 8601, momento do login neste aparelho. */
  entrouEm: string;
};

export type MotivoFalhaAoEntrar = 'credenciais_invalidas' | 'sem_internet' | 'app_sem_configuracao' | 'desconhecido';

export type ResultadoAoEntrar =
  | { ok: true; sessao: SessaoLocal }
  | { ok: false; motivo: MotivoFalhaAoEntrar; mensagem: string };

/**
 * Resultado de pedir o token para falar com a nuvem (§4.6, sugestão da Arquitetura no passo 5):
 * - `ok`: token válido (renovado antes de vencer, se preciso);
 * - `sem_internet`: não deu para falar com o Supabase — tenta depois, nada muda;
 * - `sessao_recusada`: o Supabase RECUSOU a sessão (renovação negada, conta desativada):
 *   o app pede para entrar de novo, SEM apagar a fila nem os dados do celular;
 * - `sem_configuracao`: app gerado sem a URL/chave do Supabase.
 */
export type ResultadoDoToken =
  | { situacao: 'ok'; token: string }
  | { situacao: 'sem_internet' }
  | { situacao: 'sessao_recusada' }
  | { situacao: 'sem_configuracao' };

export interface ServicoDeSessao {
  /** Lê a sessão local guardada no aparelho (funciona sem internet). */
  carregar(): Promise<SessaoLocal | null>;
  entrar(email: string, senha: string): Promise<ResultadoAoEntrar>;
  /**
   * Token para chamar a API NestJS e o PowerSync. Renova antes de vencer, ou sempre que
   * `forcarRenovacao` (ex.: a API respondeu 401).
   */
  obterTokenDeAcesso(opcoes?: { forcarRenovacao?: boolean }): Promise<ResultadoDoToken>;
  /**
   * Sai da conta neste aparelho: apaga a sessão local e encerra a sessão na nuvem se houver
   * internet. A conferência de lançamentos pendentes e a limpeza do banco local são a
   * FIN-US-09.1.
   */
  sair(): Promise<void>;
}

/** Mensagens em linguagem simples (02-design §5.1 e §5.6). */
export const MENSAGENS_AO_ENTRAR: Record<MotivoFalhaAoEntrar, string> = {
  credenciais_invalidas: 'E-mail ou senha incorretos. Confira e tente de novo.',
  sem_internet: 'Sem internet. O primeiro acesso precisa de internet; conecte-se e tente de novo.',
  app_sem_configuracao: 'O app ainda não está ligado ao servidor. Avise a equipe.',
  desconhecido: 'Não foi possível entrar agora. Tente de novo em instantes.',
};
