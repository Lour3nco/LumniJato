-- Sugestão da Arquitetura (passo 5) · Mínimo privilégio para o papel da API (FIN-US-01.4).
--
-- No MVP, organização, unidades, usuários e vínculos são cadastrados pela equipe na implantação
-- (F-08, ST-07; função identidade.implantar, rodada por quem administra o banco). A API só LÊ
-- essas tabelas; no schema identidade ela grava apenas `dispositivo` (registro do aparelho na
-- primeira sincronização, CA-01.13.6). Em `financas` continua com SELECT, INSERT e UPDATE
-- (sem DELETE e sem UPDATE no histórico, migração 20261104000200).
--
-- Quando houver telas de gestão de unidades e usuários (FIN-US-08.5, pós-MVP), uma migração
-- nova concede só o que elas precisarem.

revoke insert, update on
  identidade.organizacao,
  identidade.unidade,
  identidade.usuario,
  identidade.usuario_unidade
from api_lavajato;

-- Tabelas novas do schema identidade nascem só com leitura para a API.
alter default privileges in schema identidade revoke insert, update on tables from api_lavajato;
