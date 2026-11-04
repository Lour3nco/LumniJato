/**
 * Erros que o domínio e a aplicação lançam de propósito. Cada um vira um código HTTP no
 * filtro de erros da interface (CA-01.12.3): domínio 422, autorização 403, conflito 409.
 * `codigo` é estável (o app usa para decidir o que fazer); `message` é a frase simples que o
 * dono pode ler.
 */
export abstract class ErroEsperado extends Error {
  protected constructor(
    readonly codigo: string,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = new.target.name;
  }
}

/** Regra de negócio violada (ex.: valor zero, nome repetido F-16, troca de tipo F-13). */
export class ErroDeDominio extends ErroEsperado {
  constructor(codigo: string, mensagem: string) {
    super(codigo, mensagem);
  }
}

/** O usuário não tem papel para a ação naquela unidade (§3.5). */
export class ErroDeAutorizacao extends ErroEsperado {
  constructor(codigo = 'sem_permissao', mensagem = 'Você não tem permissão para fazer isso.') {
    super(codigo, mensagem);
  }
}

/** O estado mudou desde que o pedido foi montado (ex.: versão desatualizada). */
export class ErroDeConflito extends ErroEsperado {
  constructor(codigo: string, mensagem: string) {
    super(codigo, mensagem);
  }
}

/** Entrada fora do esquema (zod), recusada antes de chegar ao domínio (CA-01.12.2). */
export class ErroDeValidacao extends ErroEsperado {
  constructor(readonly campos: ReadonlyArray<{ campo: string; motivo: string }>) {
    super('entrada_invalida', 'Alguns dados enviados estão incorretos.');
  }
}
