# Módulo 1 — Gestão de Finanças · Backlog

Projeto: Lavajato Sistema
Documento: 04-backlog.md · Autor: Agente Dev · Versão: 8 · Status: **rascunho para revisão** (v2: filtro por tipo de serviço no Extrato, FIN-US-04.7, pedido pelo QA em D-QA-03; registro de que "Produtos" é categoria de saída · v3: E2-04 respondida, opção a — veículo obrigatório, tipo de serviço opcional; FIN-US-02.12 desbloqueada e "Sem tipo de serviço" no Resumo e no filtro do Extrato · v4: decisões finais do dono F-06, F-12, F-13 e F-15 (visão §9c); FIN-US-07.7 vai para a v1.1 · v5: F-02 MVP completo, F-03 só Android, F-05 todo lançamento pertence a uma unidade · v6: F-04 APK com instalação direta, F-08 unidades e formas de pagamento na implantação, F-09 histórico e lixeira (90 dias) no MVP, F-10 sem PIN/biometria · v7: alinhamento com o 02-design v7 (TELA-15 Histórico, TELA-16 Lixeira) e D-QA-15 a D-QA-18 · v8: nova stack (NestJS com DDD e monólito modular, sincronização pelo NestJS, painel web Next.js Pós-MVP), F-03b, F-14 e F-16; reestimativa)
Fontes: `01-visao.md` (v3, com as seções 9b, 9c e 9d), `02-design.md` (v4), `03-arquitetura.md` (v1). Em caso de conflito, vale a visão.

> Convenção: **[CONFIRMADO]** veio do dono · **[SUPOSIÇÃO]** não validado · **[DÚVIDA]** precisa de resposta antes de virar regra.
> Pontos: escala 1, 2, 3, 5, 8 (esforço relativo, não horas). Persona "Dono" = usuário único do MVP (D-02). Persona "equipe de desenvolvimento" = histórias técnicas.
> Abreviações nas tabelas: **Pts** = pontos · **Dep.** = dependências · **Fase** = MVP ou Pós-MVP.

---

## 1. Visão geral do backlog

O backlog transforma a visão, o design e a arquitetura do Módulo 1 em **88 histórias** distribuídas em **10 épicos**:

| | Histórias | Pontos |
|---|---|---|
| MVP | 73 | 215 |
| Pós-MVP | 15 | 42 |
| **Total** | **88** | **257** |
| Contingência (fora dos totais; só se a prova de conceito reprovar o PowerSync) | 1 | 8 (+3 no MVP, porque substitui a FIN-US-07.1) |
| Descartada pelo dono (fora dos totais) | 1 | 2 |

**Escopo do MVP [CONFIRMADO, F-02]:** o dono escolheu o **MVP completo**, entregue nos marcos M1 → M2 → M3 do `06-roadmap.md`, com as 73 histórias MVP deste backlog. O "MVP mínimo" do roadmap fica registrado só como alternativa descartada. A plataforma do MVP é **só Android** [CONFIRMADO, F-03], distribuída como **APK instalado direto no celular do dono, sem Google Play** [CONFIRMADO, F-04].

**Nova stack, aplicada na v8 [CONFIRMADO, visão §9c e §9d; 03-arquitetura §2 e §9]:** app React Native/Expo (Android, APK, sem internet, SQLite); back-end **NestJS com DDD, Clean Architecture e monólito modular**, dono das regras de domínio; Supabase (Postgres) como banco central, com a API pública fechada; **toda escrita do celular passa pelo NestJS** (`POST /sync/upload`); PowerSync no plano gratuito se a prova de conceito aprovar, senão sincronização própria; **só planos gratuitos** e backup próprio semanal (F-03b); painel web Next.js **só de consulta e Pós-MVP** (ST-06, novo épico FIN-EP-10). Efeito na estimativa: o MVP sobe de 175 para **215 pontos** (+40), porque a camada de back-end (API base, Identidade e Acesso, domínio e casos de uso de Finanças, módulo Sincronização, testes de API, hospedagem) agora é explícita: 11 histórias técnicas novas (+43), RLS mais simples (−3), FIN-US-02.12 (−1) e revisão de segurança (+1). Na versão anterior essas regras estavam em gatilhos e políticas RLS no Postgres.

**Decisões aplicadas na v6 [CONFIRMADO, visão §9c]:** F-09 — o histórico de alterações (FIN-US-06.4) e a lixeira com 90 dias (FIN-US-06.5) entram no MVP (+8 pontos); F-10 — sem PIN nem biometria, a FIN-US-09.7 foi descartada (−2 pontos do Pós-MVP); F-08 — unidades e formas de pagamento vêm dos dados iniciais, e as telas de gestão (FIN-US-08.5, FIN-US-03.6) continuam como evolução; F-04 — a FIN-US-09.6 passa a gerar APK com atualização pelo app.

Ordem sugerida de construção (respeitando as dependências):

1. **Base técnica (início do M1):** monorepo, Supabase, esquema e dados iniciais, API NestJS base e prova de conceito do PowerSync (FIN-US-07.10) primeiro; depois Identidade e Acesso, domínio e casos de uso de Finanças, módulo Sincronização e PowerSync ou a contingência (FIN-EP-01, FIN-EP-07). Sem isso nada é salvo nem sincronizado.
2. **Lançar:** valor estilo caixa registradora, campos comuns, saída, entrada de serviço, outras entradas (FIN-EP-02), com cadastros mínimos vindos dos dados iniciais.
3. **Ver:** saldo na Início, Extrato com período e filtros, Resumo (FIN-EP-04, FIN-EP-05).
4. **Corrigir e gerenciar:** detalhe, editar, excluir, histórico e lixeira (FIN-EP-06); telas de cadastro (FIN-EP-03); Ajustes (FIN-EP-08).
5. **Fechar o MVP:** sincronização completa com erros (FIN-EP-07), segurança, backup semanal, desempenho, hospedagem da API e APK (FIN-EP-09).
6. **Depois do MVP:** painel web de consulta (FIN-EP-10), v1.1 e evoluções.

Pontos de atenção:

- **E2-04 / DU-12 (serviço × veículo) foi respondida pelo dono: opção a.** Numa entrada de serviço, o **tipo de veículo é obrigatório** e o **tipo de serviço é opcional**. "Entrada de serviço" passa a ser a entrada da categoria de sistema "Serviços" (não mais "entrada com tipo de serviço preenchido"). A regra está na FIN-US-02.12, agora desbloqueada; o Resumo (FIN-US-05.4) e o filtro do Extrato (FIN-US-04.7) ganham "Sem tipo de serviço" [SUPOSIÇÃO].
- **Decisões finais do dono (visão §9c), aplicadas na v4:** F-06 — as 4 categorias de sistema podem ser renomeadas, mas não desativadas (FIN-US-03.2); F-12 — as quatro formas de pagamento ficam, com Pix marcado no primeiro lançamento (FIN-US-01.6, FIN-US-02.2; responde D-QA-02); F-13 — editar não troca o tipo do lançamento (FIN-US-06.2); F-15 — o dono usa um celular só, então o conflito entre aparelhos (FIN-US-07.7, 3 pts) sai do MVP e vai para a v1.1. A `versao` e o histórico no servidor continuam no MVP (FIN-US-01.5), para proteger uma troca futura de aparelho.
- O protótipo de referência (E2-01) ainda **não tem** tipo de veículo, "+ Novo veículo", TELA-14, filtro por veículo nem calendário de período (02-design §8.3). As histórias desses itens seguem os wireframes e o texto do 02-design.

---

## 2. Épicos

| ID | Épico | Objetivo | Histórias MVP | Pontos MVP | Pontos Pós-MVP |
|---|---|---|---|---|---|
| FIN-EP-01 | Fundação | Monorepo, app, banco central, esquema, dados iniciais, login, navegação, componentes base; API NestJS com Identidade e Acesso e o domínio de Finanças (DDD, Clean Architecture); testes de API | 17 | 58 | 2 |
| FIN-EP-02 | Lançamentos | Lançar saída, entrada de serviço carro por carro e outras entradas em ≤ 4 toques | 12 | 32 | 0 |
| FIN-EP-03 | Cadastros | Categorias (4 de sistema + novas), tipos de serviço, tipos de veículo e formas de pagamento | 5 | 16 | 6 |
| FIN-EP-04 | Extrato e filtros | Lista de lançamentos com período (atalhos + calendário), unidade, categoria, tipo de serviço, veículo e Pessoal/Empresa | 7 | 21 | 0 |
| FIN-EP-05 | Resumo | Entrou/Saiu/Sobrou, gastos por categoria, entradas por tipo de serviço e por tipo de veículo | 6 | 17 | 3 |
| FIN-EP-06 | Correção e histórico | Detalhe, editar, excluir (lógico), histórico de alterações e lixeira de 90 dias | 5 | 15 | 0 |
| FIN-EP-07 | Funcionamento offline e sincronização | Banco local, prova de conceito do PowerSync, módulo Sincronização no NestJS, sincronização automática e por botão, pendências, erros; conflitos entre aparelhos na v1.1 | 10 | 32 | 3 |
| FIN-EP-08 | Ajustes e preferências | Tela Mais/Ajustes, padrão Pessoal/Empresa, unidade atual, período compartilhado | 4 | 9 | 3 |
| FIN-EP-09 | Segurança, privacidade e operação | Sair da conta, backup semanal próprio, LGPD, revisão de segurança, desempenho, hospedagem da API, distribuição por APK | 7 | 15 | 1 |
| FIN-EP-10 | Painel web de consulta | Painel Next.js só de consulta (WEB-01 a WEB-06), depois do MVP | 0 | 0 | 24 |

**Ajustes em relação à sugestão do Orquestrador:**

- **Novo épico FIN-EP-09 (Segurança, privacidade e operação).** Os RNF de backup (RNF-16), LGPD (RNF-22 a RNF-26), revisão de segurança (RNF-18, RNF-21), desempenho medido (RNF-09 a RNF-12) e publicação do app (RNF-02) não cabiam em nenhum épico funcional. Sem um épico próprio, ficariam sem dono e sem estimativa.
- **"Unidade atual" saiu da Fundação e foi para Ajustes (FIN-EP-08)**, como a própria sugestão indicava para "unidade atual". A Fundação fica com as unidades no banco, os dados iniciais e o vínculo usuário × unidade × papel.
- **Novo épico FIN-EP-10 (Painel web de consulta), na v8.** O painel é outro produto (Next.js, sempre com internet, só leitura) e entra todo depois do MVP (ST-06); separado, não mistura pontos Pós-MVP do app com os do painel.
- **O back-end NestJS ficou na Fundação (FIN-EP-01) e na Sincronização (FIN-EP-07)**, e não num épico próprio, porque cada história técnica serve diretamente às histórias do app desses épicos (domínio e casos de uso em FIN-EP-01; endpoint de envio em FIN-EP-07).
- **Os elementos da TELA-01 (Início) ficaram divididos por assunto:** botões de lançamento e "Repetir" em Lançamentos, últimos 5 lançamentos em Extrato, cartão de saldo em Resumo, indicador de sincronização em Sincronização. Não há épico "Início" porque a tela é um painel de partes que têm dono em outros épicos.
- **Detalhe do lançamento (TELA-07)** está em Correção e histórico, porque é a porta de entrada para editar e excluir.

