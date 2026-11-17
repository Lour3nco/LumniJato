import type { ResultadoAoEntrar, ResultadoDoToken, ServicoDeSessao, SessaoLocal } from '../../sessao/servico-de-sessao';

export const SESSAO_DO_DONO: SessaoLocal = {
  usuarioId: '00000000-0000-7000-8000-000000000010',
  email: 'dono@exemplo.com',
  entrouEm: '2026-11-04T12:00:00.000Z',
};

/** Serviço de sessão controlável pelos testes (sem rede nem Supabase). */
export function criarSessaoFalsa(inicial: SessaoLocal | null = null) {
  const estado = {
    guardada: inicial,
    proximoResultado: { ok: true, sessao: SESSAO_DO_DONO } as ResultadoAoEntrar,
    tentativas: [] as { email: string; senha: string }[],
    token: { situacao: 'sem_internet' } as ResultadoDoToken,
  };
  const servico: ServicoDeSessao = {
    carregar: async () => estado.guardada,
    entrar: async (email, senha) => {
      estado.tentativas.push({ email, senha });
      if (estado.proximoResultado.ok) estado.guardada = estado.proximoResultado.sessao;
      return estado.proximoResultado;
    },
    obterTokenDeAcesso: async () => estado.token,
    sair: async () => {
      estado.guardada = null;
    },
  };
  return { servico, estado };
}
