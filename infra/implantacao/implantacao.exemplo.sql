-- FIN-US-01.6 · Implantação de um dono — MODELO COM DADOS FICTÍCIOS.
--
-- Como usar (equipe, na implantação; F-08):
-- 1. Crie a conta do dono no Supabase: Authentication → Users → Add user (e-mail, senha de 8+
--    caracteres, "Auto Confirm User"). Copie o "User UID" que aparece na lista.
-- 2. Copie este arquivo para `implantacao.local.sql` (o .gitignore impede que vá para o git) e
--    troque os valores fictícios abaixo pelos reais: nome do lava-jato, nomes das unidades,
--    UID, nome e e-mail do dono.
-- 3. Cole o conteúdo no SQL Editor do Supabase e rode. Pode rodar de novo sem medo: nada é
--    duplicado; unidades novas da lista são acrescentadas.
--
-- Nada de senha aqui: a senha do dono fica só no Supabase Auth.

select identidade.implantar(
  p_organizacao_nome => 'Lava-jato Exemplo',
  p_unidades         => array['Unidade Exemplo 1', 'Unidade Exemplo 2'],
  p_dono_usuario_id  => '00000000-0000-4000-8000-000000000001',
  p_dono_nome        => 'Dono Exemplo',
  p_dono_email       => 'dono@exemplo.com'
);
