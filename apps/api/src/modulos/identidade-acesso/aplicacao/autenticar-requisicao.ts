import { Injectable } from '@nestjs/common';
import { ErroDeAutenticacao, ErroDeAutorizacao } from '../../../compartilhado/dominio/erros';
import { UsuarioAutenticado } from '../dominio/usuario-autenticado';
import { RepositorioDeIdentidade, VerificadorDeToken } from './portas';

/**
 * Caso de uso da guarda global: token → usuário com vínculos ativos (CA-01.13.1, CA-01.13.2).
 * Não existe login próprio no NestJS: só se valida o token do Supabase Auth.
 */
@Injectable()
export class AutenticarRequisicao {
  constructor(
    private readonly verificador: VerificadorDeToken,
    private readonly repositorio: RepositorioDeIdentidade,
  ) {}

  async executar(token: string | undefined): Promise<UsuarioAutenticado> {
    if (!token) throw new ErroDeAutenticacao();
    const { usuarioId } = await this.verificador.verificar(token);
    const perfil = await this.repositorio.carregarPerfil(usuarioId);
    // Conta do Supabase Auth sem perfil (ou desativada): sem acesso aos dados.
    if (!perfil || !perfil.ativo) {
      throw new ErroDeAutorizacao('usuario_sem_acesso', 'Sua conta não tem acesso. Fale com a equipe.');
    }
    return new UsuarioAutenticado(perfil.id, perfil.nome, perfil.email, perfil.vinculos);
  }
}
