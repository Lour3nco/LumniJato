import { type JWTVerifyGetKey, SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from 'jose';

export const SUPABASE_URL_DE_TESTE = 'https://projeto-de-teste.supabase.co';
const EMISSOR = `${SUPABASE_URL_DE_TESTE}/auth/v1`;

/**
 * Emissor de tokens de teste no formato do Supabase Auth (ES256, emissor .../auth/v1, público
 * "authenticated"), com as chaves públicas num JWKS local — sem rede nem conta no Supabase.
 */
export async function criarEmissorDeTokens() {
  const { privateKey, publicKey } = await generateKeyPair('ES256');
  const outro = await generateKeyPair('ES256');
  const jwk = { ...(await exportJWK(publicKey)), kid: 'chave-teste', alg: 'ES256' };
  const chaves: JWTVerifyGetKey = createLocalJWKSet({ keys: [jwk] });

  async function assinar(
    usuarioId: string,
    opcoes: { expiraEm?: string | number; chave?: CryptoKey; emissor?: string } = {},
  ): Promise<string> {
    return new SignJWT({ role: 'authenticated' })
      .setProtectedHeader({ alg: 'ES256', kid: 'chave-teste' })
      .setSubject(usuarioId)
      .setIssuer(opcoes.emissor ?? EMISSOR)
      .setAudience('authenticated')
      .setIssuedAt()
      .setExpirationTime(opcoes.expiraEm ?? '1h')
      .sign(opcoes.chave ?? privateKey);
  }

  return { chaves, assinar, chaveDeOutroProjeto: outro.privateKey };
}
