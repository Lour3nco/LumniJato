import { Controller, Get, Param } from '@nestjs/common';
import type { UsuarioAutenticado } from '../dominio/usuario-autenticado';
import { UsuarioAtual } from './usuario-atual.decorator';

/**
 * Consultas do próprio usuário. O app usa `GET /eu` para saber as unidades do dono (primeiro
 * uso, FIN-US-01.8). Só leitura.
 */
@Controller()
export class IdentidadeController {
  @Get('eu')
  eu(@UsuarioAtual() usuario: UsuarioAutenticado) {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      unidades: usuario.vinculos.map((v) => ({ id: v.unidadeId, nome: v.unidadeNome, papel: v.papel })),
    };
  }

  /** Uma unidade, só se o usuário tem vínculo ativo nela (403 caso contrário, CA-01.13.7). */
  @Get('unidades/:unidadeId')
  unidade(@UsuarioAtual() usuario: UsuarioAutenticado, @Param('unidadeId') unidadeId: string) {
    usuario.exigirPapel(unidadeId, ['dono', 'gerente', 'funcionario']);
    const vinculo = usuario.vinculos.find((v) => v.unidadeId === unidadeId);
    return { id: unidadeId, nome: vinculo?.unidadeNome, papel: vinculo?.papel };
  }
}
