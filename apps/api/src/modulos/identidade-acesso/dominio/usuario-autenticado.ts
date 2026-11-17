import { ErroDeAutorizacao } from '../../../compartilhado/dominio/erros';

/** Papéis do vínculo usuário × unidade. Só `dono` no MVP; os outros são reservados (RNF-20). */
export const PAPEIS = ['dono', 'gerente', 'funcionario'] as const;
export type Papel = (typeof PAPEIS)[number];

export interface Vinculo {
  readonly unidadeId: string;
  /** Organização da unidade: os cadastros (categorias, tipos…) são da organização (S-03). */
  readonly organizacaoId: string;
  readonly unidadeNome: string;
  readonly papel: Papel;
}

/**
 * Quem está chamando a API: o usuário do token (JWT do Supabase Auth) e os seus vínculos
 * ATIVOS (CA-01.13.2). As permissões saem do papel em cada unidade, nunca de regra fixa (§3.5).
 */
export class UsuarioAutenticado {
  constructor(
    readonly id: string,
    readonly nome: string,
    readonly email: string | null,
    readonly vinculos: readonly Vinculo[],
  ) {}

  /** `tem_papel(unidade, papeis)` da 03-arquitetura §3.5. */
  temPapel(unidadeId: string, papeis: readonly Papel[]): boolean {
    return this.vinculos.some((v) => v.unidadeId === unidadeId && papeis.includes(v.papel));
  }

  /** Lança 403 se o usuário não tem um dos papéis na unidade (CA-01.13.3, CA-01.13.4). */
  exigirPapel(unidadeId: string, papeis: readonly Papel[]): void {
    if (!this.temPapel(unidadeId, papeis)) {
      throw new ErroDeAutorizacao('sem_permissao_na_unidade', 'Você não tem permissão nesta unidade.');
    }
  }

  /**
   * Na criação, o autor gravado é sempre o do token: um `criado_por` diferente vindo do
   * aparelho é recusado (CA-01.13.5).
   */
  exigirMesmoAutor(autorInformado: string): void {
    if (autorInformado !== this.id) {
      throw new ErroDeAutorizacao('autor_diferente', 'O lançamento não pode ser gravado em nome de outra pessoa.');
    }
  }

  /** Tem o papel em alguma unidade da organização? (cadastros comuns, §3.5) */
  temPapelNaOrganizacao(organizacaoId: string, papeis: readonly Papel[]): boolean {
    return this.vinculos.some((v) => v.organizacaoId === organizacaoId && papeis.includes(v.papel));
  }

  /** Lança 403 se o usuário não tem o papel em nenhuma unidade da organização. */
  exigirPapelNaOrganizacao(organizacaoId: string, papeis: readonly Papel[]): void {
    if (!this.temPapelNaOrganizacao(organizacaoId, papeis)) {
      throw new ErroDeAutorizacao('sem_permissao_na_organizacao', 'Você não tem permissão para mudar estes cadastros.');
    }
  }

  unidadesComPapel(papeis: readonly Papel[]): string[] {
    return this.vinculos.filter((v) => papeis.includes(v.papel)).map((v) => v.unidadeId);
  }
}
