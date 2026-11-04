import type { PGlite } from '@electric-sql/pglite';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { CONFIGURACAO } from '../src/compartilhado/compartilhado.module';
import { ErroDeAutorizacao } from '../src/compartilhado/dominio/erros';
import { CONEXAO_BANCO } from '../src/compartilhado/infraestrutura/banco/conexao';
import { UnidadeDeTrabalhoPostgres } from '../src/compartilhado/infraestrutura/banco/unidade-de-trabalho-postgres';
import { VerificadorDeToken } from '../src/modulos/identidade-acesso/aplicacao/portas';
import { RegistrarDispositivo } from '../src/modulos/identidade-acesso/aplicacao/registrar-dispositivo';
import { UsuarioAutenticado } from '../src/modulos/identidade-acesso/dominio/usuario-autenticado';
import { VerificadorJwtSupabase } from '../src/modulos/identidade-acesso/infraestrutura/verificador-jwt-supabase';
import { criarBancoMigrado } from './apoio/banco-migrado';
import { criarConexaoDeTeste } from './apoio/conexao-pglite';
import { SUPABASE_URL_DE_TESTE, criarEmissorDeTokens } from './apoio/tokens';

/**
 * FIN-US-01.13 · Identidade e Acesso, de ponta a ponta: API NestJS de verdade, banco com as
 * migrações reais (PGlite) e tokens no formato do Supabase Auth.
 *
 * Cenário: dois donos em organizações diferentes — A só na U1, B só na U2. A também tem um
 * vínculo DESATIVADO na U3.
 */
const A = '0192f0c1-0000-7000-8000-00000000000a';
const B = '0192f0c1-0000-7000-8000-00000000000b';
const SEM_PERFIL = '0192f0c1-0000-7000-8000-00000000000c';

