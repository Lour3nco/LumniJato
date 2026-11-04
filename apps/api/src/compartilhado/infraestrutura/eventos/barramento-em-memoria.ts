import { Injectable, Logger } from '@nestjs/common';
import { BarramentoDeEventos, type ManipuladorDeEvento } from '../../aplicacao/barramento-de-eventos';
import type { EventoDeDominio } from '../../dominio/evento-de-dominio';

/**
 * Barramento de eventos em memória (MVP). Um manipulador que falha é registrado no log e não
 * impede os outros: o dado já foi gravado (os eventos só saem depois do commit).
 */
@Injectable()
export class BarramentoEmMemoria extends BarramentoDeEventos {
  private readonly log = new Logger('BarramentoDeEventos');
  private readonly manipuladores = new Map<string, ManipuladorDeEvento[]>();

  assinar(nomeDoEvento: string, manipulador: ManipuladorDeEvento): void {
    const lista = this.manipuladores.get(nomeDoEvento) ?? [];
    lista.push(manipulador);
    this.manipuladores.set(nomeDoEvento, lista);
  }

  async publicar(eventos: readonly EventoDeDominio[]): Promise<void> {
    for (const evento of eventos) {
      for (const manipulador of this.manipuladores.get(evento.nome) ?? []) {
        try {
          await manipulador(evento);
        } catch (erro) {
          this.log.error(`Falha ao tratar o evento ${evento.nome}`, erro instanceof Error ? erro.stack : erro);
        }
      }
    }
  }
}
