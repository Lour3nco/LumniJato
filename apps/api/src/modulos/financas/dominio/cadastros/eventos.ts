import { EventoDeDominio } from '../../../../compartilhado/dominio/evento-de-dominio';

/** Eventos dos cadastros (03-arquitetura §9.4): avisam os módulos futuros (Atendimento, Clientes). */

export class CategoriaAlterada extends EventoDeDominio {
  readonly nome = 'categoria.alterada';
  constructor(
    readonly categoriaId: string,
    readonly codigo: string | null,
    readonly nomeDaCategoria: string,
    readonly ativa: boolean,
  ) {
    super();
  }
}

export class TipoServicoAlterado extends EventoDeDominio {
  readonly nome = 'tipo_servico.alterado';
  constructor(
    readonly tipoServicoId: string,
    readonly nomeDoTipo: string,
    readonly ativo: boolean,
  ) {
    super();
  }
}

export class TipoVeiculoAlterado extends EventoDeDominio {
  readonly nome = 'tipo_veiculo.alterado';
  constructor(
    readonly tipoVeiculoId: string,
    readonly nomeDoTipo: string,
    readonly icone: string,
    readonly ativo: boolean,
  ) {
    super();
  }
}