---

## 3. Histórias

### FIN-EP-01 — Fundação

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-01.1 | Como equipe de desenvolvimento, quero criar o app React Native com Expo (TypeScript) em `apps/mobile` do monorepo, com a estrutura de pastas e a navegação com barra inferior (Início · Extrato · Resumo · Mais), para ter a base onde todas as telas serão montadas. | 3 | FIN-US-01.11 | MVP | TELA-01, TELA-05, TELA-06, TELA-09 (casca) | — | RNF-01, RNF-12 |
| FIN-US-01.2 | Como equipe de desenvolvimento, quero criar o projeto Supabase (plano gratuito [CONFIRMADO, F-03b]) na região São Paulo (sa-east-1), com um schema Postgres por módulo (`identidade`, `financas`) e migrações SQL versionadas em `infra/supabase/migrations`, para que o banco central seja reproduzível e nenhuma estrutura seja alterada à mão em produção. | 2 | FIN-US-01.11 | MVP | — | — | RNF-23, RNF-27 |
| FIN-US-01.3 | Como equipe de desenvolvimento, quero criar o esquema do banco (organizacao, unidade, usuario, usuario_unidade, dispositivo no schema `identidade`; categoria, tipo_servico, tipo_veiculo, forma_pagamento, lancamento, lancamento_historico, preferencia_usuario no schema `financas`), com valores em centavos, restrições `check`, FKs, campos de auditoria, `versao`, exclusão lógica, `categoria.codigo` das categorias de sistema, coluna gerada `nome_chave` com a função imutável sobre `unaccent` e índice único parcial entre os ativos [CONFIRMADO, F-16], campos reservados (`situacao`, `origem`, `origem_ref_*`, `aplica_a`) e índices de 03-arquitetura §3, para que o banco seja a última barreira mesmo que o domínio já tenha validado. As regras de domínio (E2-04, F-13, F-06, lixeira) ficam no back-end (FIN-US-01.14, FIN-US-01.16), não em gatilhos. | 5 | FIN-US-01.2 | MVP | — | — | RNF-13, RNF-15, RNF-24, RNF-27 |
| FIN-US-01.4 | Como equipe de desenvolvimento, quero fechar o acesso direto ao banco: RLS ligada em todas as tabelas **sem nenhuma política** para `anon` e `authenticated`, um papel próprio do Postgres para a API (`api_lavajato`, só nos schemas dos módulos) e um papel só de leitura para a replicação do PowerSync, com um teste automatizado de que a API pública do Supabase (chave anônima ou token de usuário) não lê nem grava nada, para que app e painel só cheguem aos dados pelo NestJS e pela sincronização (03-arquitetura §3.5). **Pontos: de 5 para 2**, porque as permissões por unidade e papel saíram das políticas RLS e foram para o NestJS (FIN-US-01.13). | 2 | FIN-US-01.3 | MVP | — | — | RNF-18, RNF-19 |
| FIN-US-01.5 | Como equipe de desenvolvimento, quero que o back-end grave `lancamento_historico` (criação, alteração, exclusão, restauração, com antes/depois e campos alterados) **na mesma transação** da alteração, a partir dos eventos de domínio do `Lancamento`, e preencha `versao` (+1 a cada alteração aceita) e `recebido_servidor_em`, sem nenhum caso de uso que grave ou apague histórico a pedido do cliente, para que toda mudança fique rastreável. Substitui os gatilhos no Postgres da versão anterior (ST-04: regras no back-end). | 3 | FIN-US-01.12, FIN-US-01.14 | MVP | — | JOR-h | RNF-13, RNF-14 |
| FIN-US-01.6 | Como equipe de desenvolvimento, quero carregar os dados iniciais (migração versionada): a organização, as unidades do dono e o vínculo dono × unidades [CONFIRMADO, F-08]; as 4 categorias de sistema com `codigo` (`servicos`, `produtos`, `mao_de_obra`, `reembolso`) e as demais categorias iniciais; os tipos de serviço **Lavagem rápida, Lavagem completa, Polimento, Higienização interna, Cristalização** [CONFIRMADO, F-14]; os tipos de veículo Carro, Moto, SUV, Caminhonete/Picape, Van (com ícone); e as formas de pagamento Dinheiro, Pix, Cartão de débito, Cartão de crédito (todas ativas [CONFIRMADO, F-12]), com `nome_chave` gerado sem repetição, para que o dono possa lançar desde o primeiro acesso. | 2 | FIN-US-01.3 | MVP | TELA-02, TELA-03, TELA-04, TELA-08 | JOR-a, JOR-b, JOR-d | — |
| FIN-US-01.7 | Como Dono, quero entrar com e-mail e senha (Supabase Auth) e continuar conectado, para usar o app e a nuvem sem precisar entrar de novo a cada vez, inclusive sem internet. O mesmo token (JWT) é usado nas chamadas à API NestJS e ao PowerSync, e é renovado sozinho; o painel web futuro usa a mesma conta. | 3 | FIN-US-01.1, FIN-US-01.2 | MVP | TELA-13 | — (primeiro uso) | RNF-04, RNF-18, RNF-21 |
| FIN-US-01.8 | Como Dono, no primeiro uso quero ver uma tela curta de boas-vindas, escolher a unidade inicial e ter os dados baixados para o celular, para começar a lançar logo e poder ficar sem internet depois. | 2 | FIN-US-01.7, FIN-US-07.1, FIN-US-08.3 | MVP | TELA-01 (primeiro uso), TELA-08 | — (primeiro uso) | RNF-04 |
| FIN-US-01.9 | Como equipe de desenvolvimento, quero os componentes base de interface (botões grandes, chips, aviso inferior, folha inferior, grade de ícones, item de lista), o catálogo de ícones, a formatação `R$ 1.234,56` e de datas ("Hoje", "Ontem", `03/11`) e rótulos para leitor de tela, para que todas as telas sigam as diretrizes de 02-design §5. | 3 | FIN-US-01.1 | MVP | todas | — | RNF-01 |
| FIN-US-01.10 | Como equipe de desenvolvimento, quero uma tabela de saída (outbox) no Postgres para entregar os eventos de domínio de Finanças (`LancamentoRegistrado`, `LancamentoAlterado`, `LancamentoExcluido`/`Restaurado`, `TipoServicoAlterado`, `TipoVeiculoAlterado`, `CategoriaAlterada`) a outros módulos com garantia de entrega, para que módulos futuros possam reagir. No MVP os eventos já existem dentro do processo (FIN-US-01.14) e o único consumidor é o histórico; a outbox só entra com o primeiro módulo consumidor (03-arquitetura §9.4). | 2 | FIN-US-01.15 | Pós-MVP | — | — | — |
| FIN-US-01.11 | Como equipe de desenvolvimento, quero o monorepo (pnpm workspaces + Turborepo [SUPOSIÇÃO]) com `apps/mobile`, `apps/api`, `packages/dominio-compartilhado`, `packages/contratos` e `infra/` (`supabase/`, `powersync/`, `backup/`), lint de fronteiras entre módulos do back-end (ex.: dependency-cruiser) e integração contínua rodando lint, testes e verificação de tipos a cada mudança, para que app, API e pacotes compartilhados evoluam juntos sem quebrar as fronteiras do monólito modular. `apps/painel` só entra no Pós-MVP (FIN-EP-10). | 3 | — | MVP | — | — | RNF-27 |
| FIN-US-01.12 | Como equipe de desenvolvimento, quero a base da API NestJS em `apps/api`: kernel compartilhado (`Id` UUID v7, `Dinheiro`, `DataLocal`, `EventoDeDominio`, `Resultado`/erros de domínio, unidade de trabalho com transação, barramento de eventos interno), conexão ao Postgres com o papel `api_lavajato` e query builder tipado [SUPOSIÇÃO: Drizzle ou Kysely], validação de entrada (zod), mapeamento de erros de domínio para HTTP (422, 403, 409), configuração por variáveis de ambiente e rota de saúde, para que os módulos tenham onde se apoiar seguindo a Clean Architecture (03-arquitetura §9.1 e §9.3). | 5 | FIN-US-01.11, FIN-US-01.2 | MVP | — | — | RNF-18, RNF-27 |
| FIN-US-01.13 | Como equipe de desenvolvimento, quero o módulo **Identidade e Acesso** no NestJS: guarda global que valida o JWT do Supabase Auth em toda chamada, carrega o `usuario` e seus vínculos ativos, política de acesso `temPapel(usuario, unidade, papeis)` exportada só pela interface pública do módulo, registro do `dispositivo`, e um teste automatizado com dois usuários de unidades diferentes em que nenhum lê nem altera dado do outro pela API, para que as permissões por unidade e papel fiquem num só lugar (03-arquitetura §3.5). No MVP só existe o papel `dono`; papéis novos entram como regras novas, sem mudar tabelas. | 5 | FIN-US-01.12, FIN-US-01.3 | MVP | — | — | RNF-18, RNF-19, RNF-20 |
| FIN-US-01.14 | Como equipe de desenvolvimento, quero o **domínio do lançamento** no módulo Finanças (TypeScript puro, sem NestJS nem banco): agregado `Lancamento` com os objetos de valor `Dinheiro`, `TipoLancamento`, `Natureza`, `DataLancamento`, `ClassificacaoServico`, `Exclusao`, as invariantes (valor > 0 e ≤ máximo; data não futura no fuso da unidade; categoria do mesmo tipo e ativa na criação; veículo obrigatório e serviço opcional em "Serviços", E2-04; edição não troca o tipo nem entra ou sai de "Serviços", F-13; excluído não é editado; restaurar só até 90 dias, F-09) e os eventos de domínio, com testes unitários de cada invariante, para que a regra que vale seja a do back-end (ST-04). | 5 | FIN-US-01.12, FIN-US-01.17 | MVP | — | JOR-a, JOR-b, JOR-d, JOR-h | RNF-13, RNF-15 |
| FIN-US-01.15 | Como equipe de desenvolvimento, quero os casos de uso `RegistrarLancamento`, `EditarLancamento`, `ExcluirLancamento` e `RestaurarLancamento` (camada de aplicação), com autorização pelo Identidade e Acesso, repositório Postgres, referências recusadas quando são de outra organização, "repetição com o mesmo conteúdo é aceita sem duplicar" (idempotência, §4.1) e histórico gravado na mesma transação, para que toda escrita de lançamento vinda do app passe pelas regras do domínio. | 5 | FIN-US-01.14, FIN-US-01.13, FIN-US-01.5 | MVP | — | JOR-a, JOR-b, JOR-d, JOR-h | RNF-08, RNF-14, RNF-19 |
| FIN-US-01.16 | Como equipe de desenvolvimento, quero os agregados e casos de uso de **cadastros e preferências** no módulo Finanças: `Categoria` (criar, renomear, trocar ícone e cor, desativar, reativar, reordenar; categoria de sistema não desativa, F-06; tipo não muda), `TipoServico` e `TipoVeiculo` (criar, renomear, desativar, reativar, reordenar; ícone genérico no veículo novo), `FormaPagamento` (só leitura no MVP, F-08) e `DefinirNaturezaPadrao`, todos com **nome único normalizado** pelo objeto de valor `NomeNormalizado` [CONFIRMADO, F-16], com testes unitários, para que as regras de cadastro valham também quando o app estiver desatualizado. | 5 | FIN-US-01.12, FIN-US-01.13, FIN-US-01.17 | MVP | TELA-02, TELA-09, TELA-10, TELA-11, TELA-14 | JOR-b, JOR-i | RNF-20 |
| FIN-US-01.17 | Como equipe de desenvolvimento, quero o pacote `dominio-compartilhado` (funções puras: `normalizarNome` — minúsculas, sem acentos, sem espaços nas pontas [CONFIRMADO, F-16] —, `Dinheiro` em centavos e as validações de lançamento repetidas no app) e o pacote `contratos` (esquemas zod das operações de sincronização e das respostas), para que o app avise o dono antes de salvar, inclusive sem internet, do mesmo jeito que a API decide. | 2 | FIN-US-01.11 | MVP | TELA-02, TELA-03, TELA-04, TELA-10, TELA-11, TELA-14 | — | RNF-03 |
| FIN-US-01.18 | Como equipe de desenvolvimento, quero testes de API automatizados contra um Postgres de teste, rodando na integração contínua: `POST /sync/upload` com lançamentos válidos e inválidos (E2-04, F-13, F-16, F-06, data futura, valor zero, restaurar após 90 dias), respostas por operação (aceita, 422, 403), reenvio idempotente, histórico gravado na mesma transação e isolamento entre dois usuários de unidades diferentes, para que regras e permissões do back-end não regridam. | 3 | FIN-US-01.15, FIN-US-01.16, FIN-US-07.11 | MVP | — | — | RNF-08, RNF-14, RNF-19 |

