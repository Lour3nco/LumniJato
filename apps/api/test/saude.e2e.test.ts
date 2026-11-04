import type { PGlite } from '@electric-sql/pglite';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { CONFIGURACAO } from '../src/compartilhado/compartilhado.module';
import { CONEXAO_BANCO, type ConexaoBanco } from '../src/compartilhado/infraestrutura/banco/conexao';
import { criarConexaoDeTeste } from './apoio/conexao-pglite';

async function subirApi(conexao: ConexaoBanco): Promise<INestApplication> {
  const modulo = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(CONFIGURACAO)
    .useValue({
      PORTA: 3000,
      DATABASE_URL: 'postgresql://teste@localhost/teste',
      SUPABASE_URL: 'https://projeto-de-teste.supabase.co',
    })
    .overrideProvider(CONEXAO_BANCO)
    .useValue(conexao)
    .compile();
  const app = modulo.createNestApplication({ logger: false });
  await app.init();
  return app;
}

// CA-01.12.1
describe('rota de saúde', () => {
  let app: INestApplication | undefined;
  let pglite: PGlite | undefined;

  afterEach(async () => {
    await app?.close();
    await pglite?.close().catch(() => undefined);
  });

  it('GET /saude responde sem token, com o banco ok', async () => {
    const teste = await criarConexaoDeTeste();
    pglite = teste.pglite;
    app = await subirApi(teste.conexao);
    await request(app.getHttpServer()).get('/saude').expect(200, { status: 'ok', banco: 'ok' });
  });

  it('continua respondendo e informa quando o banco está fora', async () => {
    const teste = await criarConexaoDeTeste();
    await teste.pglite.close(); // banco "cai"
    app = await subirApi(teste.conexao);
    await request(app.getHttpServer()).get('/saude').expect(200, { status: 'ok', banco: 'indisponivel' });
  });

  it('rota inexistente responde 404 em português', async () => {
    const teste = await criarConexaoDeTeste();
    pglite = teste.pglite;
    app = await subirApi(teste.conexao);
    await request(app.getHttpServer())
      .get('/nao-existe')
      .expect(404, { codigo: 'nao_encontrado', mensagem: 'Endereço não encontrado.' });
  });
});
