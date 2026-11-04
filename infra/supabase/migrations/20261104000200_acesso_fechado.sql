-- FIN-US-01.4 · Fechar o acesso direto ao banco (03-arquitetura §3.5, RNF-18, RNF-19).
--
-- App e painel só chegam aos dados pelo NestJS e pela sincronização. Por isso:
-- 1. RLS ligada em TODAS as tabelas dos módulos, SEM nenhuma política para `anon` e
--    `authenticated`: pela API pública do Supabase (PostgREST), com a chave anônima ou com o
--    token do dono, não se lê nem se grava nada.
-- 2. Os papéis `anon` e `authenticated` perdem qualquer privilégio nos schemas `identidade` e
--    `financas` (defesa extra; estes schemas também NÃO entram em "Exposed schemas" da Data API).
-- 3. Papel próprio da API, `api_lavajato`: só nos schemas dos módulos, com BYPASSRLS, sem
--    DELETE (exclusão é lógica, RNF-15) e sem poder alterar o histórico.
-- 4. Papel só de leitura para a replicação do PowerSync, `powersync_replicacao`.
--
-- SENHAS: os papéis nascem SEM senha. Quem define é o dono, no painel do Supabase (SQL Editor),
-- fora do git — passo a passo em docs/dev/setup.md.

-- ---------------------------------------------------------------------------------------
-- 1. RLS em todas as tabelas, sem políticas
-- ---------------------------------------------------------------------------------------
do $$
declare
  tabela record;
begin
  for tabela in
    select schemaname, tablename from pg_tables where schemaname in ('identidade', 'financas')
  loop
    execute format('alter table %I.%I enable row level security', tabela.schemaname, tabela.tablename);
  end loop;
end
$$;

-- ---------------------------------------------------------------------------------------
-- 2. Nada para anon e authenticated (nem agora, nem em tabelas futuras)
-- ---------------------------------------------------------------------------------------
revoke all on schema identidade, financas from public, anon, authenticated;
revoke all on all tables in schema identidade, financas from public, anon, authenticated;
revoke all on all sequences in schema identidade, financas from public, anon, authenticated;
revoke all on all functions in schema identidade, financas from public, anon, authenticated;

alter default privileges in schema identidade, financas revoke all on tables from public, anon, authenticated;
alter default privileges in schema identidade, financas revoke all on sequences from public, anon, authenticated;
alter default privileges in schema identidade, financas revoke all on functions from public, anon, authenticated;

-- ---------------------------------------------------------------------------------------
-- 3. Papel da API NestJS
-- ---------------------------------------------------------------------------------------
do $$
begin
  if not exists (select from pg_roles where rolname = 'api_lavajato') then
    create role api_lavajato with login bypassrls noinherit nocreatedb nocreaterole;
  end if;
end
$$;
comment on role api_lavajato is 'Papel da API NestJS: só os schemas dos módulos (FIN-US-01.4). Senha definida fora do git.';

grant usage on schema identidade, financas to api_lavajato;
-- A coluna nome_chave usa extensions.unaccent (F-16).
grant usage on schema extensions to api_lavajato;
grant execute on function financas.f_unaccent(text) to api_lavajato;

grant select, insert, update on all tables in schema identidade, financas to api_lavajato;
-- Histórico: só acrescenta e lê (RNF-14).
revoke update on financas.lancamento_historico from api_lavajato;

alter default privileges in schema identidade, financas grant select, insert, update on tables to api_lavajato;

-- ---------------------------------------------------------------------------------------
-- 4. Papel de replicação do PowerSync (só leitura)
-- ---------------------------------------------------------------------------------------
do $$
begin
  if not exists (select from pg_roles where rolname = 'powersync_replicacao') then
    create role powersync_replicacao with login replication bypassrls noinherit nocreatedb nocreaterole;
  end if;
end
$$;
comment on role powersync_replicacao is 'Replicação do PowerSync: só leitura (FIN-US-01.4). Senha definida fora do git.';
-- Qualquer transação deste papel é somente leitura, mesmo que alguém conceda mais privilégios.
alter role powersync_replicacao set default_transaction_read_only = on;

grant usage on schema identidade, financas to powersync_replicacao;
grant select on all tables in schema identidade, financas to powersync_replicacao;
alter default privileges in schema identidade, financas grant select on tables to powersync_replicacao;
