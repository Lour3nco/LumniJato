-- FIN-US-01.6 · Dados iniciais (F-08, F-12, F-14, E2-02, E2-07, S-BL-09).
--
-- Duas partes, ambas idempotentes (rodar de novo não duplica nada, CA-01.6.4):
--
-- 1. `financas.carregar_dados_iniciais(organizacao)`: o catálogo comum a qualquer lava-jato —
--    categorias (as 4 de sistema + as iniciais), tipos de serviço, tipos de veículo e formas de
--    pagamento. Os nomes vêm dos requisitos; nenhum dado do dono.
--
-- 2. `identidade.implantar(...)`: a implantação de um dono — organização, unidades, perfil do
--    usuário e vínculo `dono` em cada unidade — e chama o catálogo. Os NOMES REAIS das unidades
--    e o e-mail do dono NÃO ficam no git: a equipe preenche uma cópia local de
--    infra/implantacao/implantacao.exemplo.sql na implantação (docs/dev/setup.md).
--
-- Nenhuma das funções pode ser chamada por `anon`/`authenticated` (só por quem administra o banco).

-- ---------------------------------------------------------------------------------------
-- Catálogo inicial de uma organização
-- ---------------------------------------------------------------------------------------
create or replace function financas.carregar_dados_iniciais(p_organizacao_id uuid)
  returns void
  language plpgsql
  set search_path = ''
as $$
begin
  -- Categorias. [SUPOSIÇÃO] ícones do catálogo do app (apps/mobile/src/icones) e cores.
  -- As 4 de sistema têm `codigo` e não podem ser desativadas (F-06, regra no back-end).
  insert into financas.categoria (id, organizacao_id, tipo, nome, icone, cor, sistema, codigo, ordem)
  select gen_random_uuid(), p_organizacao_id, c.tipo, c.nome, c.icone, c.cor, c.sistema, c.codigo, c.ordem
    from (values
      -- Entradas (visão §5.1; "Venda de produtos" é entrada, S-BL-09)
      ('entrada', 'Serviços',                   'servicos',        '#1B7F3B', true,  'servicos',    1),
      ('entrada', 'Venda de produtos',          'venda-produtos',  '#00695C', false, null,          2),
      ('entrada', 'Outros',                     'outras-entradas', '#455A64', false, null,          3),
      -- Saídas confirmadas (visão §5.1) e adicionais [SUPOSIÇÃO da visão]
      ('saida',   'Mão de obra',                'mao-de-obra',     '#6D4C41', true,  'mao_de_obra', 1),
      ('saida',   'Reembolso',                  'reembolso',       '#5E35B1', true,  'reembolso',   2),
      ('saida',   'Produtos',                   'produtos',        '#00838F', true,  'produtos',    3),
      ('saida',   'Alimentação',                'alimentacao',     '#E65100', false, null,          4),
      ('saida',   'Passagem',                   'passagem',        '#1565C0', false, null,          5),
      ('saida',   'Água',                       'agua',            '#0277BD', false, null,          6),
      ('saida',   'Energia',                    'energia',         '#F9A825', false, null,          7),
      ('saida',   'Aluguel',                    'aluguel',         '#8E24AA', false, null,          8),
      ('saida',   'Manutenção de equipamentos', 'manutencao',      '#546E7A', false, null,          9),
      ('saida',   'Outros',                     'outros',          '#616161', false, null,         10)
    ) as c (tipo, nome, icone, cor, sistema, codigo, ordem)
   where not exists (
     select 1 from financas.categoria x
      where x.organizacao_id = p_organizacao_id
        and x.tipo = c.tipo
        and (x.nome_chave = lower(financas.f_unaccent(btrim(c.nome))) or x.codigo = c.codigo)
   );

  -- Tipos de serviço [CONFIRMADO F-14]
  insert into financas.tipo_servico (id, organizacao_id, nome, ordem)
  select gen_random_uuid(), p_organizacao_id, s.nome, s.ordem
    from (values
      ('Lavagem rápida', 1),
      ('Lavagem completa', 2),
      ('Polimento', 3),
      ('Higienização interna', 4),
      ('Cristalização', 5)
    ) as s (nome, ordem)
   where not exists (
     select 1 from financas.tipo_servico x
      where x.organizacao_id = p_organizacao_id and x.nome_chave = lower(financas.f_unaccent(btrim(s.nome)))
   );

  -- Tipos de veículo, cada um com ícone próprio [CONFIRMADO E2-07]
  insert into financas.tipo_veiculo (id, organizacao_id, nome, icone, ordem)
  select gen_random_uuid(), p_organizacao_id, v.nome, v.icone, v.ordem
    from (values
      ('Carro', 'carro', 1),
      ('Moto', 'moto', 2),
      ('SUV', 'suv', 3),
      ('Caminhonete/Picape', 'picape', 4),
      ('Van', 'van', 5)
    ) as v (nome, icone, ordem)
   where not exists (
     select 1 from financas.tipo_veiculo x
      where x.organizacao_id = p_organizacao_id and x.nome_chave = lower(financas.f_unaccent(btrim(v.nome)))
   );

  -- Formas de pagamento, todas ativas [CONFIRMADO F-12]. Pix é a pré-seleção do primeiro
  -- lançamento, decidida no app (config_local), não aqui.
  insert into financas.forma_pagamento (id, organizacao_id, nome, ordem)
  select gen_random_uuid(), p_organizacao_id, f.nome, f.ordem
    from (values
      ('Dinheiro', 1),
      ('Pix', 2),
      ('Cartão de débito', 3),
      ('Cartão de crédito', 4)
    ) as f (nome, ordem)
   where not exists (
     select 1 from financas.forma_pagamento x
      where x.organizacao_id = p_organizacao_id and x.nome = f.nome
   );
