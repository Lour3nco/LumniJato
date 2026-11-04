/** Tipos do agregado Lancamento (FIN-US-01.14), separados para os eventos não criarem ciclo. */

export type TipoLancamento = 'entrada' | 'saida';

export type Natureza = 'empresa' | 'pessoal';

export type Situacao = 'realizado' | 'previsto';

export type Origem = 'manual' | 'atendimento' | 'estoque' | 'equipe' | 'contas';

/**
 * O que o agregado precisa saber da categoria escolhida. Quem monta é o caso de uso, a partir
 * do repositório de categorias da mesma organização (FIN-US-01.15).
 */
export interface CategoriaDoLancamento {
  id: string;
  tipo: TipoLancamento;
  /** `codigo = servicos` (vale mesmo se a categoria foi renomeada). */
  ehServicos: boolean;
  ativa: boolean;
}

/** Contexto que o domínio não calcula sozinho. */
export interface ContextoDaOperacao {
  /** Fuso da unidade (padrão America/Sao_Paulo): "hoje" é calculado nele (§5.2). */
  fusoDaUnidade: string;
  /** Hora do SERVIDOR (data futura, prazo da lixeira). */
  agoraServidor: Date;
}

/** Estado completo, igual às colunas de `financas.lancamento` (em camelCase). */
export interface EstadoDoLancamento {
  id: string;
  unidadeId: string;
  tipo: TipoLancamento;
  natureza: Natureza;
  valorCentavos: number;
  dataLancamento: string;
  categoriaId: string;
  categoriaEhServicos: boolean;
  tipoServicoId: string | null;
  tipoVeiculoId: string | null;
  formaPagamentoId: string;
  descricao: string | null;
  situacao: Situacao;
  origem: Origem;
  origemRefTabela: string | null;
  origemRefId: string | null;
  dispositivoId: string;
  criadoEm: Date;
  criadoPor: string;
  alteradoEm: Date;
  alteradoPor: string;
  versao: number;
  excluidoEm: Date | null;
  excluidoPor: string | null;
}

/** Dados que vêm do aparelho para criar. */
export interface DadosParaRegistrar {
  id: string;
  unidadeId: string;
  tipo: TipoLancamento;
  natureza: Natureza;
  valorCentavos: number;
  dataLancamento: string;
  categoria: CategoriaDoLancamento;
  tipoServicoId?: string | null;
  tipoVeiculoId?: string | null;
  formaPagamentoId: string;
  descricao?: string | null;
}

/** Campos da edição; o `tipo` vem junto para ser conferido (F-13). */
export interface DadosParaEditar {
  tipo: TipoLancamento;
  natureza: Natureza;
  valorCentavos: number;
  dataLancamento: string;
  categoria: CategoriaDoLancamento;
  tipoServicoId?: string | null;
  tipoVeiculoId?: string | null;
  formaPagamentoId: string;
  descricao?: string | null;
  /** Versão em que o aparelho se baseou (§4.3). */
  versaoBase?: number;
}
