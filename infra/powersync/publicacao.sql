-- FIN-US-07.10 · Publicação lógica que o PowerSync lê (replicação). RASCUNHO da prova de conceito.
--
-- NÃO é migração ainda: só vira migração (infra/supabase/migrations) se a prova de conceito
-- aprovar o PowerSync (FIN-US-07.1). Na prova, o DONO roda no SQL Editor do Supabase.
--
-- O papel de replicação `powersync_replicacao` já existe (migração 20261104000200, FIN-US-01.4),
-- só leitura. A senha dele é definida pelo dono, fora do git:
--   alter role powersync_replicacao with password '<senha forte gerada no gerenciador de senhas>';
--
-- Só as tabelas sincronizadas (a documentação do PowerSync recomenda listar em vez de
-- "FOR ALL TABLES"). Fonte: https://docs.powersync.com/installation/database-setup (04/11/2026).
create publication powersync for table
  identidade.organizacao,
  identidade.unidade,
  identidade.usuario,
  identidade.usuario_unidade,
  identidade.dispositivo,
  financas.categoria,
  financas.tipo_servico,
  financas.tipo_veiculo,
  financas.forma_pagamento,
  financas.lancamento,
  financas.lancamento_historico,
  financas.preferencia_usuario;