### FIN-EP-02 — Lançamentos

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-02.1 | Como Dono, quero digitar o valor no teclado numérico que abre sozinho, no estilo caixa registradora (dígitos entram nos centavos; ⌫ apaga o último; segurar ⌫ zera; começa em R$ 0,00 cinza), para lançar o valor sem pensar em vírgula. Valor zero não salva; máximo R$ 999.999,99; acima de R$ 10.000,00 pede "Confere?" [SUPOSIÇÃO de limites]. O valor é guardado em centavos inteiros. | 3 | FIN-US-01.9 | MVP | TELA-02, TELA-03, TELA-04 | JOR-a, JOR-b, JOR-d | RNF-10 |
| FIN-US-02.2 | Como Dono, quero que os campos comuns do lançamento já venham preenchidos (Pessoal/Empresa no dropdown com o padrão; data = hoje no fuso da unidade, sem dias futuros; unidade = unidade atual, obrigatória em todo lançamento, inclusive Pessoal [CONFIRMADO, F-05], e escolhida à mão quando "Todas as unidades" está ativo; forma de pagamento = **Pix** no primeiro lançamento e, nos seguintes, a última usada [CONFIRMADO, F-12] (a última usada é guardada por tipo de lançamento [SUPOSIÇÃO, SUP-D02]); descrição opcional recolhida, até 200 caracteres [SUPOSIÇÃO]), para só tocar no que for diferente. | 5 | FIN-US-01.9, FIN-US-01.6, FIN-US-08.2, FIN-US-08.3 | MVP | TELA-02, TELA-03, TELA-04 | JOR-a, JOR-b, JOR-d, JOR-j | RNF-10, RNF-24 |
| FIN-US-02.3 | Como Dono, quero lançar uma saída escolhendo o valor e a categoria por ícone (7 primeiras ativas + "Outros/•••") e tocando Salvar, para registrar um gasto em 3 toques + valor. Salvar fica desabilitado sem valor ou categoria ("Escolha a categoria"); grava só no banco local, com usuário, unidade e aparelho. | 3 | FIN-US-02.1, FIN-US-02.2, FIN-US-07.2 | MVP | TELA-03 | JOR-a | RNF-03, RNF-09, RNF-13 |
| FIN-US-02.4 | Como Dono, quero lançar outra entrada (não serviço), com as categorias de entrada sem "Serviços" e cor verde, para registrar, por exemplo, uma venda de produto (categoria de entrada "Venda de produtos", não a categoria de sistema "Produtos", que é de saída) em 3 toques + valor. | 2 | FIN-US-02.3 | MVP | TELA-04 | JOR-d | RNF-03, RNF-09 |
| FIN-US-02.5 | Como Dono, quero lançar a entrada de um serviço carro por carro, escolhendo o tipo de serviço na grade (opcional), o tipo de veículo na fileira (obrigatório) (último veículo usado já marcado e bem destacado), digitando o valor e a forma de pagamento, para registrar cada lavagem em 3 a 4 toques + valor. A categoria "Serviços" é definida sozinha; não há preço cadastrado. A validação de obrigatoriedade (veículo obrigatório, serviço opcional, E2-04 a) está na FIN-US-02.12. | 5 | FIN-US-02.1, FIN-US-02.2, FIN-US-07.2 | MVP | TELA-02 | JOR-b | RNF-03, RNF-09, RNF-10 |
| FIN-US-02.6 | Como Dono, quero criar um tipo de serviço novo pelo botão "+ Novo serviço" dentro do lançamento (folha só com o Nome), já selecionado ao salvar, para não sair do lançamento. Nome repetido de serviço ativo é recusado, comparando sem diferença de maiúsculas, acentos e espaços nas pontas ("lavagem rapida" = "Lavagem rápida") [CONFIRMADO, F-16]; o app avisa na hora, inclusive sem internet (`normalizarNome`), e o back-end confirma (FIN-US-01.16). Nome de serviço desativado oferece "Reativar e usar" [SUPOSIÇÃO]. O novo entra no fim da ordem. | 3 | FIN-US-02.5, FIN-US-01.17 | MVP | TELA-02 | JOR-b (variação) | RNF-03 |
| FIN-US-02.7 | Como Dono, quero criar um tipo de veículo novo pelo botão "+ Novo veículo" no fim da fileira (folha só com o Nome, ícone genérico), já selecionado ao salvar, com as mesmas regras de nome repetido normalizado [CONFIRMADO, F-16] e reativação, para lançar um veículo que não está na lista [SUPOSIÇÃO, visão 3b-1]. | 2 | FIN-US-02.6 | MVP | TELA-02 | JOR-b (variação) | RNF-03 |
| FIN-US-02.8 | Como Dono, depois de salvar quero voltar à Início com o saldo atualizado e ver um aviso de ~5 s ("Saída de R$ 25,00 salva · Desfazer"; nos serviços, com serviço e veículo), para conferir e desfazer um erro na hora. Desfazer faz exclusão lógica (o registro continua no servidor, com histórico), mas **não manda o lançamento para a Lixeira**, porque é a correção imediata de um engano [SUPOSIÇÃO, D-QA-18]. | 2 | FIN-US-02.3 | MVP | TELA-01 | JOR-a, JOR-b, JOR-d, JOR-h | RNF-09 |
| FIN-US-02.9 | Como Dono, quero lançar vários carros em sequência com "Mais um igual" (no aviso) e "Repetir: serviço · veículo · forma" (na Início), que trazem tipo de serviço, tipo de veículo e forma de pagamento do anterior e nunca o valor, para gastar só 2 toques + valor por carro [SUPOSIÇÃO, visão 3c]. "Repetir" mostra o último serviço de hoje na unidade atual; sem ele, não aparece. | 3 | FIN-US-02.5, FIN-US-02.8 | MVP | TELA-01, TELA-02 | JOR-c | RNF-10 |
| FIN-US-02.10 | Como Dono, ao fechar um formulário com dados preenchidos quero a pergunta "Descartar este lançamento?", para não perder um lançamento por toque acidental. | 1 | FIN-US-02.2 | MVP | TELA-02, TELA-03, TELA-04 | JOR-a, JOR-b, JOR-d | — |
| FIN-US-02.11 | Como Dono, quero os botões grandes **+ Carro**, **+ Entrou** e **− Saiu** fixos na parte de baixo da Início, na zona do polegar, para começar qualquer lançamento com 1 toque. | 1 | FIN-US-01.1, FIN-US-01.9 | MVP | TELA-01 | JOR-a, JOR-b, JOR-d | RNF-01, RNF-10 |
| FIN-US-02.12 | Como Dono, quero que, numa entrada de serviço (categoria de sistema "Serviços"), o **tipo de veículo seja obrigatório** e o **tipo de serviço seja opcional** [CONFIRMADO, E2-04 opção a], para lançar um carro mesmo quando o serviço não se encaixa na lista, sem perder o resumo por veículo. No app: sem veículo, Salvar desabilitado com "Escolha o veículo" junto à fileira (também na edição); sem tipo de serviço, Salvar habilitado e nenhum aviso; tocar de novo no serviço marcado o desmarca [SUPOSIÇÃO]; o lançamento sem tipo aparece como "Serviço · SUV · Pix" no aviso, Extrato, Início e Detalhe [SUPOSIÇÃO de texto]; "Mais um igual"/"Repetir" copiam a ausência de tipo. No servidor (agregado `Lancamento`, FIN-US-01.14): entrada da categoria "Serviços" sem `tipo_veiculo_id` é recusada (vira erro de dado, FIN-US-07.6); saída ou entrada de outra categoria com `tipo_veiculo_id` ou `tipo_servico_id` é recusada. A categoria "Serviços" é reconhecida por `categoria.codigo = servicos`, não pelo nome, que pode ser renomeado. **Pontos: de 3 para 2**, porque a regra no servidor saiu do gatilho e passou para o domínio do back-end, estimado na FIN-US-01.14; aqui fica a parte do app (validação, estado "sem tipo de serviço" na exibição e no "Repetir"). | 2 | FIN-US-02.5, FIN-US-01.17 | MVP | TELA-02 | JOR-b | — |

