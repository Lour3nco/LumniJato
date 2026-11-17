import type { Natureza } from '../../dominio/cadastros/preferencia';
import type { Categoria, TipoCategoria } from '../../dominio/cadastros/categoria';
import type { QualTipo, TipoDeCadastro } from '../../dominio/cadastros/tipo-de-cadastro';

/** Leitura e gravação dos cadastros e da preferência (schema `financas`). */
export abstract class RepositorioDeCadastros {
  abstract buscarCategoria(id: string): Promise<Categoria | null>;
  abstract salvarCategoria(categoria: Categoria): Promise<void>;
  /** Nome da categoria ATIVA com a mesma chave (organização + tipo), fora `excetoId`; ou null. */
  abstract categoriaAtivaComChave(organizacaoId: string, tipo: TipoCategoria, chave: string, excetoId: string): Promise<string | null>;

  abstract buscarTipo(qual: QualTipo, id: string): Promise<TipoDeCadastro | null>;
  abstract salvarTipo(tipo: TipoDeCadastro): Promise<void>;
  abstract tipoAtivoComChave(qual: QualTipo, organizacaoId: string, chave: string, excetoId: string): Promise<string | null>;

  abstract salvarPreferencia(usuarioId: string, natureza: Natureza, alteradoEm: Date): Promise<void>;
}
