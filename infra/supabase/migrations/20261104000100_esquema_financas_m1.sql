-- FIN-US-01.3 · Esquema do banco do Módulo 1 (03-arquitetura §3).
--
-- O banco é a ÚLTIMA barreira: chaves estrangeiras, `check` das listas fixas, `not null`,
-- valores em centavos positivos e nomes únicos normalizados (F-16). As regras de domínio
-- (serviço × veículo E2-04, troca de tipo F-13, categoria de sistema F-06, lixeira F-09)
-- ficam no back-end NestJS (FIN-US-01.14 e 01.16): aqui NÃO há gatilho nem política com regra
-- de domínio (CA-01.3.7, ST-04).
--
-- Convenções (§3.1):
-- - `id uuid`, gerado no aparelho (UUID v7); sem valor padrão no banco, exceto no histórico,
--   que é gravado pelo servidor.
-- - Dinheiro em `bigint` de centavos, sempre > 0; o sinal vem do `tipo`.
-- - Horas de sistema em `timestamptz` (UTC); data do lançamento em `date`.
-- - Listas fixas em `text` com `check`.
-- - Exclusão lógica por `excluido_em`.
-- - Não há campo de CPF, telefone, placa, modelo nem nome de cliente (RNF-24).
-- RLS e papéis de acesso entram na FIN-US-01.4; dados iniciais na FIN-US-01.6.

-- ---------------------------------------------------------------------------------------
-- Normalização de nomes (F-16): lower(f_unaccent(btrim(nome)))
-- ---------------------------------------------------------------------------------------
-- No Supabase, as extensões ficam no schema `extensions` (já existe lá; criado aqui para o
-- Postgres de teste).
create schema if not exists extensions;
create extension if not exists unaccent with schema extensions;

-- Coluna gerada só aceita função imutável; `unaccent` não é. Esta função fixa o dicionário
-- e o schema, o que a torna segura para declarar como `immutable`.
create or replace function financas.f_unaccent(texto text)
  returns text
  language sql
  immutable
  parallel safe
  strict
  set search_path = ''
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, texto)
$$;

comment on function financas.f_unaccent(text) is
  'Tira acentos (extensão unaccent) de forma imutável, para a coluna gerada nome_chave (F-16). '
  'O app usa a mesma regra em normalizarNome (packages/dominio-compartilhado).';

-- ---------------------------------------------------------------------------------------
-- Schema identidade (módulo Identidade e Acesso)
-- ---------------------------------------------------------------------------------------

-- [SUPOSIÇÃO S-02] Agrupa as unidades de um mesmo dono; uma só no MVP.
create table identidade.organizacao (
  id          uuid primary key,
  nome        text not null check (btrim(nome) <> ''),
  criado_em   timestamptz not null default now(),
  alterado_em timestamptz not null default now()
);

-- Perfil do usuário; o login fica em auth.users (Supabase Auth), com o mesmo id.
-- Sem FK para auth.users: o schema auth é do Supabase e a conta é criada pela equipe (ST-07).
create table identidade.usuario (
  id          uuid primary key,
  nome        text not null check (btrim(nome) <> ''),
  email       text,
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now(),
  alterado_em timestamptz not null default now()
);
comment on column identidade.usuario.id is 'Igual a auth.users.id do Supabase Auth.';

create table identidade.unidade (
  id             uuid primary key,
  organizacao_id uuid not null references identidade.organizacao (id),
  nome           text not null check (btrim(nome) <> ''),
  fuso_horario   text not null default 'America/Sao_Paulo',
  ativa          boolean not null default true,
  criado_em      timestamptz not null default now(),
  criado_por     uuid references identidade.usuario (id),
  alterado_em    timestamptz not null default now(),
  alterado_por   uuid references identidade.usuario (id),
  constraint unidade_nome_unico_na_organizacao unique (organizacao_id, nome)
);