end
$$;

comment on function financas.carregar_dados_iniciais(uuid) is
  'FIN-US-01.6: catálogo inicial (categorias, tipos de serviço e de veículo, formas de pagamento) de uma organização. Idempotente.';

-- ---------------------------------------------------------------------------------------
-- Implantação de um dono (organização, unidades, perfil, vínculos) — F-08, ST-07
-- ---------------------------------------------------------------------------------------
-- p_dono_usuario_id: o id do usuário criado no Supabase Auth (Authentication → Users).
-- p_unidades: nomes das unidades; o fuso é sempre America/Sao_Paulo no MVP.
create or replace function identidade.implantar(
  p_organizacao_nome text,
  p_unidades text[],
  p_dono_usuario_id uuid,
  p_dono_nome text,
  p_dono_email text
)
  returns uuid
  language plpgsql
  set search_path = ''
as $$
declare
  v_organizacao_id uuid;
  v_unidade text;
  v_unidade_id uuid;
begin
  if coalesce(array_length(p_unidades, 1), 0) = 0 then
    raise exception 'Informe pelo menos uma unidade.';
  end if;

  -- Organização: reaproveita a do dono, se ele já foi implantado.
  select u.organizacao_id into v_organizacao_id
    from identidade.usuario_unidade uu
    join identidade.unidade u on u.id = uu.unidade_id
   where uu.usuario_id = p_dono_usuario_id and uu.papel = 'dono'
   limit 1;
  if v_organizacao_id is null then
    v_organizacao_id := gen_random_uuid();
    insert into identidade.organizacao (id, nome) values (v_organizacao_id, p_organizacao_nome);
  end if;

  insert into identidade.usuario (id, nome, email)
  values (p_dono_usuario_id, p_dono_nome, p_dono_email)
  on conflict (id) do nothing;

  foreach v_unidade in array p_unidades loop
    insert into identidade.unidade (id, organizacao_id, nome)
    values (gen_random_uuid(), v_organizacao_id, btrim(v_unidade))
    on conflict (organizacao_id, nome) do nothing;

    select id into v_unidade_id
      from identidade.unidade
     where organizacao_id = v_organizacao_id and nome = btrim(v_unidade);

    insert into identidade.usuario_unidade (id, usuario_id, unidade_id, papel)
    values (gen_random_uuid(), p_dono_usuario_id, v_unidade_id, 'dono')
    on conflict (usuario_id, unidade_id) do nothing;
  end loop;

  perform financas.carregar_dados_iniciais(v_organizacao_id);
  return v_organizacao_id;
end
$$;

comment on function identidade.implantar(text, text[], uuid, text, text) is
  'FIN-US-01.6: implantação de um dono (organização, unidades, vínculo dono) + catálogo inicial. Idempotente.';

-- Só quem administra o banco executa (nunca anon/authenticated/api).
revoke all on function financas.carregar_dados_iniciais(uuid) from public, anon, authenticated;
revoke all on function identidade.implantar(text, text[], uuid, text, text) from public, anon, authenticated;
