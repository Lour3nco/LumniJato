-- FIN-US-01.2 · Um schema Postgres por módulo do back-end (03-arquitetura §3.1 e §9.1).
-- Cada módulo é dono das suas tabelas. As tabelas entram na FIN-US-01.3; as permissões
-- (RLS sem políticas públicas e papel próprio da API) na FIN-US-01.4.
-- Nenhum destes schemas é exposto pela API pública do Supabase (config.toml, [api].schemas).

create schema if not exists identidade;
comment on schema identidade is
  'Módulo Identidade e Acesso: organização, unidades, usuários, vínculo usuário × unidade × papel, dispositivos.';

create schema if not exists financas;
comment on schema financas is
  'Módulo Finanças: lançamentos, histórico, categorias, tipos de serviço e de veículo, formas de pagamento, preferências.';