create table identidade.usuario_unidade (
  id           uuid primary key,
  usuario_id   uuid not null references identidade.usuario (id),
  unidade_id   uuid not null references identidade.unidade (id),
  papel        text not null check (papel in ('dono', 'gerente', 'funcionario')),
  ativo        boolean not null default true,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references identidade.usuario (id),
  alterado_em  timestamptz not null default now(),
  alterado_por uuid references identidade.usuario (id),
  constraint usuario_unidade_unico unique (usuario_id, unidade_id)
);
comment on column identidade.usuario_unidade.papel is 'dono no MVP; gerente e funcionario reservados (RNF-20).';

create table identidade.dispositivo (
  id                      uuid primary key,
  usuario_id              uuid not null references identidade.usuario (id),
  nome                    text,
  ultima_sincronizacao_em timestamptz,
  criado_em               timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------
-- Schema financas (módulo Finanças)
-- ---------------------------------------------------------------------------------------

create table financas.categoria (
  id             uuid primary key,
  organizacao_id uuid not null references identidade.organizacao (id),
  tipo           text not null check (tipo in ('entrada', 'saida')),
  nome           text not null check (btrim(nome) <> ''),
  nome_chave     text generated always as (lower(financas.f_unaccent(btrim(nome)))) stored,
  icone          text,
  cor            text check (cor ~ '^#[0-9A-Fa-f]{6}$'),
  aplica_a       text not null default 'ambos' check (aplica_a in ('ambos', 'pessoal', 'empresa')),
  sistema        boolean not null default false,
  codigo         text check (codigo in ('servicos', 'produtos', 'mao_de_obra', 'reembolso')),
  ordem          int,
  ativa          boolean not null default true,
  versao         int not null default 1 check (versao >= 1),
  criado_em      timestamptz not null default now(),
  criado_por     uuid references identidade.usuario (id),
  alterado_em    timestamptz not null default now(),
  alterado_por   uuid references identidade.usuario (id)
);
comment on column financas.categoria.aplica_a is 'Reservado até a dúvida 13 da visão (categorias separadas Pessoal/Empresa).';
comment on column financas.categoria.codigo is
  'Identificador fixo das 4 categorias de sistema; nulo nas criadas pelo dono.';
-- F-16: nome único por organização e tipo, entre as ativas.
create unique index categoria_nome_chave_ativa_unico
  on financas.categoria (organizacao_id, tipo, nome_chave) where ativa;
create unique index categoria_codigo_unico
  on financas.categoria (organizacao_id, codigo) where codigo is not null;

create table financas.tipo_servico (
  id             uuid primary key,
  organizacao_id uuid not null references identidade.organizacao (id),
  nome           text not null check (btrim(nome) <> ''),
  nome_chave     text generated always as (lower(financas.f_unaccent(btrim(nome)))) stored,
  ordem          int,
  ativo          boolean not null default true,
  versao         int not null default 1 check (versao >= 1),
  criado_em      timestamptz not null default now(),
  criado_por     uuid references identidade.usuario (id),
  alterado_em    timestamptz not null default now(),
  alterado_por   uuid references identidade.usuario (id)
);
create unique index tipo_servico_nome_chave_ativo_unico
  on financas.tipo_servico (organizacao_id, nome_chave) where ativo;

create table financas.tipo_veiculo (
  id             uuid primary key,
  organizacao_id uuid not null references identidade.organizacao (id),
  nome           text not null check (btrim(nome) <> ''),
  nome_chave     text generated always as (lower(financas.f_unaccent(btrim(nome)))) stored,
  -- [SUPOSIÇÃO] Ícone genérico nos tipos criados pelo dono (catálogo em apps/mobile/src/icones).
  icone          text not null default 'veiculo',
  ordem          int,
  ativo          boolean not null default true,
  versao         int not null default 1 check (versao >= 1),
  criado_em      timestamptz not null default now(),
  criado_por     uuid references identidade.usuario (id),
  alterado_em    timestamptz not null default now(),
  alterado_por   uuid references identidade.usuario (id)
);
create unique index tipo_veiculo_nome_chave_ativo_unico
  on financas.tipo_veiculo (organizacao_id, nome_chave) where ativo;

create table financas.forma_pagamento (
  id             uuid primary key,
  organizacao_id uuid not null references identidade.organizacao (id),
  nome           text not null check (btrim(nome) <> ''),
  ordem          int,
  ativa          boolean not null default true,
  versao         int not null default 1 check (versao >= 1),
  criado_em      timestamptz not null default now(),
  criado_por     uuid references identidade.usuario (id),
  alterado_em    timestamptz not null default now(),
  alterado_por   uuid references identidade.usuario (id)
);

create table financas.preferencia_usuario (
  usuario_id      uuid primary key references identidade.usuario (id),
  natureza_padrao text not null default 'empresa' check (natureza_padrao in ('empresa', 'pessoal')),
  alterado_em     timestamptz not null default now(),
  versao          int not null default 1 check (versao >= 1)
);

create table financas.lancamento (
  id                   uuid primary key,
  -- Obrigatória em todo lançamento, inclusive Pessoal (F-05).
  unidade_id           uuid not null references identidade.unidade (id),
  tipo                 text not null check (tipo in ('entrada', 'saida')),
  natureza             text not null default 'empresa' check (natureza in ('empresa', 'pessoal')),
  -- Centavos, sempre positivo; bigint recusa texto com casas decimais.
  valor_centavos       bigint not null check (valor_centavos > 0),
  data_lancamento      date not null,
  categoria_id         uuid not null references financas.categoria (id),
  tipo_servico_id      uuid references financas.tipo_servico (id),
  tipo_veiculo_id      uuid references financas.tipo_veiculo (id),
  forma_pagamento_id   uuid not null references financas.forma_pagamento (id),
  descricao            text check (char_length(descricao) <= 200),
  situacao             text not null default 'realizado' check (situacao in ('realizado', 'previsto')),
  origem               text not null default 'manual'
                         check (origem in ('manual', 'atendimento', 'estoque', 'equipe', 'contas')),
  origem_ref_tabela    text,
  origem_ref_id        uuid,
  dispositivo_id       uuid not null references identidade.dispositivo (id),
  criado_em            timestamptz not null,
  criado_por           uuid not null references identidade.usuario (id),
  alterado_em          timestamptz not null,
  alterado_por         uuid not null references identidade.usuario (id),
  recebido_servidor_em timestamptz,
  versao               int not null default 1 check (versao >= 1),
  excluido_em          timestamptz,
  excluido_por         uuid references identidade.usuario (id)
);
comment on column financas.lancamento.situacao is 'Só realizado no MVP; previsto reservado para contas futuras (PIF-06).';
comment on column financas.lancamento.origem is 'manual no MVP; os demais reservados para os módulos futuros.';
comment on column financas.lancamento.criado_em is 'Hora do aparelho na criação.';
comment on column financas.lancamento.alterado_em is 'Hora do aparelho na última alteração.';
comment on column financas.lancamento.recebido_servidor_em is 'Hora do servidor ao receber.';

create index lancamento_unidade_data on financas.lancamento (unidade_id, data_lancamento);
create index lancamento_unidade_categoria_data on financas.lancamento (unidade_id, categoria_id, data_lancamento);
create index lancamento_unidade_veiculo_data on financas.lancamento (unidade_id, tipo_veiculo_id, data_lancamento);
create index lancamento_origem_ref on financas.lancamento (origem_ref_tabela, origem_ref_id);

-- Escrito só pelo back-end, na mesma transação da alteração (FIN-US-01.5).
create table financas.lancamento_historico (
  id                   uuid primary key default gen_random_uuid(),
  lancamento_id        uuid not null references financas.lancamento (id),
  acao                 text not null check (acao in ('criacao', 'alteracao', 'exclusao', 'restauracao')),
  dados_antes          jsonb,
  dados_depois         jsonb,
  campos_alterados     text[],
  alterado_por         uuid references identidade.usuario (id),
  alterado_em          timestamptz,
  dispositivo_id       uuid,
  recebido_servidor_em timestamptz not null default now(),
  conflito             boolean not null default false
);
create index lancamento_historico_lancamento on financas.lancamento_historico (lancamento_id);
