/**
 * Base dos eventos de domínio (03-arquitetura §9.4). Os agregados registram eventos; a
 * unidade de trabalho os despacha pelo barramento depois do commit.
 */
export abstract class EventoDeDominio {
  /** Nome estável do evento, ex.: "lancamento.criado" (§6.2). */
  abstract readonly nome: string;

  protected constructor(readonly ocorridoEm: Date = new Date()) {}
}

/** Agregado que acumula eventos até serem entregues à unidade de trabalho. */
export abstract class RaizDeAgregado {
  private eventosPendentes: EventoDeDominio[] = [];

  protected registrarEvento(evento: EventoDeDominio): void {
    this.eventosPendentes.push(evento);
  }

  /** Devolve e limpa os eventos registrados. */
  retirarEventos(): EventoDeDominio[] {
    const eventos = this.eventosPendentes;
    this.eventosPendentes = [];
    return eventos;
  }
}
