import { VALOR_MAXIMO_CENTAVOS, VALOR_MINIMO_CENTAVOS, formatarReais } from '@lavajato/dominio-compartilhado';
import { DataLocal } from '../../../../compartilhado/dominio/data-local';
import { Dinheiro } from '../../../../compartilhado/dominio/dinheiro';
import { ErroDeDominio } from '../../../../compartilhado/dominio/erros';
import { RaizDeAgregado } from '../../../../compartilhado/dominio/evento-de-dominio';
import { Id } from '../../../../compartilhado/dominio/id';
import {
  type AutoriaDaOperacao,
  LancamentoAlterado,
  LancamentoExcluido,
  LancamentoRegistrado,
  LancamentoRestaurado,
} from './eventos';

import type {
  CategoriaDoLancamento,
  ContextoDaOperacao,
  DadosParaEditar,
  DadosParaRegistrar,
  EstadoDoLancamento,
  Natureza,
  TipoLancamento,
} from './estado';

export type * from './estado';

/**
 * Agregado Lancamento (03-arquitetura §9.3, FIN-US-01.14). TypeScript puro: sem NestJS, banco
 * nem HTTP. É aqui que as regras valem (ST-04); o app repete algumas só para avisar antes.
 */

const TIPOS: readonly TipoLancamento[] = ['entrada', 'saida'];
const NATUREZAS: readonly Natureza[] = ['empresa', 'pessoal'];

/** Tamanho máximo da descrição [SUPOSIÇÃO §3.2]. */
export const DESCRICAO_MAXIMA = 200;

/** Prazo da lixeira: restaurar só até 90 dias depois da exclusão (F-09), pela hora do servidor. */
export const DIAS_DA_LIXEIRA = 90;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Campos que a edição pode trocar (o `tipo` vem junto só para ser conferido, F-13). */
const CAMPOS_EDITAVEIS = [
  'natureza',
  'valorCentavos',
  'dataLancamento',
  'categoriaId',
  'tipoServicoId',
  'tipoVeiculoId',
  'formaPagamentoId',
  'descricao',
] as const satisfies readonly (keyof EstadoDoLancamento)[];

function erro(codigo: string, mensagem: string): ErroDeDominio {
  return new ErroDeDominio(codigo, mensagem);
}

function conferirValor(centavos: number): Dinheiro {
  if (!Number.isSafeInteger(centavos) || centavos < VALOR_MINIMO_CENTAVOS) {
    throw erro('valor_invalido', 'O valor precisa ser maior que zero.');
  }
  if (centavos > VALOR_MAXIMO_CENTAVOS) {
    throw erro('valor_acima_do_maximo', `O valor máximo por lançamento é ${formatarReais(VALOR_MAXIMO_CENTAVOS)}.`);
  }
  return Dinheiro.deCentavos(centavos);
}

function conferirData(data: string, contexto: ContextoDaOperacao): DataLocal {
  const dataLocal = DataLocal.de(data);
  if (dataLocal.ehDepoisDe(DataLocal.hoje(contexto.fusoDaUnidade, contexto.agoraServidor))) {
    throw erro('data_futura', 'Só dá para lançar o que já aconteceu. Escolha hoje ou um dia anterior.');
  }
  return dataLocal;
}

function conferirTipoENatureza(tipo: TipoLancamento, natureza: Natureza): void {
  if (!TIPOS.includes(tipo)) throw erro('tipo_invalido', 'Tipo de lançamento inválido.');
  if (!NATUREZAS.includes(natureza)) throw erro('natureza_invalida', 'Escolha Empresa ou Pessoal.');
}

function conferirCategoria(categoria: CategoriaDoLancamento, tipo: TipoLancamento, exigirAtiva: boolean): void {
  if (categoria.tipo !== tipo) {
    throw erro('categoria_de_outro_tipo', 'Essa categoria não é deste tipo de lançamento.');
  }
  if (exigirAtiva && !categoria.ativa) {
    throw erro('categoria_desativada', 'Essa categoria está desativada.');
  }
}