describe('Identidade e Acesso (FIN-US-01.13)', () => {
  let app: INestApplication;
  let pglite: PGlite;
  let tokens: Awaited<ReturnType<typeof criarEmissorDeTokens>>;
  let u1: string;
  let u2: string;
  let u3: string;

  beforeAll(async () => {
    pglite = await criarBancoMigrado();
    await pglite.query(`select identidade.implantar('Lava-jato A', array['Centro A', 'Inativa A'], $1, 'Dono A', 'a@exemplo.com')`, [A]);
    await pglite.query(`select identidade.implantar('Lava-jato B', array['Centro B'], $1, 'Dono B', 'b@exemplo.com')`, [B]);
    const unidades = await pglite.query<{ id: string; nome: string }>('select id, nome from identidade.unidade');
    const porNome = Object.fromEntries(unidades.rows.map((u) => [u.nome, u.id]));
    [u1, u2, u3] = [porNome['Centro A'], porNome['Centro B'], porNome['Inativa A']];
    await pglite.query('update identidade.usuario_unidade set ativo = false where unidade_id = $1', [u3]);

    tokens = await criarEmissorDeTokens();
    const { conexao } = await criarConexaoDeTeste(pglite);
    const modulo = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CONFIGURACAO)
      .useValue({ PORTA: 3000, DATABASE_URL: 'postgresql://teste@localhost/teste', SUPABASE_URL: SUPABASE_URL_DE_TESTE })
      .overrideProvider(CONEXAO_BANCO)
      .useValue(conexao)
      .overrideProvider(VerificadorDeToken)
      .useValue(new VerificadorJwtSupabase(SUPABASE_URL_DE_TESTE, tokens.chaves))
      .compile();
    app = modulo.createNestApplication({ logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await pglite.close();
  });

  const http = () => request(app.getHttpServer());

  // CA-01.13.1
  describe('guarda global', () => {
    it('a rota de saúde continua pública', async () => {
      await http().get('/saude').expect(200);
    });

    it('sem token → 401', async () => {
      const resposta = await http().get('/eu').expect(401);
      expect(resposta.body.codigo).toBe('nao_autenticado');
    });

    it('token vencido → 401', async () => {
      const vencido = await tokens.assinar(A, { expiraEm: Math.floor(Date.now() / 1000) - 60 });
      const resposta = await http().get('/eu').auth(vencido, { type: 'bearer' }).expect(401);
      expect(resposta.body.codigo).toBe('token_vencido');
    });

    it('assinatura de outra chave → 401', async () => {
      const falso = await tokens.assinar(A, { chave: tokens.chaveDeOutroProjeto });
      await http().get('/eu').auth(falso, { type: 'bearer' }).expect(401);
    });

    it('token de outro projeto Supabase (emissor diferente) → 401', async () => {
      const outro = await tokens.assinar(A, { emissor: 'https://outro.supabase.co/auth/v1' });
      await http().get('/eu').auth(outro, { type: 'bearer' }).expect(401);
    });

    it('token válido de quem não tem perfil → 403', async () => {
      const token = await tokens.assinar(SEM_PERFIL);
      await http().get('/eu').auth(token, { type: 'bearer' }).expect(403);
    });
  });

  // CA-01.13.2 e CA-01.13.4
  it('carrega o usuário e só os vínculos ativos', async () => {
    const token = await tokens.assinar(A);
    const resposta = await http().get('/eu').auth(token, { type: 'bearer' }).expect(200);
    expect(resposta.body).toEqual({
      id: A,
      nome: 'Dono A',
      email: 'a@exemplo.com',
      unidades: [{ id: u1, nome: 'Centro A', papel: 'dono' }],
    });
  });

  it('vínculo desativado → 403 na unidade', async () => {
    const token = await tokens.assinar(A);
    await http().get(`/unidades/${u3}`).auth(token, { type: 'bearer' }).expect(403);
  });

  // CA-01.13.7 (isolamento pela API; os lançamentos entram com a FIN-US-01.15 e 07.11)
  describe('dois usuários de unidades diferentes', () => {
    it('cada um vê a própria unidade', async () => {
      await http().get(`/unidades/${u1}`).auth(await tokens.assinar(A), { type: 'bearer' }).expect(200);
      await http().get(`/unidades/${u2}`).auth(await tokens.assinar(B), { type: 'bearer' }).expect(200);
    });

    it('nenhum lê a unidade do outro', async () => {
      await http().get(`/unidades/${u2}`).auth(await tokens.assinar(A), { type: 'bearer' }).expect(403);
      await http().get(`/unidades/${u1}`).auth(await tokens.assinar(B), { type: 'bearer' }).expect(403);
    });

    it('o /eu de um não mostra nada do outro', async () => {
      const resposta = await http().get('/eu').auth(await tokens.assinar(B), { type: 'bearer' }).expect(200);
      expect(JSON.stringify(resposta.body)).not.toContain(u1);
      expect(resposta.body.unidades).toEqual([{ id: u2, nome: 'Centro B', papel: 'dono' }]);
    });
  });

  // CA-01.13.6
  describe('registro do dispositivo', () => {
    const APARELHO = '0192f0c1-0000-7000-8000-0000000000d1';
    const usuarioA = new UsuarioAutenticado(A, 'Dono A', null, []);
    const usuarioB = new UsuarioAutenticado(B, 'Dono B', null, []);

    async function registrar(usuario: UsuarioAutenticado) {
      const uow = app.get(UnidadeDeTrabalhoPostgres);
      return uow.executar(() => app.get(RegistrarDispositivo).executar(usuario, { id: APARELHO, nome: 'Celular' }));
    }

    it('registra uma vez, ligado ao usuário do token, sem duplicar', async () => {
      await registrar(usuarioA);
      await registrar(usuarioA);
      const { rows } = await pglite.query<{ usuario_id: string; ultima_sincronizacao_em: Date | null }>(
        'select usuario_id, ultima_sincronizacao_em from identidade.dispositivo where id = $1',
        [APARELHO],
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].usuario_id).toBe(A);
      expect(rows[0].ultima_sincronizacao_em).not.toBeNull();
    });

    it('o aparelho de A não pode ser tomado por B', async () => {
      await expect(registrar(usuarioB)).rejects.toBeInstanceOf(ErroDeAutorizacao);
    });
  });
});