### FIN-EP-03 — Cadastros

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-03.1 | Como Dono, quero ver as categorias em abas Saídas/Entradas e criar (nome, ícone, cor), renomear e desativar categorias, para adaptar a grade de lançamento ao meu negócio. Desativar esconde da grade, mas mantém extrato e resumo antigos; não há excluir. Nome único por tipo entre as ativas, comparando sem diferença de maiúsculas, acentos e espaços nas pontas, ao criar e ao renomear [CONFIRMADO, F-16]: o app avisa antes de salvar e o back-end decide. | 5 | FIN-US-01.6, FIN-US-01.16, FIN-US-07.1, FIN-US-08.1 | MVP | TELA-10 | JOR-i | RNF-03 |
| FIN-US-03.2 | Como Dono, quero que as 4 categorias de sistema (Serviços, Produtos, Mão de obra, Reembolso) apareçam com a chave Ativa travada e um cadeado ("Categoria usada pelo sistema. Pode mudar o nome, mas não pode ser desativada."), para não quebrar lançamentos nem módulos futuros. Nome, ícone e cor dessas quatro podem ser trocados. [CONFIRMADO, F-06] | 2 | FIN-US-03.1 | MVP | TELA-10 | JOR-i | — |
| FIN-US-03.3 | Como Dono, quero criar, renomear e desativar tipos de serviço (só o nome), com recusa de nome repetido normalizado (maiúsculas, acentos e espaços nas pontas não contam [CONFIRMADO, F-16]) e oferta de reativação, para manter a grade da TELA-02 com os serviços que ofereço. | 3 | FIN-US-01.6, FIN-US-01.16, FIN-US-07.1, FIN-US-08.1 | MVP | TELA-11 | JOR-i | RNF-03 |
| FIN-US-03.4 | Como Dono, quero criar (ícone genérico), renomear e desativar tipos de veículo, com nome único normalizado [CONFIRMADO, F-16] e a mesma lista em todas as unidades, para manter a fileira de veículos da TELA-02 atualizada. Se o veículo desativado era o último usado, a TELA-02 abre sem veículo marcado. | 3 | FIN-US-03.3 | MVP | TELA-14 | JOR-i | RNF-03 |
| FIN-US-03.5 | Como Dono, quero reordenar categorias, tipos de serviço e tipos de veículo arrastando, para que os mais usados fiquem primeiro na grade e na fileira. | 3 | FIN-US-03.1, FIN-US-03.3, FIN-US-03.4 | MVP | TELA-10, TELA-11, TELA-14 | JOR-i | — |
| FIN-US-03.6 | Como Dono, quero criar, renomear, desativar e reordenar formas de pagamento, para incluir formas além das quatro iniciais. [CONFIRMADO, F-08] No MVP a lista vem só dos dados iniciais (FIN-US-01.6), cadastrada pela equipe na implantação; esta tela fica como evolução. | 3 | FIN-US-08.1 | Pós-MVP | TELA-09 (+ tela nova) | JOR-i | — |
| FIN-US-03.7 | Como Dono, quero categorias próprias para Pessoal e para Empresa (campo `aplica_a`), para que a grade mude conforme o dropdown. **[DÚVIDA 13 da visão]** | 3 | FIN-US-03.1 | Pós-MVP | TELA-03, TELA-04, TELA-10 | JOR-a, JOR-d, JOR-i | — |

### FIN-EP-04 — Extrato e filtros

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-04.1 | Como Dono, quero ver o extrato agrupado por dia (mais recente em cima), com ícone, categoria ou serviço, tipo de veículo nos serviços, unidade, forma, valor com cor e sinal, rótulo "Pessoal" e marca de pendente, e no topo Entrou/Saiu/Sobrou do filtro, para conferir tudo o que entrou e saiu. Lançamentos excluídos não aparecem. | 5 | FIN-US-02.3, FIN-US-02.5 | MVP | TELA-05 | JOR-f | RNF-03, RNF-11 |
| FIN-US-04.2 | Como Dono, quero escolher o período numa folha com atalhos Hoje / Semana (segunda até hoje) / Mês (dia 1 até hoje) / Mês passado e um calendário (1 toque = um dia, 2 toques = intervalo, inverte se preciso, 3º recomeça; dias futuros apagados; ‹ › entre meses; Aplicar), com o chip mostrando "Hoje", "29/10" ou "27/10 a 02/11", para ver qualquer período. | 5 | FIN-US-04.1 | MVP | TELA-05, TELA-06 | JOR-f, JOR-g | RNF-11 |
| FIN-US-04.3 | Como Dono, quero filtrar por unidade (uma ou Todas) e por Empresa/Pessoal/Tudo, com chips ativos preenchidos com "×", botão "Limpar filtros" e mensagem quando não houver resultado, para focar no que interessa. | 3 | FIN-US-04.1 | MVP | TELA-05, TELA-08 | JOR-f | — |
| FIN-US-04.4 | Como Dono, quero filtrar o extrato por uma ou mais categorias, para ver só um tipo de gasto ou de entrada. | 2 | FIN-US-04.3 | MVP | TELA-05 | JOR-f | — |
| FIN-US-04.5 | Como Dono, quero filtrar por um ou mais tipos de veículo (mostra só entradas de serviço, e o chip Categoria passa a "Serviços"), para ver quanto entrou de motos, SUVs etc. [SUPOSIÇÃO, 02-design JOR-f 4b] | 2 | FIN-US-04.4 | MVP | TELA-05 | JOR-f | — |
| FIN-US-04.6 | Como Dono, quero ver os últimos 5 lançamentos na Início (serviços com veículo), com "Ver tudo ›" para o Extrato e mensagem quando não houver nada hoje, para conferir o que acabei de lançar. | 2 | FIN-US-04.1 | MVP | TELA-01 | JOR-e, JOR-h | — |
| FIN-US-04.7 | Como Dono, quero filtrar o extrato por um ou mais tipos de serviço, incluindo a opção "Sem tipo de serviço" [SUPOSIÇÃO, E2-04 a] (mostra só entradas de serviço, e o chip Categoria passa a "Serviços"), combinável com o filtro por veículo, para ver quanto entrou de cada serviço e abrir o Extrato a partir de uma linha "Por serviço" do Resumo (FIN-US-05.6). [SUPOSIÇÃO, mesmo padrão do filtro por veículo; criada a partir de D-QA-03] | 2 | FIN-US-04.4 | MVP | TELA-05 | JOR-f, JOR-g | — |

### FIN-EP-05 — Resumo

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-05.1 | Como Dono, quero ver na Início um cartão com Entrou, Saiu e Sobrou, com abas Hoje/Mês e filtro Empresa/Pessoal/Tudo (em "Tudo", saldo da empresa e pessoal separados, além do total; Sobrou negativo em vermelho com "−"), para saber em 0 toque quanto sobrou hoje. | 3 | FIN-US-02.3, FIN-US-02.4, FIN-US-02.5 | MVP | TELA-01 | JOR-e | RNF-03, RNF-11 |
| FIN-US-05.2 | Como Dono, com "Todas as unidades" quero ver o consolidado e uma linha com o "Sobrou" de cada unidade, para comparar as unidades. | 2 | FIN-US-05.1, FIN-US-08.3 | MVP | TELA-01, TELA-08 | JOR-e | — |
| FIN-US-05.3 | Como Dono, quero ver os gastos por categoria em barras horizontais, da maior para a menor, com valor e %, com os mesmos chips do Extrato e "Por unidade" quando "Todas", para saber onde o dinheiro vai. Percentuais arredondados só na exibição; totais em centavos exatos. | 5 | FIN-US-04.2, FIN-US-04.3, FIN-US-08.4 | MVP | TELA-06 | JOR-g | RNF-03, RNF-11 |
| FIN-US-05.4 | Como Dono, quero a aba Serviços com quantidade de veículos e valor recebido por tipo de serviço, no dia ou no mês, com uma linha "Sem tipo de serviço" para as entradas de serviço lançadas sem tipo (aparece só se houver alguma no período) [SUPOSIÇÃO, E2-04 a], para saber qual serviço vende mais sem que a soma da aba deixe de bater com o total de "Serviços". | 3 | FIN-US-05.3 | MVP | TELA-06 | JOR-g | RNF-11 |
| FIN-US-05.5 | Como Dono, quero alternar a aba Serviços entre "Por serviço" e "Por veículo" (quantidade e valor por tipo de veículo), para ver o que entra de cada tipo de veículo, separado do serviço [CONFIRMADO E2-08; seletor SUPOSIÇÃO]. | 2 | FIN-US-05.4 | MVP | TELA-06 | JOR-g | RNF-11 |
| FIN-US-05.6 | Como Dono, quero tocar numa barra de categoria ou numa linha de serviço/veículo (inclusive "Sem tipo de serviço") e abrir o Extrato já filtrado no mesmo período, para ver os lançamentos por trás do número. | 2 | FIN-US-05.3, FIN-US-05.5, FIN-US-04.4, FIN-US-04.5, FIN-US-04.7 | MVP | TELA-06, TELA-05 | JOR-g, JOR-f | — |
| FIN-US-05.7 | Como Dono, quero ver o cruzamento tipo de serviço × tipo de veículo (ex.: "Lavagem completa em SUV"), para analisar a combinação [CONFIRMADO E2-08: fica para depois]. | 3 | FIN-US-05.5 | Pós-MVP | TELA-06 | JOR-g | — |

