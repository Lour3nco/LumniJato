import { Injectable, Logger } from '@nestjs/common';
import { BarramentoDeEventos, type ManipuladorDeEvento } from '../../aplicacao/barramento-de-eventos';
import type { EventoDeDominio } from '../../dominio/evento-de-dominio';

/** Barramento de eventos em memória (MVP). */
@Injectable()
export class BarramentoEmMemoria extends BarramentoDeEventos {
  private readonly log = new Logger('BarramentoDeEventos');
  private readonly depoisDoCommit = new Map<string, ManipuladorDeEvento[]>();
  private readonly naTransacao = new Map<string, ManipuladorDeEvento[]>();

  assinar(nomeDoEvento: string, manipulador: ManipuladorDeEvento): void {
    adicionar(this.depoisDoCommit, nomeDoEvento, manipulador);
  }

  assinarNaTransacao(nomeDoEvento: string, manipulador: ManipuladorDeEvento): void {
    adicionar(this.naTransacao, nomeDoEvento, manipulador);
  }

  /** Erros sobem: quem chama (a unidade de trabalho) desfaz a transação. */
  async publicarNaTransacao(eventos: readonly EventoDeDominio[]): Promise<void> {
    for (const evento of eventos) {
      for (const manipulador of this.naTransacao.get(evento.nome) ?? []) {
        await manipulador(evento);
      }
    }
  }

  /** O dado já foi gravado: uma falha aqui só vai para o log e não impede os outros. */
  async publicar(eventos: readonly EventoDeDominio[]): Promise<void> {
    for (const evento of eventos) {
      for (const manipulador of this.depoisDoCommit.get(evento.nome) ?? []) {
        try {
          await manipulador(evento);
        } catch (erro) {
          this.log.error(`Falha ao tratar o evento ${evento.nome}`, erro instanceof Error ? erro.stack : erro);
        }
      }
    }
  }
}

function adicionar(mapa: Map<string, ManipuladorDeEvento[]>, nome: string, manipulador: ManipuladorDeEvento): void {
  mapa.set(nome, [...(mapa.get(nome) ?? []), manipulador]);
}
