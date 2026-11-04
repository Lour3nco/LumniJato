import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import {
  ErroDeAutorizacao,
  ErroDeConflito,
  ErroDeDominio,
  ErroDeValidacao,
  type ErroEsperado,
} from '../dominio/erros';

export interface CorpoDeErro {
  codigo: string;
  mensagem: string;
  campos?: ReadonlyArray<{ campo: string; motivo: string }>;
}

/** O que o filtro usa da resposta HTTP (Express), sem depender dos tipos do Express. */
interface RespostaHttp {
  status(codigo: number): { json(corpo: unknown): unknown };
}

/** Código de validação de entrada [SUPOSIÇÃO do CA-01.12.2]. */
const STATUS_VALIDACAO = HttpStatus.BAD_REQUEST;

function statusDo(erro: ErroEsperado): number {
  if (erro instanceof ErroDeValidacao) return STATUS_VALIDACAO;
  if (erro instanceof ErroDeAutorizacao) return HttpStatus.FORBIDDEN;
  if (erro instanceof ErroDeConflito) return HttpStatus.CONFLICT;
  if (erro instanceof ErroDeDominio) return HttpStatus.UNPROCESSABLE_ENTITY;
  return HttpStatus.INTERNAL_SERVER_ERROR;
}

/**
 * Traduz erros em respostas HTTP (CA-01.12.3): domínio 422, autorização 403, conflito 409,
 * validação 400, sempre com `codigo` e `mensagem` simples. Erro inesperado vira 500 com
 * mensagem genérica: o rastreio de pilha e o SQL só vão para o log do servidor, nunca para
 * a resposta.
 */
@Catch()
export class FiltroDeErros implements ExceptionFilter {
  private readonly log = new Logger('FiltroDeErros');

  catch(erro: unknown, host: ArgumentsHost): void {
    const resposta = host.switchToHttp().getResponse<RespostaHttp>();
    const { status, corpo } = this.traduzir(erro);
    resposta.status(status).json(corpo);
  }

  traduzir(erro: unknown): { status: number; corpo: CorpoDeErro } {
    if (erro instanceof ErroDeDominio || erro instanceof ErroDeAutorizacao || erro instanceof ErroDeConflito) {
      return { status: statusDo(erro), corpo: { codigo: erro.codigo, mensagem: erro.message } };
    }
    if (erro instanceof ErroDeValidacao) {
      return {
        status: statusDo(erro),
        corpo: { codigo: erro.codigo, mensagem: erro.message, campos: erro.campos },
      };
    }
    if (erro instanceof HttpException) {
      const status = erro.getStatus();
      return {
        status,
        corpo: {
          codigo: status === HttpStatus.NOT_FOUND ? 'nao_encontrado' : 'erro_http',
          mensagem: status === HttpStatus.NOT_FOUND ? 'Endereço não encontrado.' : 'Pedido recusado.',
        },
      };
    }
    this.log.error('Erro inesperado', erro instanceof Error ? erro.stack : String(erro));
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      corpo: { codigo: 'erro_interno', mensagem: 'Algo deu errado no servidor. Tente de novo mais tarde.' },
    };
  }
}