### FIN-EP-06 — Correção e histórico

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-06.1 | Como Dono, quero abrir o detalhe de um lançamento (todos os campos, tipo de veículo nos serviços, "Criado por / Alterado em", situação de sincronização), para conferir o que foi lançado. | 2 | FIN-US-04.1 | MVP | TELA-07 | JOR-h | RNF-13 |
| FIN-US-06.2 | Como Dono, quero editar um lançamento no mesmo formulário em que foi criado, já preenchido (valor completo, data sem dias futuros), com "Alterado" no detalhe, para corrigir um erro sem perder o registro de quem alterou e quando. O **tipo do lançamento não muda na edição** (saída continua saída, outra entrada continua outra entrada, serviço continua serviço); para mudar o tipo, o dono exclui e lança de novo [CONFIRMADO, F-13; responde D-QA-05]. Pontos mantidos em 3: a regra só tira opções do formulário (não há troca de tela nem conversão de campos), mas a edição continua cobrindo os três formulários. | 3 | FIN-US-06.1, FIN-US-01.5 | MVP | TELA-07, TELA-02, TELA-03, TELA-04 | JOR-h | RNF-13, RNF-14 |
| FIN-US-06.3 | Como Dono, quero excluir um lançamento com confirmação ("Excluir esta saída de R$ 25,00 (Alimentação, hoje)?"), para remover um lançamento errado. A exclusão é lógica: some de extrato, saldo e resumo, mas fica no banco e no histórico, e o lançamento vai para a lixeira por 90 dias (FIN-US-06.5) [CONFIRMADO, F-09]. | 2 | FIN-US-06.1 | MVP | TELA-07, TELA-05 | JOR-h | RNF-14, RNF-15 |
| FIN-US-06.4 | Como Dono, quero tocar em "Ver histórico" no detalhe e ver o histórico de alterações do lançamento (criação, alterações, exclusão e restauração, cada uma com data, hora, quem fez e o que mudou, de → para), para entender o que mudou [CONFIRMADO, F-09; responde DU-04]. O link aparece **sempre** no detalhe, inclusive em excluídos e restaurados, porque todo lançamento tem ao menos a criação; por isso a TELA-15 não tem estado vazio [D-QA-17]. A TELA-15 é **só leitura**: não há "voltar a valores anteriores"; para corrigir, usa-se o Editar (FIN-US-06.2) [D-QA-15, o dono não pediu reversão]. Alterações ainda não enviadas aparecem como "aguardando envio" até o servidor gravá-las [SUPOSIÇÃO]. **Fica para a v1.1, junto com a FIN-US-07.7:** mostrar o aparelho de cada alteração e a marca de conflito, que só fazem sentido com mais de um celular [D-QA-16, F-15]. Pontos mantidos em 5: sair a reversão, o aparelho e o conflito tira pouco; o grosso continua sendo baixar o histórico (escrito só no servidor) para o celular, só para leitura, e traduzir os campos para linguagem simples (ids de categoria, serviço e veículo em nomes; centavos em reais). | 5 | FIN-US-06.1, FIN-US-06.2, FIN-US-01.5, FIN-US-07.1 | MVP | TELA-07, TELA-15 | JOR-h | RNF-03, RNF-14 |
| FIN-US-06.5 | Como Dono, quero uma lixeira com os lançamentos excluídos nos últimos **90 dias** e poder restaurá-los (ação `restauracao` no histórico), para recuperar uma exclusão por engano [CONFIRMADO, F-09; responde a dúvida 2 da arquitetura]. O restaurado volta a extrato, saldo e resumo. Lançamentos removidos pelo **Desfazer** logo após salvar (FIN-US-02.8) **não** aparecem na lixeira [SUPOSIÇÃO, D-QA-18]; para isso, a exclusão precisa guardar se veio do Desfazer ou do Excluir — a forma de guardar fica com a Arquitetura (ex.: um motivo da exclusão no lançamento ou no histórico) [SUPOSIÇÃO]. Depois de 90 dias contados da exclusão (`excluido_em`), o item some da lixeira, mas o registro continua no servidor, com exclusão lógica e histórico. Funciona sem internet. Pontos mantidos em 3: a exclusão lógica, o recebimento de excluídos e a ação `restauracao` já existem (FIN-US-01.5, FIN-US-06.3, FIN-US-07.1); faltam a tela, o corte de 90 dias, a ação de restaurar e separar as exclusões do Desfazer, que é pouco. | 3 | FIN-US-06.3, FIN-US-01.5, FIN-US-08.1, FIN-US-02.8 | MVP | TELA-16 | JOR-h | RNF-03, RNF-14, RNF-15 |

### FIN-EP-07 — Funcionamento offline e sincronização

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-07.1 | Como equipe de desenvolvimento, quero configurar o PowerSync no plano gratuito, se a prova de conceito aprovar (FIN-US-07.10): instância ligada ao Supabase com o papel de replicação só leitura, autenticação pelo JWT do Supabase Auth, sync rules versionadas em `infra/powersync/` filtradas pelo usuário do token e pelos vínculos em `usuario_unidade` (unidades, lançamentos e histórico dessas unidades, cadastros da organização, a própria preferência), SDK com SQLite no app e o conector de envio que manda a fila para `POST /sync/upload` do NestJS, para que o app leia e grave no banco local e **nunca grave direto no Postgres**. Se a prova de conceito reprovar, esta história é substituída pela FIN-US-07.12. | 5 | FIN-US-07.10, FIN-US-01.3, FIN-US-01.4, FIN-US-07.11 | MVP | — | JOR-k | RNF-03, RNF-05, RNF-08, RNF-19, RNF-27 |
| FIN-US-07.2 | Como equipe de desenvolvimento, quero gerar UUID v7 no aparelho para todo registro e registrar o `dispositivo` na primeira sincronização (pelo Identidade e Acesso), e conferir que o reenvio de uma operação já aceita pelo NestJS não duplica nada, para que quedas de rede no meio do envio não criem lançamentos repetidos. | 2 | FIN-US-07.1, FIN-US-07.11 | MVP | — | JOR-k | RNF-08, RNF-13 |
| FIN-US-07.3 | Como Dono, quero que o app sincronize sozinho ao salvar, ao abrir, ao voltar a ter internet e a cada ~5 min com o app aberto, sem nunca esperar a rede para salvar, para não ter que lembrar de enviar nada. | 3 | FIN-US-07.2 | MVP | TELA-01 | JOR-k | RNF-05, RNF-08, RNF-09 |
| FIN-US-07.4 | Como Dono, quero ver sempre no topo da Início o estado da nuvem (✓ com hora, "N para enviar", "Enviando…", sem internet com a faixa "Seus lançamentos estão salvos no celular", erro em amarelo) e um relógio nos lançamentos pendentes do extrato, para saber se está tudo salvo. | 3 | FIN-US-07.3 | MVP | TELA-01, TELA-05 | JOR-k | RNF-07 |
| FIN-US-07.5 | Como Dono, quero uma tela de Sincronização (última sincronização, pendentes, erros em linguagem simples) com o botão "Sincronizar agora", que mostra o resultado (sucesso, nada pendente ou erro), para forçar o envio quando eu quiser. | 3 | FIN-US-07.4, FIN-US-08.1 | MVP | TELA-12, TELA-09, TELA-01 | JOR-k | RNF-06 |
| FIN-US-07.6 | Como Dono, quero que falhas de envio sejam tratadas sem perder nada: erro temporário tenta de novo com espera crescente; sessão vencida renova ou pede login sem apagar a fila; recusa por permissão ou por dado fica marcada como erro, com opção de corrigir e reenviar ou descartar (com confirmação); um erro não trava os outros envios, para confiar que nenhum lançamento se perde. | 5 | FIN-US-07.3 | MVP | TELA-12, TELA-01 | JOR-k | RNF-08 |
| FIN-US-07.7 | Como Dono, se o mesmo lançamento for alterado em dois aparelhos sem internet, quero que valha a última alteração recebida pelo servidor (excluir vence editar), com o histórico marcado como conflito e o aviso "Este lançamento foi alterado em outro aparelho", para não perder nenhuma versão. [SUPOSIÇÃO, dúvida 1 da arquitetura] **Movida para a v1.1** [CONFIRMADO, F-15: o dono usa um celular só; ver R-RM-09 do roadmap]. Nenhuma história do MVP depende desta. No MVP continuam a `versao` e o histórico no servidor (FIN-US-01.5). Inclui também, na TELA-15, mostrar o **aparelho** de cada alteração e a **marca de conflito**, que saíram da FIN-US-06.4 [D-QA-16]; cabe nos mesmos 3 pontos, porque os dados já estão no histórico. | 3 | FIN-US-07.3, FIN-US-01.5, FIN-US-06.4 | Pós-MVP (v1.1) | TELA-07, TELA-15 | JOR-h, JOR-k | RNF-14 |
| FIN-US-07.8 | Como Dono, quero um aviso na Início quando houver lançamentos pendentes há mais de 24 h, para saber que eles ainda existem só no celular [SUPOSIÇÃO de prazo]. | 1 | FIN-US-07.4 | MVP | TELA-01 | JOR-k | RNF-17 |
| FIN-US-07.9 | Como equipe de desenvolvimento, quero um roteiro de teste de resiliência (modo avião, lançar, fechar o app à força, reiniciar o aparelho, reconectar, conferir no servidor) executado a cada versão, para garantir que nada se perde. | 2 | FIN-US-07.6 | MVP | — | JOR-k | RNF-03, RNF-08 |
| FIN-US-07.10 | Como equipe de desenvolvimento, quero uma **prova de conceito do PowerSync no plano gratuito** no início do M1, com critérios de aprovação: (a) o volume do MVP cabe no plano gratuito com folga; (b) as regras de inatividade não interrompem o uso diário; (c) o envio pelo NestJS funciona de sem internet para com internet sem perder nada; (d) o JWT do Supabase funciona no PowerSync e no NestJS — e o registro da decisão (PowerSync ou sincronização própria), incluindo a escolha da hospedagem gratuita da API, para seguir com a opção que o plano gratuito atende [CONFIRMADO, F-03b; critérios SUPOSIÇÃO, 03-arquitetura §2.2]. | 3 | FIN-US-01.2, FIN-US-01.12 | MVP | — | JOR-k | RNF-05, RNF-08 |
| FIN-US-07.11 | Como equipe de desenvolvimento, quero o módulo **Sincronização** no NestJS com o endpoint `POST /sync/upload` (com PowerSync; `POST /sync/push` na alternativa): recebe lotes em ordem com o JWT, encontra o manipulador da tabela no registro de manipuladores de cada módulo e chama o caso de uso certo (criar → `RegistrarLancamento`; `excluido_em` preenchido → `ExcluirLancamento`; limpo → `RestaurarLancamento`; demais → `EditarLancamento`; cadastros e preferência → casos de uso da FIN-US-01.16), e devolve o resultado **por operação** (aceita; recusada com motivo e código 422 ou 403), sem regra de negócio própria, para que toda alteração do celular passe pelas regras do back-end. | 5 | FIN-US-01.13, FIN-US-01.15, FIN-US-01.16 | MVP | TELA-12 | JOR-k | RNF-08, RNF-18, RNF-19 |
| FIN-US-07.12 | **Contingência — só se a prova de conceito reprovar o PowerSync.** Como equipe de desenvolvimento, quero a sincronização própria pela API NestJS: `expo-sqlite` com query builder leve no app e a tabela local `fila_envio`; `POST /sync/push` com a fila em ordem e a `versao` de base; `GET /sync/pull?cursor=` com tudo o que mudou desde o cursor, inclusive excluídos, filtrado pelos vínculos do usuário; coluna `seq_servidor` em toda tabela sincronizada, para manter o funcionamento sem internet só com planos gratuitos [CONFIRMADO, F-03b]. Substitui a FIN-US-07.1 (5 pts): se acionada, o MVP sobe **+3 pontos** (8 − 5). Fica fora dos totais até a decisão. | 8 | FIN-US-07.10, FIN-US-07.11 | Contingência | — | JOR-k | RNF-03, RNF-05, RNF-08, RNF-19 |

