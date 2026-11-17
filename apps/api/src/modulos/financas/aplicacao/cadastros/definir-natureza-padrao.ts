import { Injectable } from '@nestjs/common';
import { UnidadeDeTrabalho } from '../../../../compartilhado/aplicacao/unidade-de-trabalho';
import { ErroDeAutorizacao } from '../../../../compartilhado/dominio/erros';
import type { UsuarioAutenticado } from '../../../identidade-acesso/publico';
import { conferirNatureza } from '../../dominio/cadastros/preferencia';
import { RepositorioDeCadastros } from './portas';

/**
 * DefinirNaturezaPadrao (FIN-US-01.16, CA-01.16.7): cada usuário troca só a própria
 * preferência (403 para a de outro); valor fora de empresa/pessoal → 422. Conflito entre
 * aparelhos: vale a última que chega ao servidor (§3.2).
 */
@Injectable()
export class DefinirNaturezaPadrao {
  constructor(
    private readonly uow: UnidadeDeTrabalho,
    private readonly repositorio: RepositorioDeCadastros,
  ) {}

  executar(usuario: UsuarioAutenticado, dados: { usuarioId: string; natureza: unknown; alteradoEm?: Date }): Promise<void> {
    return this.uow.executar(async () => {
      if (dados.usuarioId !== usuario.id) {
        throw new ErroDeAutorizacao('preferencia_de_outro_usuario', 'Você só pode mudar as suas preferências.');
      }
      const natureza = conferirNatureza(dados.natureza);
      await this.repositorio.salvarPreferencia(usuario.id, natureza, dados.alteradoEm ?? new Date());
    });
  }
}
