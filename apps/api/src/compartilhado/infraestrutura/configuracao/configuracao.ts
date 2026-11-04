import { z } from 'zod';

/**
 * Configuração por variáveis de ambiente (CA-01.12.5). Os valores vêm do `.env` (fora do git)
 * ou das variáveis da hospedagem; o `.env.example` lista os nomes sem valores.
 */

/** Usuários do Postgres com poder de administrador: a API nunca usa esses na nuvem (CA-01.12.6). */
const USUARIOS_ADMIN = ['postgres', 'supabase_admin', 'service_role'];
const HOSTS_LOCAIS = ['localhost', '127.0.0.1', '::1', '[::1]'];

const esquema = z.object({
  PORTA: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z
    .string({ error: 'obrigatória' })
    .min(1, 'obrigatória')
    .refine((valor) => /^postgres(ql)?:\/\//.test(valor), 'precisa começar com postgresql://'),
  // Validação do JWT do Supabase Auth: passa a ser obrigatória na FIN-US-01.13.
  SUPABASE_URL: z.url('precisa ser uma URL').optional(),
});

export type Configuracao = z.infer<typeof esquema>;

export class ErroDeConfiguracao extends Error {
  constructor(readonly problemas: string[]) {
    super(`Configuração inválida:\n${problemas.map((p) => `  - ${p}`).join('\n')}`);
    this.name = 'ErroDeConfiguracao';
  }
}

/**
 * Lê e valida as variáveis. Lança `ErroDeConfiguracao` dizendo qual variável falta ou está
 * errada, sem nunca mostrar o valor (que pode ter senha).
 */
export function carregarConfiguracao(ambiente: NodeJS.ProcessEnv = process.env): Configuracao {
  const vazioComoAusente = Object.fromEntries(
    Object.entries(ambiente).filter(([, valor]) => valor !== undefined && valor !== ''),
  );
  const resultado = esquema.safeParse(vazioComoAusente);
  if (!resultado.success) {
    throw new ErroDeConfiguracao(resultado.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`));
  }
  const problemaDeUsuario = conferirUsuarioDoBanco(resultado.data.DATABASE_URL);
  if (problemaDeUsuario) throw new ErroDeConfiguracao([problemaDeUsuario]);
  return resultado.data;
}

/**
 * CA-01.12.6: fora do computador do desenvolvedor, a API conecta com o papel próprio
 * `api_lavajato` (criado na FIN-US-01.4), nunca com `postgres` nem com a service_role.
 * No Supabase local (localhost) o `postgres` é aceito, porque é só para desenvolvimento.
 */
function conferirUsuarioDoBanco(url: string): string | undefined {
  let endereco: URL;
  try {
    endereco = new URL(url);
  } catch {
    return 'DATABASE_URL: endereço inválido';
  }
  const usuario = decodeURIComponent(endereco.username).split('.')[0]; // pooler usa "usuario.<ref>"
  const ehAdmin = USUARIOS_ADMIN.includes(usuario);
  const ehLocal = HOSTS_LOCAIS.includes(endereco.hostname);
  if (ehAdmin && !ehLocal) {
    return `DATABASE_URL: use o papel api_lavajato; o usuário "${usuario}" é administrador e não pode ser usado pela API`;
  }
  return undefined;
}