### FIN-EP-08 — Ajustes e preferências

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-08.1 | Como Dono, quero a tela Mais/Ajustes com acesso a Categorias, Tipos de serviço, Tipos de veículo, Padrão Pessoal/Empresa, Sincronização, Sobre e Sair, para encontrar as configurações num só lugar. | 2 | FIN-US-01.1 | MVP | TELA-09 | JOR-i, JOR-k | — |
| FIN-US-08.2 | Como Dono, quero trocar o padrão Pessoal/Empresa (inicial "Empresa") e ter a mesma preferência em todos os meus aparelhos (`preferencia_usuario`, sincronizada), para que um celular não lance com padrão diferente do outro. | 2 | FIN-US-08.1, FIN-US-07.1 | MVP | TELA-09 | JOR-a, JOR-b, JOR-d | RNF-03 |
| FIN-US-08.3 | Como Dono, quero trocar a unidade atual pelo seletor no topo (lista + "Todas as unidades"), com o topo mudando de nome e cor e a escolha lembrada até eu trocar de novo, para nunca lançar na unidade errada. | 3 | FIN-US-01.6, FIN-US-01.9 | MVP | TELA-08, TELA-01 | JOR-j, JOR-e | — |
| FIN-US-08.4 | Como Dono, quero que o período escolhido valha junto no Extrato e no Resumo (trocar numa tela troca na outra), para não ter que escolher duas vezes [CONFIRMADO E2-10]. O período padrão ao abrir depende de dúvida (ver §6, D-BL-02). | 2 | FIN-US-04.2 | MVP | TELA-05, TELA-06 | JOR-f, JOR-g | — |
| FIN-US-08.5 | Como Dono, quero cadastrar e editar unidades pelo app (nome, fuso), para abrir uma unidade nova sem depender da equipe. [CONFIRMADO, F-08: no MVP as unidades são cadastradas pela equipe na implantação; esta tela fica como evolução; responde DU-05] | 3 | FIN-US-08.1 | Pós-MVP | TELA-09 (+ tela nova) | — | RNF-20 |

### FIN-EP-09 — Segurança, privacidade e operação

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-09.1 | Como Dono, quero sair da conta apagando os dados do celular, com confirmação explícita se houver lançamentos ainda não enviados, para proteger meus dados ao trocar ou emprestar o aparelho. | 2 | FIN-US-01.7, FIN-US-07.4 | MVP | TELA-09 | — | RNF-25 |
| FIN-US-09.2 | Como equipe de desenvolvimento, quero um **backup próprio semanal** [CONFIRMADO, F-03b]: um agendador gratuito (ex.: GitHub Actions) roda `pg_dump` do banco do Supabase, criptografa o arquivo e o guarda **fora do Supabase**, com retenção de 3 meses (~13 cópias) e aviso por e-mail à equipe se falhar [SUPOSIÇÃO de retenção e aviso], com uma restauração testada num banco de teste antes de ir para produção, para não perder dados do servidor sem pagar plano. Os lançamentos posteriores ao último backup continuam no celular do dono e podem ser reenviados. | 3 | FIN-US-01.2, FIN-US-01.11 | MVP | — | — | RNF-16 |
| FIN-US-09.3 | Como Dono, quero uma política de privacidade simples publicada com o app e uma orientação no campo descrição para não colocar dados sensíveis, para cumprir a LGPD. | 1 | FIN-US-02.2 | MVP | TELA-09, TELA-02, TELA-03, TELA-04 | — | RNF-22, RNF-24 |
| FIN-US-09.4 | Como equipe de desenvolvimento, quero uma revisão de segurança antes de publicar: credenciais do Postgres, chave service_role e chaves do PowerSync só no servidor (nunca no APK), API pública do Supabase fechada (FIN-US-01.4), JWT validado em toda rota do NestJS, só HTTPS, senha mínima de 8 caracteres, para não expor dados. **Pontos: de 1 para 2**, porque agora há mais peças a revisar (API NestJS e PowerSync, além do Supabase). | 2 | FIN-US-01.4, FIN-US-01.13, FIN-US-07.1 | MVP | — | — | RNF-18, RNF-19, RNF-21 |
| FIN-US-09.5 | Como equipe de desenvolvimento, quero medir em um aparelho Android de entrada, com 10.000 lançamentos, os tempos de salvar (≤ 300 ms), abrir formulário (≤ 1 s), extrato/resumo (≤ 1 s) e partida a frio (≤ 3 s), para garantir agilidade no pátio. | 2 | FIN-US-04.1, FIN-US-05.3 | MVP | TELA-01 a TELA-06 | JOR-a, JOR-b, JOR-f, JOR-g | RNF-02, RNF-09, RNF-10, RNF-11, RNF-12 |
| FIN-US-09.6 | Como equipe de desenvolvimento, quero gerar um **APK assinado** (EAS Build) **só para Android 8+** [CONFIRMADO, F-03] e instalá-lo direto no celular do dono, **sem Google Play** [CONFIRMADO, F-04], com atualizações pelo próprio app (EAS Update) e, quando houver mudança nativa, por um novo APK, para que o dono instale e receba correções. Inclui: guardar com segurança a chave de assinatura (sem ela, um APK novo não atualiza o instalado), um guia curto de instalação (permitir "instalar apps desconhecidos") e canais de atualização separados para teste e para o dono. iPhone e publicação em loja ficam como evolução. Pontos mantidos em 3: sai o trabalho da loja (conta, ficha, revisão) e entram a distribuição manual, a guarda da chave e o guia. | 3 | FIN-US-01.1 | MVP | — | — | RNF-01, RNF-02 |
| ~~FIN-US-09.7~~ | ~~Como Dono, quero que o app peça PIN ou biometria ao abrir, para proteger os dados se o celular for perdido.~~ **Descartada pelo dono [CONFIRMADO, F-10]:** o app abre direto; vale o bloqueio de tela do celular. Sai do roadmap e dos totais. | ~~2~~ | — | Descartada | — | — | RNF-25 |
| FIN-US-09.8 | Como equipe de desenvolvimento, quero um procedimento administrativo documentado (fora do app) para apagar definitivamente os dados de um titular, para atender pedidos de exclusão da LGPD antes da expansão para outros usuários. | 1 | FIN-US-01.3 | Pós-MVP | — | — | RNF-26 |
| FIN-US-09.9 | Como equipe de desenvolvimento, quero publicar a API NestJS numa hospedagem gratuita escolhida na prova de conceito (HTTPS, variáveis de ambiente com as credenciais, termos de uso que permitam uso comercial [SUPOSIÇÃO]), com publicação automática a partir do repositório e as migrações aplicadas antes de cada versão, para que o app tenha onde sincronizar. A espera de alguns segundos quando a hospedagem "dorme" é aceitável no app, que funciona sem internet. | 2 | FIN-US-01.12, FIN-US-07.10 | MVP | — | — | RNF-18, RNF-21, RNF-27 |

### FIN-EP-10 — Painel web de consulta (Pós-MVP)

[CONFIRMADO, ST-01 e ST-06] Painel web em Next.js, **só de consulta** (sem lançar, editar, excluir, restaurar nem gerenciar cadastros) e **depois do MVP do app**. Telas WEB-01 a WEB-06 do 02-design §9. Todas as histórias são Pós-MVP. Ordem sugerida pelo Design: WEB-06, WEB-01, WEB-02 e WEB-04; depois WEB-03 e WEB-05.

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-10.1 | Como equipe de desenvolvimento, quero o projeto Next.js em `apps/painel`, com login pelo Supabase Auth (mesma conta do app), chamadas **só à API NestJS**, nenhuma regra de domínio no painel, nenhum dado guardado no computador, aviso claro sem internet, sessão encerrada após inatividade (ex.: 8 h [SUPOSIÇÃO]) e publicação numa hospedagem gratuita que permita uso comercial (ou no mesmo host da API), para ter a base do painel. | 3 | FIN-US-01.11, FIN-US-01.13 | Pós-MVP | WEB-01 a WEB-06 (casca) | — | RNF-29, RNF-30, RNF-31, RNF-32 |
| FIN-US-10.2 | Como equipe de desenvolvimento, quero as consultas do painel no módulo Finanças do NestJS (`ConsultarExtrato`, `ConsultarResumo`, `ConsultarVisaoGeral`, `ConsultarHistorico`, `ListarLixeira`), com SQL direto e otimizado (CQRS leve), autorização por unidade e papel e resposta em ≤ 2 s com o volume do MVP [SUPOSIÇÃO], para que o painel leia os mesmos números do app a partir do servidor. | 5 | FIN-US-01.15, FIN-US-01.13 | Pós-MVP | WEB-01 a WEB-05 | — | RNF-19, RNF-32, RNF-33 |
| FIN-US-10.3 | Como Dono, quero entrar no painel com o mesmo e-mail e senha do app, sem PIN nem biometria, para consultar meus números no computador. | 1 | FIN-US-10.1 | Pós-MVP | WEB-06 | — | RNF-21, RNF-31 |
| FIN-US-10.4 | Como Dono, quero uma visão geral do mês no painel (Entrou, Saiu e Sobrou por unidade e consolidado; barras por dia do mês; os 5 maiores gastos por categoria) e a hora da última sincronização do celular, para ver o mês de relance e saber se falta algo do celular. | 3 | FIN-US-10.2, FIN-US-10.3 | Pós-MVP | WEB-01 | — | RNF-29, RNF-32, RNF-33 |
| FIN-US-10.5 | Como Dono, quero o extrato em tabela no painel (Data, Unidade, Tipo, Categoria/Serviço, Veículo, Pagou com, Empresa/Pessoal, Valor), com ordenação por coluna, busca por texto, os mesmos filtros do app (período, unidade, categoria, serviço com "Sem tipo de serviço", veículo, Empresa/Pessoal) e totais no rodapé, para conferir e procurar lançamentos com folga de tela. Exportar planilha depende da dúvida 8 da visão e fica fora. | 5 | FIN-US-10.2, FIN-US-10.3 | Pós-MVP | WEB-02 | — | RNF-29, RNF-33 |
| FIN-US-10.6 | Como Dono, quero clicar numa linha do extrato do painel e ver num painel lateral todos os campos e o histórico do lançamento (só leitura), com o aviso "Para corrigir, use o app no celular.", para conferir um lançamento por inteiro. | 2 | FIN-US-10.5 | Pós-MVP | WEB-03 | — | RNF-14, RNF-32 |
| FIN-US-10.7 | Como Dono, quero o resumo no painel (gastos por categoria em barras horizontais; serviços por tipo e por veículo, com "Sem tipo de serviço"; comparação entre unidades lado a lado), para analisar o período. | 3 | FIN-US-10.2, FIN-US-10.3 | Pós-MVP | WEB-04 | — | RNF-29, RNF-33 |
| FIN-US-10.8 | Como Dono, quero ver no painel a lixeira em tabela, com "excluído em" e "some em", sem restaurar, com o aviso "Para recuperar, use a Lixeira do app.", para saber o que foi excluído. | 2 | FIN-US-10.2, FIN-US-10.3 | Pós-MVP | WEB-05 | — | RNF-15, RNF-32 |

---

## 4. Matriz de cobertura

### 4.1 Telas × histórias