/**
 * Regra serviço × veículo (E2-04 a): na entrada da categoria "Serviços", o tipo de veículo é
 * obrigatório e o tipo de serviço é opcional; nas demais entradas e nas saídas, os dois ficam
 * vazios.
 */
function conferirClassificacao(
  tipo: TipoLancamento,
  categoria: CategoriaDoLancamento,
  tipoServicoId: string | null,
  tipoVeiculoId: string | null,
): void {
  const entradaDeServico = tipo === 'entrada' && categoria.ehServicos;
  if (entradaDeServico) {
    if (!tipoVeiculoId) throw erro('veiculo_obrigatorio', 'Escolha o veículo.');
    return;
  }
  if (tipoVeiculoId || tipoServicoId) {
    throw erro(
      'servico_ou_veiculo_fora_de_servicos',
      'Tipo de serviço e veículo só valem em entradas da categoria Serviços.',
    );
  }
}

function conferirDescricao(descricao: string | null | undefined): string | null {
  const texto = descricao?.trim() ?? '';
  if (texto.length > DESCRICAO_MAXIMA) {
    throw erro('descricao_longa', `A observação pode ter até ${DESCRICAO_MAXIMA} caracteres.`);
  }
  return texto === '' ? null : texto;
}

export class Lancamento extends RaizDeAgregado {
  private constructor(private estado: EstadoDoLancamento) {
    super();
  }

  /** Recria a partir do banco, sem validar nem emitir eventos. */
  static reconstituir(estado: EstadoDoLancamento): Lancamento {
    return new Lancamento({ ...estado });
  }

  /** Cria um lançamento novo (origem manual, situação realizado no MVP). */
  static registrar(dados: DadosParaRegistrar, autoria: AutoriaDaOperacao, contexto: ContextoDaOperacao): Lancamento {
    const id = Id.de(dados.id).valor;
    conferirTipoENatureza(dados.tipo, dados.natureza);
    const valor = conferirValor(dados.valorCentavos);
    const data = conferirData(dados.dataLancamento, contexto);
    conferirCategoria(dados.categoria, dados.tipo, true);
    const tipoServicoId = dados.tipoServicoId ?? null;
    const tipoVeiculoId = dados.tipoVeiculoId ?? null;
    conferirClassificacao(dados.tipo, dados.categoria, tipoServicoId, tipoVeiculoId);

    const lancamento = new Lancamento({
      id,
      unidadeId: dados.unidadeId,
      tipo: dados.tipo,
      natureza: dados.natureza,
      valorCentavos: valor.centavos,
      dataLancamento: data.valor,
      categoriaId: dados.categoria.id,
      categoriaEhServicos: dados.categoria.ehServicos,
      tipoServicoId,
      tipoVeiculoId,
      formaPagamentoId: dados.formaPagamentoId,
      descricao: conferirDescricao(dados.descricao),
      situacao: 'realizado',
      origem: 'manual',
      origemRefTabela: null,
      origemRefId: null,
      dispositivoId: autoria.dispositivoId,
      criadoEm: autoria.quando,
      criadoPor: autoria.usuarioId,
      alteradoEm: autoria.quando,
      alteradoPor: autoria.usuarioId,
      versao: 1,
      excluidoEm: null,
      excluidoPor: null,
    });
    lancamento.registrarEvento(new LancamentoRegistrado(id, lancamento.instantaneo(), autoria));
    return lancamento;
  }

