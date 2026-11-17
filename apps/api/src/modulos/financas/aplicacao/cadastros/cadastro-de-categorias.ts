import { Injectable } from '@nestjs/common';
import { UnidadeDeTrabalho } from '../../../../compartilhado/aplicacao/unidade-de-trabalho';
import { ErroDeDominio } from '../../../../compartilhado/dominio/erros';
import type { UsuarioAutenticado } from '../../../identidade-acesso/publico';
import { type AlteracoesDaCategoria, Categoria, type TipoCategoria } from '../../dominio/cadastros/categoria';
import { RepositorioDeCadastros } from './portas';

export function erroNomeRepetido(oQue: string, existente: string): ErroDeDominio {
  return new ErroDeDominio('nome_repetido', `Já existe ${oQue} com esse nome: '${existente}'.`);
}

/**
 * Casos de uso das categorias (FIN-US-01.16): CriarCategoria e AlterarCategoria (renomear,
 * trocar ícone e cor, desativar, reativar, reordenar). Só o papel `dono` da organização.
 * Nome repetido é recusado mesmo vindo de app desatualizado (CA-01.16.1).
 */
@Injectable()
export class CadastroDeCategorias {
  constructor(
    private readonly uow: UnidadeDeTrabalho,
    private readonly repositorio: RepositorioDeCadastros,
  ) {}

  criar(
    usuario: UsuarioAutenticado,
    dados: { id: string; organizacaoId: string; tipo: TipoCategoria; nome: string; icone?: string | null; cor?: string | null; ordem?: number | null },
  ): Promise<void> {
    return this.uow.executar(async () => {
      usuario.exigirPapelNaOrganizacao(dados.organizacaoId, ['dono']);
      // Reenvio da mesma criação (fila do app): não duplica (§4.1).
      if (await this.repositorio.buscarCategoria(dados.id)) return;
      const categoria = Categoria.criar(dados, { usuarioId: usuario.id, quando: new Date() });
      await this.conferirNomeUnico(categoria);
      await this.repositorio.salvarCategoria(categoria);
      this.uow.registrarEventos(categoria.retirarEventos());
    });
  }

  alterar(usuario: UsuarioAutenticado, id: string, alteracoes: AlteracoesDaCategoria): Promise<void> {
    return this.uow.executar(async () => {
      const categoria = await this.repositorio.buscarCategoria(id);
      if (!categoria) throw new ErroDeDominio('categoria_inexistente', 'Categoria não encontrada.');
      usuario.exigirPapelNaOrganizacao(categoria.organizacaoId, ['dono']);
      if (!categoria.alterar(alteracoes, { usuarioId: usuario.id, quando: new Date() })) return;
      await this.conferirNomeUnico(categoria);
      await this.repositorio.salvarCategoria(categoria);
      this.uow.registrarEventos(categoria.retirarEventos());
    });
  }

  private async conferirNomeUnico(categoria: Categoria): Promise<void> {
    if (!categoria.ativa) return;
    const existente = await this.repositorio.categoriaAtivaComChave(
      categoria.organizacaoId,
      categoria.tipo,
      categoria.nome.chave,
      categoria.id,
    );
    if (existente) throw erroNomeRepetido('uma categoria', existente);
  }
}