| Tela | Histórias MVP | Histórias Pós-MVP |
|---|---|---|
| TELA-01 Início | 01.1, 01.8, 02.8, 02.9, 02.11, 04.6, 05.1, 05.2, 07.3, 07.4, 07.5, 07.6, 07.8, 08.3, 09.5 | — |
| TELA-02 Novo serviço | 01.6, 02.1, 02.2, 02.5, 02.6, 02.7, 02.9, 02.10, 02.12, 06.2, 09.3 | — |
| TELA-03 Nova saída | 01.6, 02.1, 02.2, 02.3, 02.10, 06.2, 09.3 | 03.7 |
| TELA-04 Nova entrada | 01.6, 02.1, 02.2, 02.4, 02.10, 06.2, 09.3 | 03.7 |
| TELA-05 Extrato | 01.1, 04.1, 04.2, 04.3, 04.4, 04.5, 04.7, 05.6, 06.3, 07.4, 08.4 | — |
| TELA-06 Resumo | 01.1, 04.2, 05.3, 05.4, 05.5, 05.6, 08.4 | 05.7 |
| TELA-07 Detalhe | 06.1, 06.2, 06.3, 06.4 | 07.7 |
| TELA-08 Seletor de unidade | 01.6, 01.8, 04.3, 05.2, 08.3 | — |
| TELA-09 Mais / Ajustes | 01.1, 07.5, 08.1, 08.2, 09.1, 09.3 | 03.6, 08.5 |
| TELA-10 Categorias | 03.1, 03.2, 03.5 | 03.7 |
| TELA-11 Tipos de serviço | 03.3, 03.5 | — |
| TELA-12 Sincronização | 07.5, 07.6, 07.11 | — |
| TELA-13 Entrar | 01.7 | — |
| TELA-14 Tipos de veículo | 03.4, 03.5 | — |
| TELA-15 Histórico de alterações | 06.4 | 07.7 (aparelho e conflito) |
| TELA-16 Lixeira | 06.5 | — |

**Todas as 16 telas (TELA-01 a TELA-16) têm pelo menos uma história MVP.** (IDs abreviados: "02.5" = FIN-US-02.5.)

**Painel web (02-design §9), todas Pós-MVP:**

| Tela | Histórias Pós-MVP |
|---|---|
| WEB-01 Início / visão geral | 10.1, 10.2, 10.4 |
| WEB-02 Extrato em tabela | 10.1, 10.2, 10.5 |
| WEB-03 Detalhe e histórico | 10.1, 10.2, 10.6 |
| WEB-04 Resumo | 10.1, 10.2, 10.7 |
| WEB-05 Lixeira (consulta) | 10.1, 10.2, 10.8 |
| WEB-06 Entrar | 10.1, 10.3 |

Todas as 6 telas do painel têm história.

As telas do MVP **TELA-15 Histórico de alterações** (06.4) e **TELA-16 Lixeira** (06.5) [CONFIRMADO, F-09] já estão no 02-design v7. Telas novas só do Pós-MVP, ainda sem desenho: gestão de formas de pagamento (03.6) e gestão de unidades (08.5) [CONFIRMADO, F-08: evolução]. A tela de PIN/biometria (09.7) foi descartada pelo dono (F-10).

### 4.2 Entidades do modelo de dados × histórias

| Entidade | Histórias que criam ou usam |
|---|---|
| organizacao | 01.3, 01.6 |
| unidade | 01.3, 01.6, 01.13, 08.3, 05.2, 04.3 · Pós: 08.5 |
| usuario | 01.3, 01.7, 01.13 |
| usuario_unidade | 01.3, 01.6, 01.13, 07.1 (sync rules) |
| categoria | 01.3, 01.6, 01.16, 02.3, 02.4, 02.12, 03.1, 03.2, 03.5, 05.3 · Pós: 03.7 (`aplica_a`) |
| tipo_servico | 01.3, 01.6, 01.16, 02.5, 02.6, 03.3, 03.5, 04.7, 05.4 |
| tipo_veiculo | 01.3, 01.6, 01.16, 02.5, 02.7, 03.4, 03.5, 04.5, 05.5 |
| forma_pagamento | 01.3, 01.6, 01.16 (leitura), 02.2 · Pós: 03.6 (gestão) |
| lancamento | 01.3, 01.14, 01.15, 02.3, 02.4, 02.5, 02.12, 04.1, 05.1, 06.2, 06.3, 06.5, 07.2, 07.11 · Pós: 07.7, 10.2 |
| lancamento_historico | 01.5, 01.15, 06.2, 06.3, 06.4, 06.5, 07.1 (desce só leitura) · Pós: 07.7, 10.6 |
| dispositivo | 01.3, 01.13, 07.2 · Pós: 10.4 (última sincronização) |
| preferencia_usuario | 01.3, 01.16, 08.2 |
| config_local (só no aparelho) | 02.2 (última forma), 02.5 (último veículo), 02.9 (repetir), 08.3 (unidade atual), 08.4 (período), 07.3 (marcador) |
| fila_envio (só no aparelho) | Não se aplica com PowerSync (fila interna). Só existe na contingência FIN-US-07.12, junto com a coluna `seq_servidor`. |

**Nenhuma entidade sem história.** Observações:

- `forma_pagamento` só tem **gestão** no Pós-MVP (03.6); no MVP é usada a partir dos dados iniciais, cadastrados pela equipe [CONFIRMADO, F-08]. O mesmo vale para `unidade` (gestão em 08.5, Pós-MVP).
- Colunas novas da arquitetura v8, todas cobertas: `nome_chave` (01.3, 01.16, 01.17; F-16), `categoria.codigo` (01.3, 01.6, 02.12), `seq_servidor` (só na contingência 07.12).
- Campos reservados sem comportamento no MVP, criados só na estrutura (01.3): `lancamento.situacao` (PIF-06), `lancamento.origem`/`origem_ref_*` (PIF-01 a PIF-04), `categoria.aplica_a` (dúvida 13), papéis `gerente`/`funcionario` (PIF-05).

### 4.3 RNF × histórias

| RNF | Histórias | RNF | Histórias |
|---|---|---|---|
| RNF-01 | 01.1, 01.9, 02.11, 09.6 | RNF-15 | 01.3, 01.14, 06.3, 06.5 · Pós: 10.8 |
| RNF-02 | 09.5, 09.6 | RNF-16 | 09.2 |
| RNF-03 | 07.1, 07.9, 01.17, 02.3, 02.4, 02.5, 03.x, 04.1, 05.1, 06.4, 06.5 | RNF-17 | 07.8 |
| RNF-04 | 01.7, 01.8 | RNF-18 | 01.4, 01.7, 01.12, 01.13, 07.11, 09.4, 09.9 |
| RNF-05 | 07.1, 07.3, 07.10 | RNF-19 | 01.4, 01.13, 01.15, 01.18, 07.1, 07.11, 09.4 · Pós: 10.2 |
| RNF-06 | 07.5 | RNF-20 | 01.13, 01.16 |
| RNF-07 | 07.4 | RNF-21 | 01.7, 09.4, 09.9 · Pós: 10.3 |
| RNF-08 | 07.1, 07.2, 07.3, 07.6, 07.9, 07.10, 07.11, 01.15, 01.18 | RNF-22 | 09.3 |
| RNF-09 | 02.3, 02.8, 07.3, 09.5 | RNF-23 | 01.2 |
| RNF-10 | 02.1, 02.2, 02.5, 02.9, 09.5 | RNF-24 | 01.3, 02.2, 09.3 |
| RNF-11 | 04.1, 04.2, 05.1, 05.3–05.5, 09.5 | RNF-25 | 09.1 (09.7 descartada, F-10) |
| RNF-12 | 01.1, 09.5 | RNF-26 | Pós: 09.8 |
| RNF-13 | 01.3, 01.5, 01.14, 02.3, 06.1, 06.2, 07.2 | RNF-27 | 01.2, 01.3, 01.11, 01.12, 07.1, 09.9 |
| RNF-14 | 01.5, 01.15, 01.18, 06.2, 06.3, 06.4, 06.5 · Pós: 07.7, 10.6 | RNF-28 | 09.6 |
| RNF-29 | Pós: 10.1, 10.4, 10.5, 10.7 | RNF-30 | Pós: 10.1 |
| RNF-31 | Pós: 10.1, 10.3 | RNF-32 | Pós: 10.1, 10.2, 10.4, 10.6, 10.8 |
| RNF-33 | Pós: 10.2, 10.4, 10.5, 10.7 | | |

Todos os 33 RNF estão cobertos (RNF-01 a RNF-33, incluindo o RNF-28 de distribuição por APK e os RNF-29 a RNF-33 do painel web). **RNF-29 a RNF-33** só têm histórias Pós-MVP, porque o painel entra depois do MVP (ST-06). **RNF-26** só tem história Pós-MVP, o que é coerente com o próprio critério ("antes da expansão para outros usuários"). **RNF-25** fica coberto no MVP só por sair da conta (09.1): o bloqueio por PIN/biometria foi descartado pelo dono (F-10), e vale o bloqueio de tela do celular.

### 4.4 Jornadas × histórias

| Jornada | Histórias principais |
|---|---|
| JOR-a | 02.1, 02.2, 02.3, 02.8, 02.11 |
| JOR-b | 02.1, 02.2, 02.5, 02.6, 02.7, 02.12 |
| JOR-c | 02.9 |
| JOR-d | 02.1, 02.2, 02.4 |
| JOR-e | 05.1, 05.2, 04.6 |
| JOR-f | 04.1 a 04.5, 04.7, 08.4 |
| JOR-g | 04.7, 05.3 a 05.6, 08.4 |
| JOR-h | 02.8, 06.1, 06.2, 06.3, 06.4, 06.5 · Pós: 07.7 |
| JOR-i | 03.1 a 03.5, 08.1 |
| JOR-j | 08.3 |
| JOR-k | 07.1 a 07.6, 07.8, 07.9 · Pós: 07.7 |

---

## 5. Totais

| Épico | Histórias MVP | Pontos MVP | Histórias Pós-MVP | Pontos Pós-MVP | Pontos totais |
|---|---|---|---|---|---|
| FIN-EP-01 Fundação | 17 | 58 | 1 | 2 | 60 |
| FIN-EP-02 Lançamentos | 12 | 32 | 0 | 0 | 32 |
| FIN-EP-03 Cadastros | 5 | 16 | 2 | 6 | 22 |
| FIN-EP-04 Extrato e filtros | 7 | 21 | 0 | 0 | 21 |
| FIN-EP-05 Resumo | 6 | 17 | 1 | 3 | 20 |
| FIN-EP-06 Correção e histórico | 5 | 15 | 0 | 0 | 15 |
| FIN-EP-07 Offline e sincronização | 10 | 32 | 1 | 3 | 35 |
| FIN-EP-08 Ajustes e preferências | 4 | 9 | 1 | 3 | 12 |
| FIN-EP-09 Segurança, privacidade e operação | 7 | 15 | 1 | 1 | 16 |
| FIN-EP-10 Painel web de consulta | 0 | 0 | 8 | 24 | 24 |
| **Total** | **73** | **215** | **15** | **42** | **257** |

