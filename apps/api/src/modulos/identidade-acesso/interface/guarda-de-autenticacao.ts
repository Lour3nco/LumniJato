import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHAVE_ROTA_PUBLICA } from '../../../compartilhado/interface/rota-publica';
import { AutenticarRequisicao } from '../aplicacao/autenticar-requisicao';
import type { UsuarioAutenticado } from '../dominio/usuario-autenticado';

export interface RequisicaoAutenticada {
  headers: Record<string, string | string[] | undefined>;
  usuario?: UsuarioAutenticado;
}

/**
 * Guarda global: toda rota exige o JWT do Supabase Auth (Authorization: Bearer <token>),
 * exceto as marcadas com @RotaPublica (CA-01.13.1). Sem token, vencido ou assinatura
 * inválida → 401, antes de qualquer leitura ou gravação.
 */
@Injectable()
export class GuardaDeAutenticacao implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly autenticar: AutenticarRequisicao,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const publica = this.reflector.getAllAndOverride<boolean>(CHAVE_ROTA_PUBLICA, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (publica) return true;

    const requisicao = contexto.switchToHttp().getRequest<RequisicaoAutenticada>();
    const cabecalho = requisicao.headers.authorization;
    const valor = Array.isArray(cabecalho) ? cabecalho[0] : cabecalho;
    const token = valor?.startsWith('Bearer ') ? valor.slice('Bearer '.length).trim() : undefined;
    requisicao.usuario = await this.autenticar.executar(token);
    return true;
  }
}
