import { type JWTVerifyGetKey, createRemoteJWKSet, errors, jwtVerify } from 'jose';
import { ErroDeAutenticacao } from '../../../compartilhado/dominio/erros';
import { VerificadorDeToken } from '../aplicacao/portas';

/**
 * Valida o JWT do Supabase Auth com as chaves públicas do projeto (JWKS em
 * `<SUPABASE_URL>/auth/v1/.well-known/jwks.json`): assinatura, validade, emissor e público
 * `authenticated`. O mesmo token serve para o PowerSync (CA-01.7.6, CA-07.10.5).
 *
 * [SUPOSIÇÃO] O projeto usa as chaves assimétricas de assinatura do Supabase (padrão dos
 * projetos novos). Um projeto antigo, com segredo compartilhado (HS256), precisa migrar para
 * "JWT Signing Keys" no painel — ver docs/dev/setup.md.
 */
export class VerificadorJwtSupabase extends VerificadorDeToken {
  private readonly emissor: string;
  private readonly chaves: JWTVerifyGetKey;

  constructor(supabaseUrl: string, chaves?: JWTVerifyGetKey) {
    super();
    const base = supabaseUrl.replace(/\/+$/, '');
    this.emissor = `${base}/auth/v1`;
    this.chaves = chaves ?? createRemoteJWKSet(new URL(`${this.emissor}/.well-known/jwks.json`));
  }

  async verificar(token: string): Promise<{ usuarioId: string }> {
    try {
      const { payload } = await jwtVerify(token, this.chaves, {
        issuer: this.emissor,
        audience: 'authenticated',
      });
      if (!payload.sub) throw new ErroDeAutenticacao('token_invalido', 'Sessão inválida. Entre de novo.');
      return { usuarioId: payload.sub };
    } catch (erro) {
      if (erro instanceof ErroDeAutenticacao) throw erro;
      if (erro instanceof errors.JWTExpired) {
        throw new ErroDeAutenticacao('token_vencido', 'Sua sessão expirou. Entre de novo.');
      }
      throw new ErroDeAutenticacao('token_invalido', 'Sessão inválida. Entre de novo.');
    }
  }
}
