import type { PGlite } from '@electric-sql/pglite';
import { sql } from 'kysely';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { EventoDeDominio } from '../src/compartilhado/dominio/evento-de-dominio';
import type { ConexaoBanco } from '../src/compartilhado/infraestrutura/banco/conexao';
import { UnidadeDeTrabalhoPostgres } from '../src/compartilhado/infraestrutura/banco/unidade-de-trabalho-postgres';
import { BarramentoEmMemoria } from '../src/compartilhado/infraestrutura/eventos/barramento-em-memoria';
import { criarConexaoDeTeste } from './apoio/conexao-pglite';

class AlgoAconteceu extends EventoDeDominio {
  readonly nome = 'teste.algo_aconteceu';
  constructor() {
    super();
  }
}

describe('unidade de trabalho (Postgres)', () => {
  let conexao: ConexaoBanco;
  let pglite: PGlite;
  let barramento: BarramentoEmMemoria;
  let uow: UnidadeDeTrabalhoPostgres;
  let recebidos: string[];

  beforeAll(async () => {
    ({ conexao, pglite } = await criarConexaoDeTeste());
    await pglite.exec('create table registro (id int primary key, texto text not null)');
  });

  afterAll(async () => {
    await pglite.close();
  });

  beforeEach(async () => {
    await pglite.exec('delete from registro');
    barramento = new BarramentoEmMemoria();
    recebidos = [];
    barramento.assinar('teste.algo_aconteceu', (evento) => {
      recebidos.push(evento.nome);
    });
    uow = new UnidadeDeTrabalhoPostgres(conexao, barramento);
  });

  async function gravar(id: number, texto: string | null): Promise<void> {
    await sql`insert into registro (id, texto) values (${id}, ${texto})`.execute(uow.banco());
  }

  async function quantos(): Promise<number> {
    const { rows } = await pglite.query<{ n: number }>('select count(*)::int as n from registro');
    return rows[0].n;
  }

  // CA-01.12.4
  it('desfaz as duas gravações quando a segunda falha', async () => {
    await expect(
      uow.executar(async () => {
        await gravar(1, 'primeira');
        await gravar(2, null); // viola not null
      }),
    ).rejects.toThrow();
    expect(await quantos()).toBe(0);
  });

  it('grava tudo quando nada falha', async () => {
    await uow.executar(async () => {
      await gravar(1, 'primeira');
      await gravar(2, 'segunda');
    });
    expect(await quantos()).toBe(2);
  });

  it('despacha os eventos só depois do commit', async () => {
    await uow.executar(async () => {
      await gravar(1, 'x');
      uow.registrarEventos([new AlgoAconteceu()]);
      expect(recebidos).toEqual([]); // ainda dentro da transação
    });
    expect(recebidos).toEqual(['teste.algo_aconteceu']);
  });

  it('não despacha eventos quando a transação é desfeita', async () => {
    await expect(
      uow.executar(async () => {
        uow.registrarEventos([new AlgoAconteceu()]);
        await gravar(1, null);
      }),
    ).rejects.toThrow();
    expect(recebidos).toEqual([]);
  });

  it('uma unidade de trabalho dentro de outra participa da mesma transação', async () => {
    await expect(
      uow.executar(async () => {
        await uow.executar(() => gravar(1, 'interna'));
        await gravar(2, null);
      }),
    ).rejects.toThrow();
    expect(await quantos()).toBe(0);
  });
});