  /**
   * Edita os campos do lançamento. Recusa: lançamento excluído; troca de tipo; entrar ou sair
   * de "Serviços" (F-13). Sem nenhuma mudança, não faz nada (nem evento).
   */
  editar(dados: DadosParaEditar, autoria: AutoriaDaOperacao, contexto: ContextoDaOperacao): void {
    if (this.estado.excluidoEm) {
      throw erro('lancamento_excluido', 'Este lançamento está na Lixeira. Restaure antes de editar.');
    }
    if (dados.tipo !== this.estado.tipo) {
      throw erro('troca_de_tipo', 'Para mudar o tipo, exclua e lance de novo.');
    }
    if (dados.categoria.ehServicos !== this.estado.categoriaEhServicos) {
      throw erro('troca_de_tipo', 'Para mudar o tipo, exclua e lance de novo.');
    }
    conferirTipoENatureza(dados.tipo, dados.natureza);
    const valor = conferirValor(dados.valorCentavos);
    const data = conferirData(dados.dataLancamento, contexto);
    // A categoria antiga pode ter sido desativada depois: mantê-la é permitido; trocar para
    // uma desativada, não (D-QA-09).
    conferirCategoria(dados.categoria, dados.tipo, dados.categoria.id !== this.estado.categoriaId);
    const tipoServicoId = dados.tipoServicoId ?? null;
    const tipoVeiculoId = dados.tipoVeiculoId ?? null;
    conferirClassificacao(dados.tipo, dados.categoria, tipoServicoId, tipoVeiculoId);

    const antes = this.instantaneo();
    const novo: EstadoDoLancamento = {
      ...this.estado,
      natureza: dados.natureza,
      valorCentavos: valor.centavos,
      dataLancamento: data.valor,
      categoriaId: dados.categoria.id,
      tipoServicoId,
      tipoVeiculoId,
      formaPagamentoId: dados.formaPagamentoId,
      descricao: conferirDescricao(dados.descricao),
    };
    const camposAlterados = CAMPOS_EDITAVEIS.filter((campo) => novo[campo] !== antes[campo]);
    if (camposAlterados.length === 0) return;

    this.estado = {
      ...novo,
      alteradoEm: autoria.quando,
      alteradoPor: autoria.usuarioId,
      versao: antes.versao + 1,
    };
    const conflito = dados.versaoBase !== undefined && dados.versaoBase < antes.versao;
    this.registrarEvento(
      new LancamentoAlterado(this.estado.id, camposAlterados, antes, this.instantaneo(), autoria, conflito),
    );
  }

  /** Exclusão lógica (vai para a Lixeira). Excluir de novo não faz nada [SUPOSIÇÃO CA-01.15.5]. */
  excluir(autoria: AutoriaDaOperacao): void {
    if (this.estado.excluidoEm) return;
    const antes = this.instantaneo();
    this.estado = {
      ...this.estado,
      excluidoEm: autoria.quando,
      excluidoPor: autoria.usuarioId,
      alteradoEm: autoria.quando,
      alteradoPor: autoria.usuarioId,
      versao: antes.versao + 1,
    };
    this.registrarEvento(new LancamentoExcluido(this.estado.id, antes, this.instantaneo(), autoria));
  }

  /**
   * Tira da Lixeira. Só até 90 dias depois da exclusão, contados em dias inteiros pela hora do
   * servidor (90 aceita, 91 recusa — CA-01.14.7). Restaurar um ativo não faz nada.
   */
  restaurar(autoria: AutoriaDaOperacao, contexto: ContextoDaOperacao): void {
    const excluidoEm = this.estado.excluidoEm;
    if (!excluidoEm) return;
    const diasNaLixeira = Math.floor((contexto.agoraServidor.getTime() - excluidoEm.getTime()) / MS_POR_DIA);
    if (diasNaLixeira > DIAS_DA_LIXEIRA) {
      throw erro('prazo_da_lixeira_vencido', 'Este lançamento saiu da Lixeira há mais de 90 dias e não pode ser restaurado.');
    }
    const antes = this.instantaneo();
    this.estado = {
      ...this.estado,
      excluidoEm: null,
      excluidoPor: null,
      alteradoEm: autoria.quando,
      alteradoPor: autoria.usuarioId,
      versao: antes.versao + 1,
    };
    this.registrarEvento(new LancamentoRestaurado(this.estado.id, antes, this.instantaneo(), autoria));
  }

  get id(): string {
    return this.estado.id;
  }

  get unidadeId(): string {
    return this.estado.unidadeId;
  }

  get excluido(): boolean {
    return this.estado.excluidoEm !== null;
  }

  /** Cópia do estado atual (para o repositório e os eventos). */
  instantaneo(): EstadoDoLancamento {
    return { ...this.estado };
  }
}
