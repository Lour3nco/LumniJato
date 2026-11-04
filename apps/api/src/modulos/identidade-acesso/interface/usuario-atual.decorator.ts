import { type ExecutionContext, createParamDecorator } from '@nestjs/common';
import { ErroDeAutenticacao } from '../../../compartilhado/dominio/erros';
import type { UsuarioAutenticado } from '../dominio/usuario-autenticado';
import type { RequisicaoAutenticada } from './guarda-de-autenticacao';

/** Injeta no controlador o usuário do token, já com os vínculos ativos. */
export const UsuarioAtual = createParamDecorator((_dado: unknown, contexto: ExecutionContext): UsuarioAutenticado => {
  const usuario = contexto.switchToHttp().getRequest<RequisicaoAutenticada>().usuario;
  if (!usuario) throw new ErroDeAutenticacao();
  return usuario;
});
