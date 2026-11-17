import type { Generated, GeneratedAlways } from 'kysely';

/**
 * Tabelas do schema `financas` (migração 20261104000100), como o Kysely as vê. Só o módulo
 * Finanças usa este tipo (cada módulo é dono das suas tabelas, 03-arquitetura §9.1).
 * `nome_chave` é coluna gerada: só leitura.
 */
type Auditoria = {
  versao: number;
  criado_em: Date;
  criado_por: string | null;
  alterado_em: Date;
  alterado_por: string | null;
};

export type LinhaCategoria = Auditoria & {
  id: string;
  organizacao_id: string;
  tipo: 'entrada' | 'saida';
  nome: string;
  icone: string | null;
  cor: string | null;
  aplica_a: 'ambos' | 'pessoal' | 'empresa';
  sistema: boolean;
  codigo: string | null;
  ordem: number | null;
  ativa: boolean;
};

export type LinhaTipoServico = Auditoria & {
  id: string;
  organizacao_id: string;
  nome: string;
  ordem: number | null;
  ativo: boolean;
};

export type LinhaTipoVeiculo = LinhaTipoServico & { icone: string };

export type LinhaLancamento = {
  id: string;
  unidade_id: string;
  tipo: 'entrada' | 'saida';
  natureza: 'empresa' | 'pessoal';
  valor_centavos: number;
  data_lancamento: string;
  categoria_id: string;
  tipo_servico_id: string | null;
  tipo_veiculo_id: string | null;
  forma_pagamento_id: string;
  descricao: string | null;
  situacao: 'realizado' | 'previsto';
  origem: 'manual' | 'atendimento' | 'estoque' | 'equipe' | 'contas';
  origem_ref_tabela: string | null;
  origem_ref_id: string | null;
  dispositivo_id: string;
  criado_em: Date;
  criado_por: string;
  alterado_em: Date;
  alterado_por: string;
  recebido_servidor_em: Date | null;
  versao: number;
  excluido_em: Date | null;
  excluido_por: string | null;
};

export type LinhaHistorico = {
  id: string;
  lancamento_id: string;
  acao: 'criacao' | 'alteracao' | 'exclusao' | 'restauracao';
  dados_antes: string | null;
  dados_depois: string | null;
  campos_alterados: string[] | null;
  alterado_por: string | null;
  alterado_em: Date | null;
  dispositivo_id: string | null;
  recebido_servidor_em: Date;
  conflito: boolean;
};

export type TabelasFinancas = {
  'financas.categoria': LinhaCategoria & { nome_chave: GeneratedAlways<string> };
  'financas.tipo_servico': LinhaTipoServico & { nome_chave: GeneratedAlways<string> };
  'financas.tipo_veiculo': LinhaTipoVeiculo & { nome_chave: GeneratedAlways<string> };
  'financas.forma_pagamento': { id: string; organizacao_id: string; nome: string; ativa: boolean };
  'financas.preferencia_usuario': {
    usuario_id: string;
    natureza_padrao: 'empresa' | 'pessoal';
    alterado_em: Date;
    versao: number;
  };
  'financas.lancamento': LinhaLancamento;
  'financas.lancamento_historico': Omit<LinhaHistorico, 'id' | 'recebido_servidor_em'> & {
    id: Generated<string>;
    recebido_servidor_em: Generated<Date>;
  };
};
