import { Body, Controller, Get, type INestApplication, Post } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ErroDeAutorizacao, ErroDeConflito, ErroDeDominio } from '../src/compartilhado/dominio/erros';
import { FiltroDeErros } from '../src/compartilhado/interface/filtro-de-erros';
import { ValidacaoZod } from '../src/compartilhado/interface/validacao-zod.pipe';

const esquemaDeExemplo = z.object({
  valor_centavos: z.number().int().positive(),
  descricao: z.string().max(200).optional(),
});

let chegouNoControlador = 0;

/** Controlador só de teste, para exercitar a validação e o mapeamento de erros. */
@Controller('exemplo')
class ExemploController {
  @Post()
  criar(@Body(new ValidacaoZod(esquemaDeExemplo)) corpo: z.infer<typeof esquemaDeExemplo>) {
    chegouNoControlador += 1;
    return corpo;
  }

  @Get('dominio')
  dominio(): never {
    throw new ErroDeDominio('valor_zero', 'O valor precisa ser maior que zero.');
  }

  @Get('autorizacao')
  autorizacao(): never {
    throw new ErroDeAutorizacao();
  }

  @Get('conflito')
  conflito(): never {
    throw new ErroDeConflito('versao_desatualizada', 'Este lançamento mudou. Atualize e tente de novo.');
  }

  @Get('inesperado')
  inesperado(): never {
    throw new Error('select * from financas.lancamento -- detalhe interno');
  }
}

describe('erros e validação na API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({
      controllers: [ExemploController],
      providers: [{ provide: APP_FILTER, useClass: FiltroDeErros }],
    }).compile();
    app = modulo.createNestApplication({ logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // CA-01.12.2
  it('recusa corpo fora do esquema antes do controlador, com o campo e o motivo', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/exemplo')
      .send({ valor_centavos: 'trinta', descricao: 5 })
      .expect(400);
    expect(resposta.body.codigo).toBe('entrada_invalida');
    expect(resposta.body.campos.map((c: { campo: string }) => c.campo).sort()).toEqual(['descricao', 'valor_centavos']);
    expect(chegouNoControlador).toBe(0);
  });

  it('recusa campo obrigatório faltando', async () => {
    const resposta = await request(app.getHttpServer()).post('/exemplo').send({}).expect(400);
    expect(resposta.body.campos[0].campo).toBe('valor_centavos');
  });

  it('deixa passar o corpo válido', async () => {
    await request(app.getHttpServer()).post('/exemplo').send({ valor_centavos: 3550 }).expect(201);
    expect(chegouNoControlador).toBe(1);
  });

  // CA-01.12.3
  it.each([
    ['dominio', 422, 'valor_zero'],
    ['autorizacao', 403, 'sem_permissao'],
    ['conflito', 409, 'versao_desatualizada'],
  ])('erro de %s vira %i com código e mensagem simples', async (rota, status, codigo) => {
    const resposta = await request(app.getHttpServer()).get(`/exemplo/${rota}`).expect(status);
    expect(resposta.body).toEqual({ codigo, mensagem: expect.any(String) });
  });

  it('erro inesperado vira 500 genérico, sem pilha nem SQL', async () => {
    const resposta = await request(app.getHttpServer()).get('/exemplo/inesperado').expect(500);
    expect(resposta.body).toEqual({
      codigo: 'erro_interno',
      mensagem: 'Algo deu errado no servidor. Tente de novo mais tarde.',
    });
    expect(JSON.stringify(resposta.body)).not.toMatch(/select|stack|at /i);
  });
});
