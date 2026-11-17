import { Injectable } from '@nestjs/common';
import { ErroDeDominio } from '../../../../compartilhado/dominio/erros';

/**
 * FormaPagamento é só leitura no MVP: as formas vêm dos dados iniciais da implantação (F-08).
 * Qualquer criação ou alteração que chegue (app antigo, chamada direta) é recusada com 422
 * (CA-01.16.6). A tela de gestão é a FIN-US-03.6 (pós-MVP).
 */
@Injectable()
export class FormasDePagamento {
  criar(): never {
    throw this.recusa();
  }

  alterar(): never {
    throw this.recusa();
  }

  private recusa(): ErroDeDominio {
    return new ErroDeDominio(
      'forma_de_pagamento_somente_leitura',
      'As formas de pagamento são cadastradas pela equipe e não mudam pelo app.',
    );
  }
}
