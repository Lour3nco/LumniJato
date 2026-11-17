import { Injectable } from '@nestjs/common';
import { UnidadeDeTrabalho } from '../../../../compartilhado/aplicacao/unidade-de-trabalho';
import { ErroDeDominio } from '../../../../compartilhado/dominio/erros';
import type { UsuarioAutenticado } from '../../../identidade-acesso/publico';
import { type AlteracoesDoTipo, type QualTipo, TipoDeCadastro } from '../../dominio/cadastros/tipo-de-cadastro';
import { erroNomeRepetido } from './cadastro-de-categorias';
import { RepositorioDeCadastros } from './portas';

const DESCRICAO: Record<QualTipo, string> = { tipo_servico: 'um serviço', tipo_veiculo: 'um veículo' };

/**
 * Casos de uso de TipoServico e TipoVeiculo (FIN-US-01.16): criar, renomear, desativar,
 * reativar e reordenar. Reativar quando já existe outro ativo com o mesmo nome é recusado
 * (CA-01.16.2). No MVP o dono cria tipo de veículo também direto no lançamento (§3.5).
 */
// Decorado também na base, para o NestJS enxergar as dependências do construtor herdado.
@Injectable()
abstract class CadastroDeTipos {
  protected abstract readonly qual: QualTipo;

  constructor(
    private readonly uow: UnidadeDeTrabalho,
    private readonly repositorio: RepositorioDeCadastros,
  ) {}

  criar(
    usuario: UsuarioAutenticado,
    dados: { id: string; organizacaoId: string; nome: string; icone?: string | null; ordem?: number | null },
  ): Promise<void> {
    return this.uow.executar(async () => {
      usuario.exigirPapelNaOrganizacao(dados.organizacaoId, ['dono']);
      if (await this.repositorio.buscarTipo(this.qual, dados.id)) return;
      const tipo = TipoDeCadastro.criar(this.qual, dados, { usuarioId: usuario.id, quando: new Date() });
      await this.conferirNomeUnico(tipo);
      await this.repositorio.salvarTipo(tipo);
      this.uow.registrarEventos(tipo.retirarEventos());
    });
  }

  alterar(usuario: UsuarioAutenticado, id: string, alteracoes: AlteracoesDoTipo): Promise<void> {
    return this.uow.executar(async () => {
      const tipo = await this.repositorio.buscarTipo(this.qual, id);
      if (!tipo) throw new ErroDeDominio('cadastro_inexistente', 'Cadastro não encontrado.');
      usuario.exigirPapelNaOrganizacao(tipo.organizacaoId, ['dono']);
      if (!tipo.alterar(alteracoes, { usuarioId: usuario.id, quando: new Date() })) return;
      await this.conferirNomeUnico(tipo);
      await this.repositorio.salvarTipo(tipo);
      this.uow.registrarEventos(tipo.retirarEventos());
    });
  }

  private async conferirNomeUnico(tipo: TipoDeCadastro): Promise<void> {
    if (!tipo.ativo) return;
    const existente = await this.repositorio.tipoAtivoComChave(this.qual, tipo.organizacaoId, tipo.nome.chave, tipo.id);
    if (existente) throw erroNomeRepetido(DESCRICAO[this.qual], existente);
  }
}

@Injectable()
export class CadastroDeTiposDeServico extends CadastroDeTipos {
  protected readonly qual = 'tipo_servico' as const;
}

@Injectable()
export class CadastroDeTiposDeVeiculo extends CadastroDeTipos {
  protected readonly qual = 'tipo_veiculo' as const;
}
