import { Injectable } from '@nestjs/common';
import { ErroDeAutorizacao } from '../../../compartilhado/dominio/erros';
import { Id } from '../../../compartilhado/dominio/id';
import type { UsuarioAutenticado } from '../dominio/usuario-autenticado';
import { RepositorioDeIdentidade } from './portas';

/**
 * Registra o aparelho na primeira sincronização (03-arquitetura §4.1, CA-01.13.6): uma vez só,
 * ligado ao usuário do token. Chamado pelo módulo Sincronização (FIN-US-07.11).
 */
@Injectable()
export class RegistrarDispositivo {
  constructor(private readonly repositorio: RepositorioDeIdentidade) {}

  async executar(usuario: UsuarioAutenticado, dados: { id: string; nome?: string | null }): Promise<void> {
    const id = Id.de(dados.id).valor;
    await this.repositorio.inserirDispositivoSeNaoExistir({ id, usuarioId: usuario.id, nome: dados.nome ?? null });
    const registrado = await this.repositorio.buscarDispositivo(id);
    if (registrado && registrado.usuarioId !== usuario.id) {
      throw new ErroDeAutorizacao('dispositivo_de_outro_usuario', 'Este aparelho está ligado a outra conta.');
    }
    await this.repositorio.marcarSincronizacao(id, new Date());
  }
}
