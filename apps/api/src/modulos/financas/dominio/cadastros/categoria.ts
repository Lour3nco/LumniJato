import { ErroDeDominio } from '../../../../compartilhado/dominio/erros';
import { RaizDeAgregado } from '../../../../compartilhado/dominio/evento-de-dominio';
import { Id } from '../../../../compartilhado/dominio/id';
import { CategoriaAlterada } from './eventos';
import { NomeNormalizado } from './nome-normalizado';

export type TipoCategoria = 'entrada' | 'saida';
export type AplicaA = 'ambos' | 'pessoal' | 'empresa';

const PADRAO_COR = /^#[0-9A-Fa-f]{6}$/;

export interface AutoriaDoCadastro {
  usuarioId: string;
  quando: Date;
}

export interface EstadoDaCategoria {
  id: string;
  organizacaoId: string;
  tipo: TipoCategoria;
  nome: string;
  icone: string | null;
  cor: string | null;
  aplicaA: AplicaA;
  sistema: boolean;
  codigo: string | null;
  ordem: number | null;
  ativa: boolean;
  versao: number;
  criadoEm: Date;
  criadoPor: string | null;
  alteradoEm: Date;
  alteradoPor: string | null;
}

/** O que chega do aparelho numa alteração; campos ausentes não mudam. */
export interface AlteracoesDaCategoria {
  tipo?: TipoCategoria;
  nome?: string;
  icone?: string | null;
  cor?: string | null;
  ordem?: number | null;
  ativa?: boolean;
  sistema?: boolean;
  codigo?: string | null;
  aplicaA?: AplicaA;
}

function conferirCor(cor: string | null | undefined): string | null {
  if (cor === null || cor === undefined || cor === '') return null;
  if (!PADRAO_COR.test(cor)) throw new ErroDeDominio('cor_invalida', 'Cor inválida.');
  return cor;
}

/**
 * Agregado Categoria (03-arquitetura §9.3, FIN-US-01.16).
 * - Categoria de sistema (as 4 com `codigo`) pode trocar nome, ícone e cor, mas NÃO pode ser
 *   desativada (F-06).
 * - O tipo (entrada/saída) não muda depois de criada [SUPOSIÇÃO §9.3].
 * - Nome único normalizado por organização e tipo entre as ativas (F-16): conferido pelo caso
 *   de uso no repositório + índice único no banco.
 */
export class Categoria extends RaizDeAgregado {
  private constructor(private estado: EstadoDaCategoria) {
    super();
  }

  static reconstituir(estado: EstadoDaCategoria): Categoria {
    return new Categoria({ ...estado });
  }

  /** O dono cria categorias novas, sempre com `sistema = false` e sem código (E2-02). */
  static criar(
    dados: { id: string; organizacaoId: string; tipo: TipoCategoria; nome: string; icone?: string | null; cor?: string | null; ordem?: number | null },
    autoria: AutoriaDoCadastro,
  ): Categoria {
    if (dados.tipo !== 'entrada' && dados.tipo !== 'saida') {
      throw new ErroDeDominio('tipo_invalido', 'Escolha entrada ou saída.');
    }
    const nome = NomeNormalizado.de(dados.nome);
    const categoria = new Categoria({
      id: Id.de(dados.id).valor,
      organizacaoId: dados.organizacaoId,
      tipo: dados.tipo,
      nome: nome.nome,
      icone: dados.icone ?? null,
      cor: conferirCor(dados.cor),
      aplicaA: 'ambos',
      sistema: false,
      codigo: null,
      ordem: dados.ordem ?? null,
      ativa: true,
      versao: 1,
      criadoEm: autoria.quando,
      criadoPor: autoria.usuarioId,
      alteradoEm: autoria.quando,
      alteradoPor: autoria.usuarioId,
    });
    categoria.emitir();
    return categoria;
  }

  /** Aplica as alterações permitidas; devolve `true` se algo mudou. */
  alterar(alteracoes: AlteracoesDaCategoria, autoria: AutoriaDoCadastro): boolean {
    const atual = this.estado;
    if (alteracoes.tipo !== undefined && alteracoes.tipo !== atual.tipo) {
      throw new ErroDeDominio('troca_de_tipo_da_categoria', 'O tipo da categoria (entrada ou saída) não muda depois de criada.');
    }
    if (
      (alteracoes.sistema !== undefined && alteracoes.sistema !== atual.sistema) ||
      (alteracoes.codigo !== undefined && alteracoes.codigo !== atual.codigo)
    ) {
      throw new ErroDeDominio('categoria_de_sistema_imutavel', 'Isso não pode ser mudado.');
    }
    if (alteracoes.aplicaA !== undefined && alteracoes.aplicaA !== atual.aplicaA) {
      throw new ErroDeDominio('campo_reservado', 'Esse campo ainda não pode ser mudado.');
    }
    if (alteracoes.ativa === false && atual.sistema) {
      throw new ErroDeDominio(
        'categoria_de_sistema_nao_desativa',
        'Categoria usada pelo sistema. Pode mudar o nome, mas não pode ser desativada.',
      );
    }

    const novo: EstadoDaCategoria = {
      ...atual,
      nome: alteracoes.nome !== undefined ? NomeNormalizado.de(alteracoes.nome).nome : atual.nome,
      icone: alteracoes.icone !== undefined ? alteracoes.icone : atual.icone,
      cor: alteracoes.cor !== undefined ? conferirCor(alteracoes.cor) : atual.cor,
      ordem: alteracoes.ordem !== undefined ? alteracoes.ordem : atual.ordem,
      ativa: alteracoes.ativa ?? atual.ativa,
    };
    const mudou = (['nome', 'icone', 'cor', 'ordem', 'ativa'] as const).some((c) => novo[c] !== atual[c]);
    if (!mudou) return false;
    this.estado = { ...novo, versao: atual.versao + 1, alteradoEm: autoria.quando, alteradoPor: autoria.usuarioId };
    this.emitir();
    return true;
  }

  private emitir(): void {
    this.registrarEvento(new CategoriaAlterada(this.estado.id, this.estado.codigo, this.estado.nome, this.estado.ativa));
  }

  get id(): string {
    return this.estado.id;
  }
  get organizacaoId(): string {
    return this.estado.organizacaoId;
  }
  get tipo(): TipoCategoria {
    return this.estado.tipo;
  }
  get ativa(): boolean {
    return this.estado.ativa;
  }
  get nome(): NomeNormalizado {
    return NomeNormalizado.de(this.estado.nome);
  }

  instantaneo(): EstadoDaCategoria {
    return { ...this.estado };
  }
}