- **Total do MVP: 73 histórias, 215 pontos** (era 62 histórias e 175 pontos na v7).
- **Total Pós-MVP: 15 histórias, 42 pontos**: 7 histórias e 18 pontos do app (inclui a FIN-US-07.7, prevista para a v1.1) e o **painel web, com 8 histórias e 24 pontos** (FIN-EP-10).
- **Contingência, fora dos totais:** FIN-US-07.12 (sincronização própria, 8 pontos). Só entra se a prova de conceito reprovar o PowerSync; substitui a FIN-US-07.1 e soma +3 pontos ao MVP (218).
- **Descartada pelo dono, fora dos totais:** FIN-US-09.7 (PIN/biometria, 2 pontos), F-10.
- Histórias técnicas ("equipe de desenvolvimento") no MVP: 25 histórias, 82 pontos (01.1–01.6, 01.9, 01.11–01.18, 07.1, 07.2, 07.9, 07.10, 07.11, 09.2, 09.4, 09.5, 09.6, 09.9).
- Maiores riscos de estimativa: FIN-US-07.10/07.1 (prova de conceito e PowerSync no plano gratuito; se reprovar, entra a contingência de 8 pontos), FIN-US-01.14 e FIN-US-01.15 (primeiro domínio DDD do projeto; o padrão definido aqui será copiado pelos outros módulos), FIN-US-07.6 (erros de sincronização) e FIN-US-04.2 (calendário de intervalo, ainda não prototipado).

---

## 6. Suposições e dúvidas

### 6.1 Suposições deste backlog

| # | Suposição |
|---|---|
| S-BL-01 | [CONFIRMADO, ST-01 a ST-06 e F-03b] Stack: Expo (Android) + NestJS (DDD, Clean Architecture, monólito modular) + Supabase, com toda escrita passando pelo NestJS; PowerSync no plano gratuito se a prova de conceito (FIN-US-07.10) aprovar, senão a contingência FIN-US-07.12 (+3 pontos no MVP). [SUPOSIÇÃO] Monorepo com pnpm e Turborepo, query builder Drizzle ou Kysely e hospedagem gratuita da API escolhida na prova de conceito (03-arquitetura §2.1 e §9.6). |
| S-BL-02 | [CONFIRMADO, F-08] As unidades e o vínculo dono × unidades são cadastrados pela equipe na implantação (dados iniciais). Responde DU-05. |
| S-BL-03 | [CONFIRMADO, F-12] As quatro formas de pagamento (Dinheiro, Pix, Cartão de débito, Cartão de crédito) ficam todas disponíveis, com Pix marcado no primeiro lançamento (responde D-QA-02 do 05-criterios-aceite). [CONFIRMADO, F-08] No MVP não há tela de gestão: a lista vem dos dados iniciais, cadastrada pela equipe. |
| S-BL-04 | [SUPOSIÇÃO] "Desfazer" do aviso pós-salvar é uma exclusão lógica comum (fica no histórico), e não um apagamento do registro local. |
| S-BL-05 | [SUPOSIÇÃO] Reordenar por arrastar (FIN-US-03.5) fica no MVP porque está no 02-design, embora o protótipo HTML não o tenha. É a primeira candidata a corte se for preciso reduzir o MVP. |
| S-BL-06 | [SUPOSIÇÃO] As suposições já marcadas na visão, no design e na arquitetura (limites de valor, prazos de backup, 24 h de pendência, ~5 min de sincronização, forma de pagamento pré-selecionada, "repetir último", filtro por veículo, histórico com conflito) foram mantidas como estão; as histórias que dependem delas estão marcadas. |
| S-BL-07 | [CONFIRMADO, F-05] Todo lançamento, inclusive o Pessoal, pertence a uma unidade (unidade obrigatória), como na arquitetura. Responde a dúvida 12 da visão. |
| S-BL-08 | [SUPOSIÇÃO] O protótipo de referência foi considerado pelo que o 02-design §8.3 descreve dele; onde o protótipo ainda não tem o item (veículo, calendário), valem os wireframes e o texto do 02-design. |
| S-BL-09 | [CONFIRMADO, visão §5.1 item 3] A categoria de sistema **"Produtos" é de saída** (compra de produtos; é nela que o Estoque vai gerar saídas, PIF-02). A venda de produtos ao cliente é outra categoria, **de entrada: "Venda de produtos"**. FIN-US-01.6 carrega as duas; FIN-US-02.4 usa "Venda de produtos". Nenhuma história trata "Produtos" como entrada. |

### 6.2 Dúvidas que bloqueiam ou mudam histórias

| # | Dúvida | Histórias afetadas | Efeito |
|---|---|---|---|
| D-BL-01 | ~~**E2-04 / DU-12:** qual é a regra de obrigatoriedade entre tipo de serviço e tipo de veículo numa entrada de serviço? (a) veículo obrigatório e serviço opcional; (b) os dois opcionais; (c) os dois obrigatórios, independentes.~~ **Respondida (E2-04): opção a**, veículo obrigatório e tipo de serviço opcional. | 02.5, 02.12, 01.3, 04.7, 05.4, 05.6 | Aplicada na v3: FIN-US-02.12 desbloqueada (2 → 3 pts); "entrada de serviço" = categoria "Serviços"; "Sem tipo de serviço" no Resumo (05.4) e no filtro do Extrato (04.7). |
| D-BL-02 | **Período padrão com período compartilhado (E2-10):** o 02-design diz que o Extrato abre em **Hoje** e o Resumo em **Mês atual**, mas também que o período vale junto para as duas telas. Qual vale ao abrir o app: Hoje, Mês, ou o último escolhido? | 08.4, 04.2, 05.3 | Muda o estado inicial e se o período é guardado entre aberturas do app. |
| D-BL-03 | ~~**E2-02:** as 4 categorias de sistema podem ser renomeadas (e ter ícone e cor trocados), mas não desativadas?~~ **Respondida (F-06): sim**, podem ser renomeadas (nome, ícone, cor) e não podem ser desativadas. | 03.2 | Aplicada na v4: FIN-US-03.2 confirmada, sem mudança de pontos. |
| D-BL-04 | ~~**DU-05:** quem cadastra as unidades: o dono pelo app ou a equipe na implantação? E as formas de pagamento precisam de tela de gestão no MVP?~~ **Respondida (F-08):** a equipe cadastra unidades e formas de pagamento na implantação; sem telas no MVP. | 01.6, 08.5, 03.6 | Aplicada na v6: 08.5 e 03.6 continuam Pós-MVP (evolução). |
| D-BL-05 | ~~**DU-04 e dúvida 2 da arquitetura:** o dono quer ver o histórico de alterações e uma lixeira no app?~~ **Respondida (F-09): sim**, com lixeira de 90 dias. | 06.4, 06.5 | Aplicada na v6: as duas entram no MVP (06.4 sobe de 3 para 5; 06.5 fica em 3), +8 pontos. |
| D-BL-06 | ~~**Dúvida 3 da arquitetura:** PIN/biometria ao abrir o app?~~ **Respondida (F-10): não.** | 09.7 | Aplicada na v6: FIN-US-09.7 descartada. |
| D-BL-07 | ~~**Dúvidas 4 e 6 da arquitetura:** aceita custo de plano pago (Supabase/PowerSync)? Só Android ou também iPhone?~~ **Respondida:** só Android (F-03) e **só planos gratuitos** (F-03b): PowerSync se o gratuito atender, backup próprio semanal. | 07.1, 07.10, 07.12, 09.2, 09.6 | Aplicada na v8: prova de conceito FIN-US-07.10, contingência FIN-US-07.12 e backup semanal na FIN-US-09.2. |
| D-BL-08 | **Dúvida 1 da arquitetura:** aceita "vale a última alteração enviada, com aviso e histórico" para edição em dois aparelhos? | 07.7 | Deixou de afetar o MVP: com um celular só (F-15), a FIN-US-07.7 foi para a v1.1. Continua aberta para quando ela for feita. |
| D-BL-09 | **Dúvidas 12 e 13 da visão:** ~~lançamento Pessoal pertence a uma unidade?~~ **Respondida (F-05): sim**, unidade obrigatória em todo lançamento. Categorias separadas para Pessoal e Empresa? (dúvida 13, **aberta**) | 02.2, 05.1 (dúvida 12, aplicada na v5) · 03.7 (dúvida 13) | A unidade continua obrigatória (FIN-US-02.2, S-BL-07). A dúvida 13 ainda pode trazer a FIN-US-03.7 para o MVP. |
| D-BL-10 | **DU-06:** o cartão da Início abre em Hoje ou em Mês? | 05.1 | Só muda a aba padrão. |

Dúvidas da visão que **não** mudam este backlog agora, mas podem gerar histórias novas: 1 (reembolso), 2 (mão de obra), 3 (passagem/alimentação), 4 (água), 5a (lista completa de tipos de serviço — só afeta os dados iniciais), 6 (foto do comprovante), 7 (gastos recorrentes), 8 (exportar para o contador), 9 (controle atual), 10 (interpretação Pessoal/Empresa), 11 (quem vê itens Pessoais na expansão).

---

## 7. Fora do escopo / módulos futuros

| Item | Onde fica | Referência |
|---|---|---|
| Lançamento automático da entrada quando o serviço é concluído; placa, modelo e cliente no serviço | Atendimento/fila, Clientes | PIF-01, PIF-04 |
| Saída automática ao registrar compra de produto; custo de insumo por serviço | Estoque (arquivado em `modulo-01-estoque/`) | PIF-02 |
| Mão de obra e reembolso ligados ao funcionário, com histórico por pessoa | Funcionários/equipe | PIF-03 |
| Gerentes e funcionários: convite, gestão de usuários, papéis, permissões, visibilidade de itens Pessoais | Usuários, unidades e permissões | PIF-05, D-02, dúvida 11 |
| Pedido de reembolso pelo funcionário com aprovação | Expansão de usuários | D-02 (Opção B) |
| Versão para iPhone (iOS) | Depois do MVP, sem mudar a stack (Expo) | F-03 |
| Publicação em loja (Google Play) | Evolução; no MVP o app é distribuído por APK com instalação direta | F-04 |
| Contas a pagar e a receber com vencimento; gastos recorrentes | Evolução deste módulo | PIF-06, D-01, dúvida 7 |
| Regra de alteração de lançamentos gerados por outro módulo (`origem ≠ manual`) | Primeiro módulo que gerar lançamentos | 03-arquitetura §6.3 |
| Agendamento de clientes | Agendamento | visão §5.3 |
| Integração bancária, Pix automático, conciliação, importação de extrato | Fora do sistema por ora | visão §5.3 |
| Nota fiscal, impostos, contabilidade (DRE, balanço), folha de pagamento completa | Fora do sistema por ora | visão §5.3 |
| Foto do comprovante (`lancamento_anexo`, Supabase Storage) | Evolução deste módulo, se o dono pedir | dúvida 6 |
| Exportação para o contador (CSV/PDF) | Evolução deste módulo, se o dono pedir | dúvida 8 |
| Painel web para o dono | **Pós-MVP**, só consulta: épico FIN-EP-10 | ST-01, ST-06 |
| Notificações e alertas de gasto acima do normal | Não pedido | 03-arquitetura §8 |
| Histórico de alterações das tabelas de cadastro | Evolução | 03-arquitetura §8 |
| Modo escuro | Prioridade baixa | 02-design §5.7 |
