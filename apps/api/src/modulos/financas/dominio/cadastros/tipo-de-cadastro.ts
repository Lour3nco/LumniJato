import { ErroDeDominio } from '../../../../compartilhado/dominio/erros';
import { RaizDeAgregado } from '../../../../compartilhado/dominio/evento-de-dominio';
import { Id } from '../../../../compartilhado/dominio/id';
import type { AutoriaDoCadastro } from './categoria';
import { TipoServicoAlterado, TipoVeiculoAlterado } from './eventos';
import { NomeNormalizado } from './nome-normalizado';

/** Ícone dos tipos de veículo criados pelo dono sem ícone [SUPOSIÇÃO, catálogo do app]. */
export const ICONE_GENERICO_DE_VEICULO = 'veiculo';

export type QualTipo = 'tipo_servico' | 'tipo_veiculo';

export interface EstadoDoTipo {
  id: string;
  organizacaoId: string;
  nome: string;
  /** Só tipo de veículo; nulo no tipo de serviço. */
  icone: string | null;
  ordem: number | null;
  ativo: boolean;
  versao: number;
  criadoEm: Date;
  criadoPor: string | null;
  alteradoEm: Date;
  alteradoPor: string | null;
}

export interface AlteracoesDoTipo {
  nome?: string;
  icone?: string | null;
  ordem?: number | null;
  ativo?: boolean;
}

/**
 * Agregados TipoServico e TipoVeiculo (FIN-US-01.16): só o nome (sem preço), ordem e ativo;
 * o de veículo tem ícone, genérico quando o dono não escolhe (CA-01.16.5). Desativar mantém os
 * lançamentos antigos. Nome único normalizado entre os ativos (F-16), conferido pelo caso de uso.
 */
export class TipoDeCadastro extends RaizDeAgregado {
  private constructor(
    readonly qual: QualTipo,
    private estado: EstadoDoTipo,
  ) {
    super();
  }

  static reconstituir(qual: QualTipo, estado: EstadoDoTipo): TipoDeCadastro {
    return new TipoDeCadastro(qual, { ...estado });
  }

  static criar(
    qual: QualTipo,
    dados: { id: string; organizacaoId: string; nome: string; icone?: string | null; ordem?: number | null },
    autoria: AutoriaDoCadastro,
  ): TipoDeCadastro {
    const nome = NomeNormalizado.de(dados.nome);
    const tipo = new TipoDeCadastro(qual, {
      id: Id.de(dados.id).valor,
      organizacaoId: dados.organizacaoId,
      nome: nome.nome,
      icone: qual === 'tipo_veiculo' ? dados.icone || ICONE_GENERICO_DE_VEICULO : null,
      ordem: dados.ordem ?? null,
      ativo: true,
      versao: 1,
      criadoEm: autoria.quando,
      criadoPor: autoria.usuarioId,
      alteradoEm: autoria.quando,
      alteradoPor: autoria.usuarioId,
    });
    tipo.emitir();
    return tipo;
  }

  alterar(alteracoes: AlteracoesDoTipo, autoria: AutoriaDoCadastro): boolean {
    const atual = this.estado;
    if (this.qual === 'tipo_servico' && alteracoes.icone) {
      throw new ErroDeDominio('campo_invalido', 'Tipo de serviço não tem ícone.');
    }
    const novo: EstadoDoTipo = {
      ...atual,
      nome: alteracoes.nome !== undefined ? NomeNormalizado.de(alteracoes.nome).nome : atual.nome,
      icone:
        this.qual === 'tipo_veiculo' && alteracoes.icone !== undefined
          ? alteracoes.icone || ICONE_GENERICO_DE_VEICULO
          : atual.icone,
      ordem: alteracoes.ordem !== undefined ? alteracoes.ordem : atual.ordem,
      ativo: alteracoes.ativo ?? atual.ativo,
    };
    const mudou = (['nome', 'icone', 'ordem', 'ativo'] as const).some((c) => novo[c] !== atual[c]);
    if (!mudou) return false;
    this.estado = { ...novo, versao: atual.versao + 1, alteradoEm: autoria.quando, alteradoPor: autoria.usuarioId };
    this.emitir();
    return true;
  }

  private emitir(): void {
    const e = this.estado;
    this.registrarEvento(
      this.qual === 'tipo_veiculo'
        ? new TipoVeiculoAlterado(e.id, e.nome, e.icone ?? ICONE_GENERICO_DE_VEICULO, e.ativo)
        : new TipoServicoAlterado(e.id, e.nome, e.ativo),
    );
  }

  get id(): string {
    return this.estado.id;
  }
  get organizacaoId(): string {
    return this.estado.organizacaoId;
  }
  get ativo(): boolean {
    return this.estado.ativo;
  }
  get nome(): NomeNormalizado {
    return NomeNormalizado.de(this.estado.nome);
  }

  instantaneo(): EstadoDoTipo {
    return { ...this.estado };
  }
}
