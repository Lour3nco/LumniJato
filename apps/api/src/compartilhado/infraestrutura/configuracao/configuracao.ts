import { z } from 'zod';

/**
 * Configuração por variáveis de ambiente (CA-01.12.5). Os valores vêm do `.env` (fora do git)
 * ou das variáveis da hospedagem; o `.env.example` lista os nomes sem valores.
 */

/** Único usuário do Postgres que a API pode usar fora da máquina local (CA-01.12.6, FIN-US-01.4). */
export const USUARIO_DA_API = 'api_lavajato';
const HOSTS_LOCAIS = ['localhost', '127.0.0.1', '::1', '[::1]'];

const esquema = z.object({
  PORTA: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z
    .string({ error: 'obrigatória' })
    .min(1, 'obrigatória')
    .refine((valor) => /^postgres(ql)?:\/\//.test(valor), 'precisa começar com postgresql://'),
  // URL do projeto Supabase: de onde vêm as chaves públicas que validam o JWT (FIN-US-01.13).
  SUPABASE_URL: z.url({ error: 'obrigatória (URL do projeto Supabase)' }),
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
 * Lista permitida (CA-01.12.6): fora do computador do desenvolvedor, a API conecta SÓ com o
 * papel `api_lavajato` — nunca `postgres`, `service_role` ou qualquer outro. No Supabase local
 * (localhost) qualquer usuário é aceito, porque é só para desenvolvimento.
 */
function conferirUsuarioDoBanco(url: string): string | undefined {
  let endereco: URL;
  try {
    endereco = new URL(url);
  } catch {
    return 'DATABASE_URL: endereço inválido';
  }
  if (HOSTS_LOCAIS.includes(endereco.hostname)) return undefined;
  // O pooler do Supabase (Supavisor) usa "usuario.<ref-do-projeto>".
  const usuario = decodeURIComponent(endereco.username).split('.')[0];
  if (usuario !== USUARIO_DA_API) {
    return `DATABASE_URL: fora da máquina local a API só conecta com o papel ${USUARIO_DA_API} (recebido: "${usuario || '(vazio)'}")`;
  }
  return undefined;
}
