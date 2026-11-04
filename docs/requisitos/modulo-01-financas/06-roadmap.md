# Módulo 1 — Gestão de Finanças · Roadmap de entrega

Projeto: Lavajato Sistema
Documento: 06-roadmap.md · Autor: Agente de Roadmap (pedido do Orquestrador, Etapa 5) · Versão: 7 · Status: **rascunho para revisão** (v2: E2-04 decidida, opção a · v3: decisões F-06, F-12, F-13 e F-15; FIN-US-07.7 vai para a v1.1 · v4: decisões F-02 a F-10; MVP completo, só Android, APK direto, histórico e lixeira no MVP · v5: só plano gratuito e lista de serviços · v6: D-QA-04 resolvida · v7: **nova stack** — back-end NestJS com DDD, Clean Architecture e monólito modular, sincronização passando pelo NestJS, prova de conceito do PowerSync no M1, painel web Next.js de consulta como fase pós-MVP; totais do backlog v8)
Fontes: `01-visao.md` (v3, com as seções 9b, 9c e 9d), `03-arquitetura.md` (reescrito para a nova stack: §2.1, §2.2 e §9), `04-backlog.md` (v8), `05-criterios-aceite.md` (sendo atualizado pelo QA para a nova stack). Em caso de conflito, vale a visão; para pontos e dependências, vale o backlog.

> Convenção: **[CONFIRMADO]** veio do dono · **[SUPOSIÇÃO]** não validado · **[DÚVIDA]** precisa de resposta antes de virar regra.
> IDs abreviados nas listas: "02.5" = FIN-US-02.5. Pontos na escala do backlog (esforço relativo, não horas). Dúvidas deste documento usam **D-RM-nn**; suposições, **S-RM-nn**.
> Este documento **não estima datas nem velocidade**. A única conta de tempo está na §7.1, em uma tabela de cenários marcada [SUPOSIÇÃO].

---

## 1. Visão geral do roadmap

| Fase | Objetivo | Histórias | Pontos |
|---|---|---|---|
| **MVP** (marcos M1 → M2 → M3) [CONFIRMADO F-02] | O dono registra tudo o que entra e sai, de todas as unidades, com e sem internet, e fecha o mês sem planilha | **73** | **215** |
| ↳ M1 — Base e lançar no celular | Monorepo, banco, API NestJS (Identidade e Acesso, domínio de Finanças, Sincronização), prova de conceito do PowerSync, API hospedada, lançamentos offline e saldo do dia, em APK de teste | 38 | 118 |
| ↳ M2 — Ver e corrigir | Extrato com período e filtros, Resumo, detalhe, editar, excluir, histórico e lixeira | 21 | 60 |
| ↳ M3 — Gerenciar, blindar e entregar | Cadastros, sincronização à prova de falhas, segurança, backup semanal próprio, desempenho, APK final | 14 | 37 |
| **Painel web** (pós-MVP) [CONFIRMADO ST-06, ST-07] | Consultar no computador, só leitura, só o dono, com a mesma conta do app | 8 | 24 |
| **v1.1** | Ajustes pedidos pelo uso real, ainda com o dono como único usuário | 5 | 15 (+ candidatas sem história) |
| **v2** | Preparar o módulo para outros usuários e para os módulos seguintes | 2 | 3 (+ épicos novos ainda não estimados) |
| **Total do backlog** | | **88** | **257** |
| *Contingência* (fora dos totais) | FIN-US-07.12, sincronização própria, só se a prova de conceito reprovar o PowerSync; substitui a 07.1 | — | 8 (+3 no M1 e no MVP) |
| ~~MVP mínimo~~ | **Alternativa descartada pelo dono (F-02).** Mantida só como registro na §2.2 | — | — |

Princípios usados:

1. **Nada se perde antes de qualquer coisa** (RNF-08): banco local, API e sincronização começam no M1, não no fim.
2. **Decidir cedo o que é mais incerto:** a prova de conceito do PowerSync no plano gratuito (07.10) é uma das primeiras histórias, porque decide entre a 07.1 (5 pontos) e a contingência 07.12 (8 pontos) e escolhe a hospedagem gratuita da API.
3. **Algo testável na mão do dono no fim de cada marco**, por APK de instalação direta (F-04). Por isso a 09.6 (APK) e a 09.9 (API hospedada) ficam no M1: sem API publicada, o celular do dono não sincroniza.
4. **Regras no back-end** [CONFIRMADO ST-04]: toda escrita do celular passa pelo NestJS (`POST /sync/upload`); o app não grava direto no Postgres.
5. **Relatórios dependem de dados, não o contrário**: lançar vem antes de ver.

**Cadeia mais longa do MVP** (não encurta com mais gente, porque cada história depende da anterior): 01.11 → 01.2 → 01.12 → 01.14 → 01.5 → 01.15 → 07.11 → 07.1 → 08.2 → 02.2 → 02.5 → 04.1 → 04.2 → 08.4 → 05.3 → 05.4 → 05.5 → 05.6 = **69 pontos** (eram 53 antes do back-end). Com a contingência no lugar da 07.1, vai a 72. A cadeia da sincronização (… → 07.11 → 07.1 → 07.2 → 07.3 → 07.6 → 07.9) soma 45 pontos.

Os totais seguem o backlog v8. Em relação à versão 6 deste documento, o MVP passou de 62 histórias e 175 pontos para 73 e 215: entraram o monorepo (01.11), a API NestJS (01.12 a 01.16), o pacote de domínio compartilhado (01.17), os testes de API (01.18), a prova de conceito (07.10), o módulo Sincronização (07.11) e a hospedagem da API (09.9), e algumas histórias foram reestimadas (ex.: 01.4 e 02.12 com 2 pontos, 09.4 com 2).

---

## 2. Fases (MVP com marcos, MVP mínimo, v1.1, v2)

### 2.1 MVP

**Objetivo:** cumprir o escopo da visão §5.1 para o único usuário (dono), em todas as unidades, com dados no aparelho e no Supabase, regras no back-end NestJS, só para Android (F-03), distribuído como APK de instalação direta e atualizado pelo próprio app (F-04), só em planos gratuitos (F-03b). Atende OBJ-01 a OBJ-05.

**Total: 73 histórias · 215 pontos · 3 marcos.** Escolha do dono: **MVP completo** (F-02).

#### M1 — Base e lançar no celular (38 histórias · 118 pontos)

O M1 ficou com mais da metade dos pontos do MVP porque carrega todo o back-end novo. Para o dono não ficar sem nada para ver por muito tempo, ele tem um **ponto de controle interno** no meio:

- **M1-A — Base técnica e prova de conceito (22 histórias · 76 pontos).** Fim: prova de conceito decidida (PowerSync ou contingência), API publicada com HTTPS, app instalado por APK, login funcionando e um lançamento de teste indo do celular ao Postgres **pelo NestJS**. É uma demonstração para o dono, não ainda um uso.
- **M1-B — Lançar no celular (16 histórias · 42 pontos).** Fim: o dono lança saídas, outras entradas e carros (com "Mais um igual" e "Repetir"), com e sem internet, e vê Entrou/Saiu/Sobrou de hoje e do mês no cartão da Início.

**Ainda não tem no fim do M1:** extrato, resumo, editar/excluir (só "Desfazer" no aviso), histórico e lixeira, telas de cadastro, indicador de sincronização. [SUPOSIÇÃO S-RM-01] Nesta fase o dono usa o app **em paralelo** ao controle atual, como teste.

| ID | História resumida | Pts | Dependências | Parte |
|---|---|---|---|---|
| FIN-US-01.11 | Monorepo (`apps/mobile`, `apps/api`, pacotes compartilhados) | 3 | — | A |
| FIN-US-01.2 | Projeto Supabase gratuito (sa-east-1), schema por módulo, migrações versionadas | 2 | 01.11 | A |
| FIN-US-01.1 | App Expo + navegação com barra inferior | 3 | 01.11 | A |
| FIN-US-01.17 | Pacote `dominio-compartilhado` (`normalizarNome` F-16, regras puras) | 2 | 01.11 | A |
| FIN-US-01.3 | Esquema do banco (schemas `identidade` e `financas`, centavos, auditoria, `nome_chave`) | 5 | 01.2 | A |
| FIN-US-01.12 | Base da API NestJS (kernel compartilhado, Clean Architecture, monólito modular) | 5 | 01.11, 01.2 | A |
| FIN-US-01.7 | Entrar com e-mail e senha (Supabase Auth), sessão que funciona offline | 3 | 01.1, 01.2 | A |
| FIN-US-01.9 | Componentes base, ícones, formatação R$ e datas | 3 | 01.1 | A |
| FIN-US-09.6 | APK assinado Android 8+ (EAS), instalação direta, atualização pelo app [F-03, F-04] | 3 | 01.1 | A |
| FIN-US-01.4 | Acesso direto ao banco fechado (RLS sem políticas públicas, papel próprio da API) | 2 | 01.3 | A |
| FIN-US-01.6 | Dados iniciais (organização, unidades F-08, categorias, serviços F-14, veículos, formas F-12) | 2 | 01.3 | A |
| FIN-US-07.10 | **Prova de conceito do PowerSync no plano gratuito** + escolha da hospedagem da API [F-03b] | 3 | 01.2, 01.12 | A |
| FIN-US-01.13 | Módulo Identidade e Acesso (valida JWT, vínculos e papéis por unidade) | 5 | 01.12, 01.3 | A |
| FIN-US-01.14 | Domínio do lançamento (agregado `Lancamento`, TypeScript puro) | 5 | 01.12, 01.17 | A |
| FIN-US-01.5 | Histórico de alterações gravado pelo back-end na mesma transação | 3 | 01.12, 01.14 | A |
| FIN-US-01.16 | Agregados e casos de uso de cadastros e preferências | 5 | 01.12, 01.13, 01.17 | A |
| FIN-US-09.9 | API NestJS publicada em hospedagem gratuita (HTTPS, credenciais só no servidor) | 2 | 01.12, 07.10 | A |
| FIN-US-01.15 | Casos de uso Registrar/Editar/Excluir/Restaurar lançamento | 5 | 01.14, 01.13, 01.5 | A |
| FIN-US-07.11 | Módulo Sincronização no NestJS (`POST /sync/upload`) | 5 | 01.13, 01.15, 01.16 | A |
| FIN-US-07.1 | PowerSync no plano gratuito, app lendo e gravando no SQLite **[ou contingência 07.12, 8 pts]** | 5 | 07.10, 01.3, 01.4, 07.11 | A |
| FIN-US-01.18 | Testes de API automatizados (upload válido/inválido, idempotência, autorização) | 3 | 01.15, 01.16, 07.11 | A |
| FIN-US-07.2 | UUID v7 no aparelho, `dispositivo`, envio sem duplicar | 2 | 07.1, 07.11 | A |
| FIN-US-08.1 | Tela Mais/Ajustes | 2 | 01.1 | B |
| FIN-US-08.3 | Unidade atual (seletor no topo) | 3 | 01.6, 01.9 | B |
| FIN-US-08.2 | Padrão Pessoal/Empresa sincronizado | 2 | 08.1, 07.1 | B |
| FIN-US-01.8 | Primeiro uso: boas-vindas, unidade inicial, download | 2 | 01.7, 07.1, 08.3 | B |
| FIN-US-02.1 | Valor estilo caixa registradora | 3 | 01.9 | B |
| FIN-US-02.11 | Botões + Carro / + Entrou / − Saiu na Início | 1 | 01.1, 01.9 | B |
| FIN-US-02.2 | Campos comuns pré-preenchidos (Pix no primeiro lançamento, F-12) | 5 | 01.9, 01.6, 08.2, 08.3 | B |
| FIN-US-07.3 | Sincronização automática (salvar, abrir, voltar a rede, ~5 min) | 3 | 07.2 | B |
| FIN-US-02.3 | Lançar saída | 3 | 02.1, 02.2, 07.2 | B |
| FIN-US-02.5 | Entrada de serviço carro por carro (veículo obrigatório, serviço opcional) | 5 | 02.1, 02.2, 07.2 | B |
| FIN-US-02.10 | "Descartar este lançamento?" | 1 | 02.2 | B |
| FIN-US-02.4 | Lançar outra entrada | 2 | 02.3 | B |
| FIN-US-02.8 | Volta à Início com aviso e Desfazer | 2 | 02.3 | B |
| FIN-US-02.12 | Regra serviço × veículo no app e no domínio [CONFIRMADO E2-04 a] | 2 | 02.5, 01.17 | B |
| FIN-US-02.9 | "Mais um igual" e "Repetir" | 3 | 02.5, 02.8 | B |
| FIN-US-05.1 | Cartão Entrou/Saiu/Sobrou na Início (Hoje/Mês, Empresa/Pessoal/Tudo) | 3 | 02.3, 02.4, 02.5 | B |

**Ordem de construção do M1** (cada passo só começa quando as dependências terminam; dentro do passo, as histórias são independentes entre si):

1. 01.11
2. 01.2 · 01.1 · 01.17
3. 01.3 · 01.12 · 01.7 · 01.9 · 09.6 (primeiro APK o quanto antes, ver R-RM-04)
4. 01.4 · 01.6 · **07.10** · 01.13 · 01.14 · 08.1 · 02.1 · 02.11
5. **Decisão da prova de conceito** (PowerSync ou contingência 07.12) · 01.5 · 01.16 · 09.9 · 08.3
6. 01.15
7. 07.11
8. 07.1 (ou 07.12) · 01.18
9. 07.2 · 08.2 · 01.8 → **fim do M1-A** (lançamento de teste chega ao Postgres pelo NestJS)
10. 02.2 · 07.3
11. 02.3 · 02.5 · 02.10
12. 02.4 · 02.8 · 02.12
13. 02.9 · 05.1 → **fim do M1**

Observações do M1:

- **Trabalho em paralelo:** as telas que não dependem do back-end (01.9, 02.1, 02.11, 08.1, 08.3) podem andar ao mesmo tempo que a API (passos 3 a 8).
- **Prova de conceito como portão:** se a 07.10 reprovar o PowerSync, a 07.12 (8 pontos) entra no lugar da 07.1 (5 pontos), o M1 vai a 121 e o MVP a 218. A escolha da hospedagem gratuita da API também sai dela, por isso a 09.9 vem logo depois.
- **Dados iniciais:** a lista de serviços já está definida (F-14: Lavagem rápida, Lavagem completa, Polimento, Higienização interna, Cristalização). Outros serviços o dono cria pelo "+ Novo serviço" a partir do M2.
- **Nomes repetidos:** a regra F-16 (ignora maiúsculas, acentos e espaços nas pontas) vive no pacote compartilhado (01.17) e na coluna `nome_chave` do esquema (01.3), usada pelo app e pela API.
- Critérios do M1 que citam telas de marcos seguintes (ex.: primeiro uso e uso offline citam extrato, resumo e cadastros; a tela Mais cita as TELA-10/11/12/14) são verificados na parte que existe no M1 e **reverificados por inteiro** no marco em que a tela chega.

#### M2 — Ver e corrigir (21 histórias · 60 pontos)

**Entrega testável:** o dono confere o extrato por período (atalhos e calendário), unidade, Pessoal/Empresa, categoria, serviço (com "Sem tipo de serviço") e veículo; vê o Resumo de gastos por categoria e de serviços por tipo de serviço e por veículo; toca num número e cai no extrato filtrado; abre o detalhe, edita, exclui, vê o histórico de alterações e recupera excluídos na lixeira (90 dias); cria serviço e veículo sem sair do lançamento; vê o estado da nuvem no topo da Início.
**Ainda não tem:** telas de cadastro, tela de Sincronização com o botão, tratamento completo de erros, sair da conta, backup, APK final.

| ID | História resumida | Pts | Dependências |
|---|---|---|---|
| FIN-US-04.1 | Extrato agrupado por dia, com totais do filtro | 5 | 02.3, 02.5 |
| FIN-US-07.4 | Indicador de estado da nuvem + relógio nos pendentes | 3 | 07.3 |
| FIN-US-02.6 | "+ Novo serviço" dentro do lançamento | 3 | 02.5, 01.17 |
| FIN-US-05.2 | Consolidado "Todas as unidades" com Sobrou por unidade | 2 | 05.1, 08.3 |
| FIN-US-04.2 | Período: atalhos + calendário de intervalo | 5 | 04.1 |
| FIN-US-04.3 | Filtros de unidade e Empresa/Pessoal/Tudo | 3 | 04.1 |
| FIN-US-04.6 | Últimos 5 lançamentos na Início | 2 | 04.1 |
| FIN-US-06.1 | Detalhe do lançamento | 2 | 04.1 |
| FIN-US-02.7 | "+ Novo veículo" dentro do lançamento | 2 | 02.6 |
| FIN-US-04.4 | Filtro por categoria | 2 | 04.3 |
| FIN-US-08.4 | Período compartilhado Extrato ↔ Resumo | 2 | 04.2 |
| FIN-US-06.2 | Editar lançamento (sem trocar o tipo, F-13) | 3 | 06.1, 01.5 |
| FIN-US-06.3 | Excluir lançamento (lógico) | 2 | 06.1 |
| FIN-US-04.5 | Filtro por tipo de veículo | 2 | 04.4 |
| FIN-US-04.7 | Filtro por tipo de serviço, com "Sem tipo de serviço" | 2 | 04.4 |
| FIN-US-05.3 | Gastos por categoria (barras) | 5 | 04.2, 04.3, 08.4 |
| FIN-US-06.4 | Histórico de alterações no app [F-09] | 5 | 06.1, 06.2, 01.5, 07.1 |
| FIN-US-06.5 | Lixeira: recuperar excluídos por 90 dias [F-09] | 3 | 06.3, 01.5, 08.1, 02.8 |
| FIN-US-05.4 | Serviços por tipo de serviço, com "Sem tipo de serviço" | 3 | 05.3 |
| FIN-US-05.5 | Serviços por tipo de veículo | 2 | 05.4 |
| FIN-US-05.6 | Do Resumo para o Extrato filtrado | 2 | 05.3, 05.5, 04.4, 04.5, 04.7 |

**Ordem de construção do M2:**

1. 04.1 · 07.4 · 02.6 · 05.2
2. 04.2 · 04.3 · 04.6 · 06.1 · 02.7
3. 04.4 · 08.4 · 06.2 · 06.3
4. 04.5 · 04.7 · 05.3 · 06.4 · 06.5
5. 05.4
6. 05.5
7. 05.6

A sequência 04.2 → 08.4 → 05.3 → 05.4 → 05.5 → 05.6 é o trecho final da cadeia mais longa do MVP; vale começá-la cedo no marco. As 06.4 e 06.5 correm em paralelo a ela; antes delas, o Design precisa das telas de histórico e de lixeira.

#### M3 — Gerenciar, blindar e entregar (14 histórias · 37 pontos)

**Entrega:** o MVP completo, entregue como APK de instalação direta no celular Android do dono (F-04), com cadastros editáveis, sincronização à prova de falhas, saída segura da conta, backup semanal próprio com restauração testada, revisão de segurança e desempenho medido. A partir daqui o app pode ser **o registro oficial** do dono.

| ID | História resumida | Pts | Dependências |
|---|---|---|---|
| FIN-US-03.1 | Categorias: criar, renomear, desativar | 5 | 01.6, 01.16, 07.1, 08.1 |
| FIN-US-03.3 | Tipos de serviço: criar, renomear, desativar (nome único F-16) | 3 | 01.6, 01.16, 07.1, 08.1 |
| FIN-US-07.5 | Tela de Sincronização + "Sincronizar agora" | 3 | 07.4, 08.1 |
| FIN-US-07.6 | Falhas de envio sem perda (espera crescente, sessão, erros) | 5 | 07.3 |
| FIN-US-07.8 | Aviso de pendências há mais de 24 h | 1 | 07.4 |
| FIN-US-09.1 | Sair da conta apagando os dados locais | 2 | 01.7, 07.4 |
| FIN-US-09.2 | Backup próprio semanal (`pg_dump` agendado, fora do Supabase) + restauração testada [F-03b] | 3 | 01.2, 01.11 |
| FIN-US-09.3 | Política de privacidade + orientação na descrição | 1 | 02.2 |
| FIN-US-03.2 | 4 categorias de sistema travadas (renomeiam, não desativam, F-06) | 2 | 03.1 |
| FIN-US-03.4 | Tipos de veículo: criar, renomear, desativar | 3 | 03.3 |
| FIN-US-07.9 | Roteiro de resiliência executado | 2 | 07.6 |
| FIN-US-09.5 | Desempenho medido com 10.000 lançamentos | 2 | 04.1, 05.3 |
| FIN-US-03.5 | Reordenar categorias, serviços e veículos | 3 | 03.1, 03.3, 03.4 |
| FIN-US-09.4 | Revisão de segurança (credenciais só no servidor, HTTPS, acesso direto fechado) | 2 | 01.4, 01.13, 07.1 |

**Ordem de construção do M3:**

1. 07.6 · 07.5 · 07.8 · 03.1 · 03.3 · 09.2 · 09.3 · 09.1
2. 07.9 · 03.2 · 03.4 · 09.5
3. 03.5
4. 09.4 (última, sobre a versão candidata) → APK final instalado no celular do dono

A 09.2 (backup) não depende de nada recente e pode ser adiantada para qualquer ponto depois do M1-A; ela **precisa** estar pronta antes de o dono passar a usar o app como registro oficial.

#### Conferência dos totais do MVP

| Marco | Histórias | Pontos |
|---|---|---|
| M1 (A + B) | 38 (22 + 16) | 118 (76 + 42) |
| M2 | 21 | 60 |
| M3 | 14 | 37 |
| **MVP** | **73** | **215** |

Somas feitas a partir das tabelas acima; batem com o backlog v8 (73 histórias, 215 pontos).

#### Se for preciso enxugar o MVP completo sem mudar a ideia

Primeiras candidatas a sair do MVP (vão para a v1.1), em ordem: FIN-US-03.5 reordenar (3, já indicada na S-BL-05) · FIN-US-05.6 do Resumo para o Extrato (2) · FIN-US-04.7 e 04.5 filtros por serviço e por veículo (2 + 2; o Resumo por serviço e por veículo continua). Total possível: 9 pontos. As histórias do back-end **não** são candidatas: sem elas nada é gravado.

---

### 2.2 MVP mínimo (alternativa descartada pelo dono, F-02)

> **Alternativa descartada pelo dono (F-02).** O dono escolheu o MVP completo. Esta seção fica só como registro e **não é mais atualizada**: os números são da versão 3 deste documento, antes do histórico e lixeira no MVP (F-09) e da nova stack.

**Ideia registrada:** publicar para uso real assim que o registro estivesse seguro (M1 + sincronização completa + backup + extrato simples, editar e excluir), deixando Resumo, filtros e telas de cadastro para uma atualização. Na versão 3 somava 43 histórias e 119 pontos. Perdia, até o complemento, o Resumo por categoria (OBJ-04), o calendário de período e as telas de cadastro.

**Decisão do dono (F-02):** MVP completo. O MVP mínimo não será construído.

---

### 2.3 Painel web — consulta no computador (pós-MVP)

**Objetivo:** o dono consulta no computador o que já vê no app (visão geral do mês, extrato em tabela, resumo, histórico e lixeira), **só leitura**, com a **mesma conta** do app, criada na implantação [CONFIRMADO ST-06, ST-07]. Não lança, não edita e não gerencia cadastros: para isso, o app.

**Quando:** depois do MVP do app (ST-06). Tecnicamente, as dependências do painel estão todas no M1 (Identidade e Acesso e casos de uso de lançamento), mas a decisão do dono é fazê-lo depois do MVP.

**Total: 8 histórias · 24 pontos.**

| ID | História resumida | Pts | Dependências |
|---|---|---|---|
| FIN-US-10.1 | Projeto Next.js em `apps/painel`, login pelo Supabase Auth, chama só a API NestJS | 3 | 01.11, 01.13 |
| FIN-US-10.2 | Consultas do painel no módulo Finanças do NestJS (extrato, resumo, visão geral, histórico, lixeira) | 5 | 01.15, 01.13 |
| FIN-US-10.3 | Entrar no painel com o mesmo e-mail e senha do app | 1 | 10.1 |
| FIN-US-10.4 | Visão geral do mês (Entrou/Saiu/Sobrou por unidade, barras por dia, 5 maiores gastos) | 3 | 10.2, 10.3 |
| FIN-US-10.5 | Extrato em tabela (ordenação, busca, filtros) | 5 | 10.2, 10.3 |
| FIN-US-10.6 | Detalhe e histórico do lançamento em painel lateral, só leitura | 2 | 10.5 |
| FIN-US-10.7 | Resumo (gastos por categoria, serviços por tipo e por veículo, comparação entre unidades) | 3 | 10.2, 10.3 |
| FIN-US-10.8 | Lixeira em tabela, sem restaurar | 2 | 10.2, 10.3 |

**Ordem:** 10.1 · 10.2 → 10.3 → 10.4 · 10.5 · 10.7 · 10.8 → 10.6.

**Antes de começar:** a conta do dono já criada na implantação (ST-07); o Design com as telas do painel; a escolha da hospedagem gratuita do painel, conferindo se os termos permitem uso comercial (03-arquitetura §2.1), ou servir o painel no mesmo host da API.

---

### 2.4 v1.1 — Ajustes depois do uso real

**Objetivo:** atender o que o dono sentir falta nas primeiras semanas de uso, ainda como único usuário. Todas as histórias já estão no backlog como Pós-MVP; entram só se o dono pedir ou se a condição acontecer.

**Total: 5 histórias · 15 pontos** (+ candidatas sem história).

| ID | História resumida | Pts | Dependências | Condição |
|---|---|---|---|---|
| FIN-US-08.5 | Cadastrar e editar unidades pelo app | 3 | 08.1 | F-08: no MVP as unidades vêm da implantação; entra só se o dono pedir |
| FIN-US-03.6 | Gestão de formas de pagamento | 3 | 08.1 | F-08: entra só se o dono pedir; precisa de tela nova no 02-design |
| FIN-US-05.7 | Cruzamento tipo de serviço × tipo de veículo | 3 | 05.5 | [CONFIRMADO E2-08] fica para depois |
| FIN-US-03.7 | Categorias próprias para Pessoal e Empresa | 3 | 03.1 | Dúvida 13 da visão; se a resposta for "mesma lista", a história sai |
| FIN-US-07.7 | Conflito entre aparelhos (vale a última alteração recebida, histórico com conflito e aviso) | 3 | 07.3, 01.5, 06.4 | **Só se o dono passar a usar mais de um aparelho** (F-15); a regra ainda depende da D-BL-08 |

**Ordem:** todas as dependências já estão no MVP. Sugestão por valor: 05.7 → 08.5 → 03.6 → 03.7. A 07.7 passa à frente **antes** de o dono começar a usar um segundo aparelho. Antes de 03.6 e 08.5, o Design precisa desenhar as telas novas. A FIN-US-09.7 (PIN/biometria) saiu do roadmap (F-10).

**Candidatas sem história** (só se o dono pedir; o Dev escreve e estima): foto do comprovante (dúvida 6), exportação para o contador em CSV/PDF (dúvida 8), versão para iPhone (F-03) e publicação em loja (F-04).

---

### 2.5 v2 — Preparar para outros usuários e outros módulos

**Objetivo:** deixar o módulo pronto para a expansão de usuários (D-02) e para os próximos módulos do monólito modular (Estoque, Atendimento, Clientes, Equipe), que vão receber e gerar lançamentos (PIF-01 a PIF-06).

**Total: 2 histórias · 3 pontos** (+ épicos novos ainda não estimados).

| ID | História resumida | Pts | Dependências |
|---|---|---|---|
| FIN-US-01.10 | Tabela de saída (outbox) no Postgres para entregar os eventos de domínio de Finanças | 2 | 01.15 |
| FIN-US-09.8 | Procedimento de exclusão definitiva de titular (LGPD) | 1 | 01.3 |

**Ordem:** 09.8 antes de qualquer usuário além do dono (RNF-26); 01.10 quando existir o primeiro módulo que consuma os eventos.

**Épicos novos que a v2 precisa, sem histórias nem pontos ainda:**

| Épico candidato | Origem | Observação |
|---|---|---|
| Expansão de usuários: gerentes e funcionários, convites, papéis, visibilidade dos itens Pessoais, pedido de reembolso com aprovação | D-02, PIF-05, dúvidas 1 e 11 | O vínculo usuário × unidade × papel e o módulo Identidade e Acesso (01.13) já existem; falta todo o comportamento |
| Contas a pagar e a receber, gastos recorrentes | D-01, PIF-06, dúvida 7 | O campo `situacao` já está reservado; muda a ideia de "só o realizado" e pede decisão nova do dono |

---

## 3. Definição de pronto por fase

### 3.1 Vale para toda história, em qualquer fase

- Todos os critérios CA da história no 05 passam **com e sem internet** (no app), salvo quando o critério diz o contrário.
- Os testes automatizados ligados à história existem e passam na integração contínua.
- Migrações versionadas; nenhuma mudança à mão no banco (RNF-27).
- **Regras de domínio no back-end** (ST-04): nenhuma regra de negócio só no app; o domínio do NestJS tem testes de unidade sem banco nem framework; as regras compartilhadas vêm do pacote `dominio-compartilhado` (01.17), usadas pelo app e pela API.
- **Nenhuma escrita do app direto no Postgres:** toda gravação passa pelo `POST /sync/upload` (07.11); credenciais do banco, chave `service_role` e chaves do PowerSync só no servidor.
- Nenhum valor monetário tratado fora de centavos inteiros.
- Toda regra que depende de dúvida aberta está isolada e marcada.
- Revisão de código feita.

### 3.2 Por fase

O QA está atualizando o 05 para a nova stack; por isso a tabela cita os critérios **por história**, sem contagem.

| Fase | Critérios de aceite | Testes automatizados exigidos | Checklist manual | Indicadores que a fase permite medir |
|---|---|---|---|---|
| **M1-A** (ponto de controle) | Os critérios das 22 histórias do M1-A no 05, em especial os da prova de conceito (07.10: volume, inatividade, envio pelo NestJS, JWT), do acesso fechado (01.4), da Identidade e Acesso (01.13), da Sincronização (07.11) e da API hospedada (09.9) | **Unidade:** domínio puro (agregado `Lancamento`, cadastros, `normalizarNome`). **Integração / API (01.18):** upload válido e inválido, envio repetido sem duplicar, recusa de unidade sem vínculo, histórico gravado na mesma transação, acesso direto ao banco recusado com a chave pública. **E2E mínimo:** login e um lançamento de teste chegando ao Postgres pelo NestJS | Relatório da prova de conceito registrado (decisão PowerSync ou contingência e hospedagem escolhida); APK instalado no celular do dono; API respondendo por HTTPS | Nenhum indicador de negócio ainda |
| **M1** | Os critérios das 38 histórias do M1, incluindo os da regra serviço × veículo (02.12); parte dos critérios de primeiro uso, sincronização e Ajustes é reverificada nos marcos seguintes. Casos de borda de valor, datas e fuso, duplicados, "Todas as unidades" ao lançar, Pessoal/Empresa no lançamento e acesso entre unidades | Os do M1-A + **unidade:** caixa registradora, formatação, somas em centavos (teste de propriedade), "hoje" no fuso da unidade, validações do formulário, "Repetir"/"Mais um igual". **E2E:** primeiro uso, uso offline, lançar saída/entrada/serviço, três carros com "Mais um igual", offline → fechar à força → reabrir → tudo chega ao servidor | Login certo e errado; primeiro uso; botões na zona do polegar; teclado e caixa registradora; valor zero e "Confere?"; saída em ≤ 4 toques; serviço com veículo pré-marcado e serviço opcional; aviso, Desfazer e "Mais um igual"; toque duplo no Salvar; "Descartar?"; Todas as unidades exige unidade; troca de unidade; cartão Hoje/Mês; lançamento às 23h30; modo avião: abre sem login, lança, fecha à força, reinicia, reconecta; primeira sincronização depois de a API "dormir" | **OBJ-01** (teste com o dono: 10 lançamentos reais, ≤ 15 s e ≤ 4 toques). **OBJ-05** (consulta no servidor: 100% com usuário, unidade, data e categoria). **OBJ-03** parcial (saldo do mês por unidade no cartão) |
| **M2** | Os critérios das 21 histórias do M2, incluindo filtro e linha "Sem tipo de serviço" (04.7, 05.4, 05.6), histórico (06.4) e lixeira com saída após 90 dias (06.5); reverificação do uso offline com extrato e resumo. Casos de borda de somas, período e filtros Pessoal/Empresa | **Unidade:** períodos (atalhos, intervalo, inversão, inclusivo), percentuais, filtros e totais, nome repetido normalizado (02.6/02.7). **API:** editar, excluir e restaurar pelo upload, com histórico. **Integração:** reconciliação de totais aparelho × servidor. **E2E:** extrato com período e filtros, Resumo → Extrato, editar, excluir → lixeira → restaurar, histórico depois de editar | Tudo do M1 + Extrato (agrupamento, filtros, "Limpar filtros", sem resultado); período (atalhos, um dia, intervalo invertido, 3º toque, futuro apagado); período igual no Extrato e no Resumo; Resumo › Gastos e › Serviços (com "Sem tipo de serviço"); detalhe, editar, excluir; histórico; lixeira e restaurar; "+ Novo serviço" e "+ Novo veículo"; indicador da nuvem | **OBJ-03** completo. **OBJ-04** (gastos por categoria, período e unidade). **OBJ-05** visível no app (histórico) |
| **M3 = MVP pronto** | **Todos** os critérios das 73 histórias MVP no 05 e os casos de borda, **exceto** os de conflito entre aparelhos (07.7), que vão para a v1.1 | Todos os do 05, incluindo: **integração** de fila com falha no meio do lote, retomada e erros; vínculo removido; **API** de cadastros (nome único F-16, categoria de sistema não desativa F-06); **E2E** de sessão expirada offline e sair da conta com pendências. Sem nenhum teste desligado | Checklist completo do 05 (sem os itens de dois aparelhos) em Android de entrada, Android recente, tela pequena e fonte grande. Mais: instalação do APK do zero e atualização por cima (pelo app e por APK novo) com pendências na fila, sem perder nada; roteiro de resiliência (07.9) aprovado; desempenho medido (09.5); **restauração testada a partir do backup semanal próprio** (09.2); checklist de segurança (09.4); política de privacidade em Mais › Sobre | **OBJ-01 a OBJ-05** mensuráveis. **OBJ-02** (≥ 95% dos gastos lançados) só **um mês depois** de o app virar o registro oficial, comparando com comprovantes e extrato bancário (manual, com o dono) |
| **Painel web** | Os critérios das 8 histórias do FIN-EP-10 no 05 (o QA está escrevendo), com os RNF-29 a RNF-33 da arquitetura | **API:** consultas do painel só devolvem dados das unidades do dono; nenhuma rota de escrita exposta ao painel; mesma regra de totais do app. **E2E no navegador:** login com a conta do app, visão geral, extrato com filtros e ordenação, detalhe com histórico, resumo, lixeira sem restaurar | No computador (navegador de mesa): mesmo e-mail e senha do app; números iguais aos do app depois de sincronizar; avisos "Para corrigir, use o app" e "Para recuperar, use a Lixeira do app"; tempo das consultas do mês, descontando a primeira chamada depois de a hospedagem gratuita "dormir" (RNF-33) | Nenhum indicador novo; OBJ-03 e OBJ-04 passam a ser vistos também no computador |
| **v1.1** | Critérios novos para cada história que entrar; para a 07.7, os critérios de conflito já escritos; regressão do MVP | Os das histórias novas (para a 07.7: integração com dois clientes editando offline) + regressão completa | Checklist do MVP + telas novas (+ dois aparelhos reais em conflito, se a 07.7 entrar) | Nenhum indicador novo |
| **v2** | Critérios das histórias e épicos novos; regressão do MVP | Autorização no Identidade e Acesso estendida aos papéis `gerente` e `funcionario`; testes da outbox | Checklist com mais de um usuário e unidades diferentes | **OBJ-05** medido com vários usuários |

---

## 4. Dependências de outros módulos

Com o **monólito modular** [CONFIRMADO ST-04], cada módulo futuro (Estoque, Atendimento, Clientes, Equipe) vira um módulo isolado do NestJS, ao lado de Finanças e de Identidade e Acesso, e conversa com Finanças por casos de uso e eventos de domínio, não pelas tabelas.

O que o Módulo 1 **já deixa preparado** no MVP: campos `origem`, `origem_ref_*` e `situacao` no lançamento (01.3); vínculo usuário × unidade × papel e o módulo Identidade e Acesso (01.13); casos de uso de lançamento no back-end (01.15), que outro módulo pode chamar; categorias de sistema que não podem ser desativadas (03.2); histórico (01.5). O que **ainda falta** do lado deste módulo para qualquer integração: a tabela de saída de eventos (outbox, FIN-US-01.10, v2) e a regra de alteração de lançamentos gerados por outro módulo (`origem ≠ manual`), que ainda não tem história.

| PIF | Módulo de quem depende | O que entra no Finanças | Pré-requisitos no Finanças | Quando pode entrar |
|---|---|---|---|---|
| PIF-01 | Atendimento/fila | Serviço concluído e pago gera a entrada carro por carro, com veículo (obrigatório) e tipo de serviço (quando houver); a lista de tipos de serviço vira o catálogo do sistema | 01.10 (outbox); regra para `origem ≠ manual`; regra E2-04 a | Depois que o módulo de Atendimento existir. Até lá, o lançamento manual do MVP continua |
| PIF-02 | Estoque (arquivado em `modulo-01-estoque/`) | Compra de mercadoria gera saída na categoria de sistema "Produtos"; custo de insumo por serviço | 01.10; regra `origem ≠ manual`; categoria "Produtos" travada (03.2) | Depois que o módulo de Estoque for retomado e entregue |
| PIF-03 | Funcionários / equipe | Mão de obra e reembolso ligados ao funcionário | `origem_ref_*`; respostas das dúvidas 1, 2 e 3 da visão | Depois do módulo de Equipe |
| PIF-04 | Clientes | Entrada ligada ao cliente que pagou | `origem_ref_*`; normalmente junto com o PIF-01 | Depois do módulo de Clientes (e, na prática, do de Atendimento) |
| PIF-05 | Usuários, unidades e permissões | Gerentes e funcionários usando o app (e talvez o painel) | 09.8 (exclusão LGPD), dúvida 11, autorização do Identidade e Acesso estendida aos novos papéis | Na v2, quando o dono decidir expandir (D-02) |
| PIF-06 | Contas a pagar/receber (evolução deste módulo) | Contas com vencimento futuro e recorrentes | Campo `situacao` já reservado; nova decisão do dono revendo a D-01 | Na v2 ou depois, a pedido do dono |
| — | Integração bancária / Pix automático | Importação de extrato, conciliação | Não há PIF: fora do sistema por ora (visão §5.3) | Fora do roadmap (§5) |

---

## 5. Fora do roadmap

| Item | Por quê | Referência |
|---|---|---|
| Integração bancária, Pix automático, conciliação, importação de extrato | Fora do sistema por ora | visão §5.3 |
| Nota fiscal, impostos, contabilidade (DRE, balanço) | Fora do sistema por ora | visão §5.3 |
| Folha de pagamento completa | O módulo registra só o valor pago de mão de obra | visão §5.3 |
| Agendamento de clientes | Outro módulo, sem pedido para este | visão §5.3 |
| Placa, modelo e cliente no lançamento do serviço | Pertence a Atendimento e Clientes; entra pelo PIF-01/PIF-04 | E2-05 |
| Controle de estoque | Módulo próprio, arquivado; entra pelo PIF-02 | visão §1 |
| Lançar, editar ou gerenciar cadastros pelo painel web | O painel é só de consulta | ST-06 |
| MongoDB | Descartado pelo dono | ST-03 |
| Notificações e alertas de gasto acima do normal | Não foi pedido | 03-arquitetura |
| Histórico de alterações das tabelas de cadastro | Evolução sem pedido; os campos de auditoria já existem | 03-arquitetura |
| Modo escuro | Prioridade baixa | 02-design §5.7 |
| PIN ou biometria ao abrir o app | Descartado pelo dono | F-10 |
| Foto do comprovante, exportação, iPhone, loja | **Não estão fora de vez**: candidatas da v1.1, só se o dono pedir | §2.4 |

---

## 6. Decisões que bloqueiam o roadmap

Os prazos são marcados por **ponto do roadmap**, não por data.

### 6.1 Bloqueiam ou mudam a base

Nenhuma dúvida do dono bloqueia o início do M1. A decisão que mais mexe na base agora é **técnica** e já tem lugar no roadmap: o resultado da prova de conceito (07.10), no passo 4 do M1.

| Dúvida | O que muda no roadmap | Precisa de resposta até |
|---|---|---|
| **Prova de conceito do PowerSync** (07.10, decisão técnica, F-03b) | Aprovado: segue a 07.1 (5 pontos). Reprovado: entra a contingência 07.12 (8 pontos), o M1 vai a 121 e o MVP a 218 | Passo 5 do M1, antes da 07.11 e da 07.1 |
| **Hospedagem gratuita da API** (decisão técnica, saída da 07.10) | Define a 09.9 e o comportamento da primeira sincronização depois de a API "dormir" | Passo 5 do M1 |
| **Dúvida 13 da visão** — categorias separadas para Pessoal e Empresa? | Só move a 03.7 entre v1.1, MVP (+3 no M3) ou fora | Antes do M3 (03.1) |

### 6.2 Bloqueiam histórias do MVP (responder durante o M1)

| Dúvida | O que muda no roadmap | Precisa de resposta até |
|---|---|---|
| **D-QA-08** — fuso do aparelho diferente do da unidade | Detalhe da 02.2 | Antes da 02.2 (passo 10 do M1) |
| **D-QA-06** — "Repetir" com "Todas as unidades" | Detalhe da 02.9 | Antes da 02.9 (passo 13 do M1) |
| **D-QA-10** — passar de R$ 999.999,99 | Detalhe da 02.1 | Antes da 02.1 (passo 4 do M1) |
| **D-BL-10** — cartão abre em Hoje ou Mês | Só a aba padrão da 05.1 | Antes da 05.1 (fim do M1) |

### 6.3 Bloqueiam histórias do M2, do M3 e do painel

| Dúvida | O que muda no roadmap | Precisa de resposta até |
|---|---|---|
| **D-BL-02** — período padrão com período compartilhado | Estado inicial da 08.4 e da 04.2 | Antes do M2 |
| **D-QA-09** — editar lançamento com cadastro desativado | Detalhe da 06.2 | Antes do M2 |
| **D-QA-11** — "últimos 5": de hoje ou de qualquer data? | Detalhe da 04.6 | Antes do M2 |
| **D-QA-07** — sessão vencida e outro usuário entra no aparelho | Detalhe de 07.6 e 09.1 | Antes do M3 |
| **D-QA-12** — dois aparelhos criam o mesmo nome offline | Detalhe de 07.6 e 03.x; raro com um celular (F-15) | Antes do M3 |
| **D-BL-08** — regra de conflito entre aparelhos | Só a 07.7, na v1.1 | Antes de a 07.7 entrar |
| **Hospedagem gratuita do painel** (decisão técnica) | Se os termos proibirem uso comercial, o painel vai para o mesmo host da API | Antes da 10.1 |

### 6.4 Já resolvidas

| Decisão | Resposta | Efeito no roadmap |
|---|---|---|
| D-BL-01 (serviço × veículo) | E2-04 a: veículo obrigatório, serviço opcional | 02.12 desbloqueada, no M1; "Sem tipo de serviço" no Resumo e no filtro (04.7, 05.4, 05.6) |
| D-QA-01 ("Produtos") | Saída; "Venda de produtos" é entrada (S-BL-09) | Nenhum |
| D-QA-03 (filtro por serviço) | Criada a 04.7 | 04.7 no M2 |
| D-BL-03 | F-06: categorias de sistema renomeiam, não desativam | 03.2 no M3 |
| D-QA-02 | F-12: quatro formas, Pix no primeiro lançamento | Detalhe de 01.6 e 02.2 |
| D-QA-05 | F-13: editar não troca o tipo | 06.2 sem risco de crescer |
| D-RM-04 | F-15: um celular | 07.7 foi para a v1.1 |
| D-RM-02 | F-02: MVP completo | MVP mínimo descartado (§2.2) |
| D-BL-07, plataformas | F-03: só Android | Sem build iOS, conta Apple nem testes em iPhone |
| D-RM-05 | F-04: APK com instalação direta, sem Google Play | 09.6 no M1 |
| D-BL-09, dúvida 12 | F-05: todo lançamento tem unidade | Nenhum (já era a suposição) |
| D-BL-04 | F-08: unidades e formas na implantação | 08.5 e 03.6 seguem na v1.1 |
| D-BL-05 | F-09: histórico e lixeira de 90 dias | 06.4 e 06.5 no M2 |
| D-BL-06 | F-10: sem PIN/biometria | 09.7 descartada |
| D-BL-07, custo | F-03b: só planos gratuitos; PowerSync se o gratuito atender; backup próprio semanal | Prova de conceito 07.10 no M1; contingência 07.12; 09.2 vira backup próprio |
| Dúvida 5a | F-14: Lavagem rápida, Lavagem completa, Polimento, Higienização interna, Cristalização | Dados iniciais (01.6) |
| D-QA-04 | F-16: mesmo nome, ignorando maiúsculas, acentos e espaços nas pontas | `normalizarNome` (01.17) e `nome_chave` (01.3) no M1 |
| Stack | ST-01 a ST-04: app Expo, painel Next.js, Supabase (Postgres), NestJS com DDD, Clean Architecture e monólito modular | +40 pontos no MVP, quase todos no M1 |
| Painel web | ST-06 e ST-07: só consulta, pós-MVP, só o dono, mesma conta | Fase própria (§2.3), 24 pontos |

Dúvidas 1, 2, 3, 4, 10 e 11 da visão não mudam o MVP; alimentam o PIF-03 e a expansão de usuários (v2). Dúvidas 6, 7 e 8 podem criar histórias na v1.1 ou na v2.

### 6.5 Efeito somado no tamanho do MVP

O que ainda pode **acrescentar** pontos ao MVP: a contingência 07.12, se a prova de conceito reprovar o PowerSync (+3), e a dúvida 13, se trouxer a 03.7 (+3). No pior caso, o MVP passa de 215 para cerca de **221 pontos**.

---

## 7. Riscos de entrega

| # | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R-RM-01 | **Sincronização passando pelo NestJS** maior do que o estimado: o app, o PowerSync (ou a contingência), o endpoint `POST /sync/upload` e o domínio precisam funcionar juntos, sem perder nem duplicar nada | Média | Alta | Prova de conceito (07.10) no passo 4 do M1, com o envio pelo NestJS entre os critérios; testes de API (01.18) no M1; roteiro de resiliência como teste manual desde o fim do M1-A; contingência 07.12 já estimada |
| R-RM-12 | **Back-end novo deixa o M1 grande** (118 de 215 pontos): o dono fica mais tempo sem nada para testar, e o DDD com Clean Architecture acrescenta estrutura para uma equipe que pode ser pequena | Alta | Média | Ponto de controle M1-A com demonstração ao dono (lançamento de teste chegando ao servidor); telas que não dependem da API em paralelo; manter só os módulos Finanças, Identidade e Acesso e Sincronização no MVP; domínio em TypeScript puro com testes rápidos |
| R-RM-02 | **Plano gratuito não aguenta** ou muda as regras: Supabase pausa projeto parado; PowerSync gratuito tem limites e pode desativar instância inativa; hospedagem gratuita da API "dorme" e atrasa a primeira sincronização; agendador gratuito do backup falha; EAS tem limites no gratuito [SUPOSIÇÃO: conferir regras atuais] | Média | Alta | Prova de conceito com critérios de volume e inatividade; o app nunca espera a rede para salvar (a demora da API só atrasa o envio); aviso de pendências há mais de 24 h (07.8); alerta se o backup semanal falhar; roteiro de operação dizendo como reativar o Supabase e o PowerSync; acompanhar os limites a cada marco |
| R-RM-03 | **Perda de dados em uso real** antes de a sincronização estar blindada | Média | Alta | M1 e M2 são builds de teste, em paralelo ao controle atual (S-RM-01); o app só vira registro oficial no M3, com 07.6, 07.9 e o backup (09.2) prontos |
| R-RM-04 | **Distribuição por APK direto** (F-04) dá problema: o celular bloqueia a instalação de fora da loja; a chave de assinatura se perde (sem ela, a versão nova não instala por cima e desinstalar apaga o que não foi enviado); mudança nativa exige APK novo [SUPOSIÇÃO: confirmar o comportamento atual] | Média | Alta | 09.6 no passo 3 do M1, com passo a passo curto de instalação; chave de assinatura guardada no EAS com cópia fora dele; antes de qualquer APK novo, sincronizar e instalar **por cima**; testar a atualização com pendências na fila |
| R-RM-13 | **Credenciais no lugar errado**: com API, PowerSync e Supabase, há mais segredos; um deles no APK abriria o banco | Baixa | Alta | Acesso direto ao banco fechado desde o M1 (01.4); credenciais só em variáveis do servidor (09.9); revisão de segurança (09.4) antes do APK final; teste automático tentando ler o banco com a chave pública |
| R-RM-05 | **Dúvidas sem resposta no prazo** (§6) geram retrabalho | Média | Média | Prazos amarrados a passos do roadmap; regras isoladas |
| R-RM-06 | **Escopo cresce** (até +6 pontos, §6.5), ou o painel começa a ganhar escrita | Baixa | Média | Toda história que subir entra no M3 ou num marco novo; o painel fica só de consulta (ST-06), e qualquer escrita nele é tratada como pedido novo |
| R-RM-07 | **Protótipo incompleto** (sem tipo de veículo, "+ Novo veículo", TELA-14, calendário) e telas ainda por desenhar (histórico, lixeira, painel) | Média | Média | Design fecha o veículo antes do passo 11 do M1 (02.5); calendário, histórico e lixeira antes do M2; TELA-14 antes do M3; o painel antes da 10.1 |
| R-RM-08 | **Atualização do app** quebra o banco local ou a fila | Baixa | Alta | Teste de atualização com pendências antes de cada entrega, a partir do fim do M1 |
| R-RM-09 | **Segundo aparelho sem tratamento de conflito**: a 07.7 está na v1.1 (F-15) | Baixa | Média | Combinar com o dono que um segundo aparelho é avisado antes; nesse caso a 07.7 sobe da v1.1. Na troca de celular, sincronizar e sair da conta no antigo (09.1). O histórico no servidor (01.5) guarda cada alteração recebida |
| R-RM-10 | **Falta de aparelho de entrada** para medir desempenho e rodar o checklist | Média | Média | Conseguir o Android de entrada (2 GB) até o início do M2 |
| R-RM-11 | **Dono pouco disponível** para testar e responder dúvidas | Média | Alta | Demonstração no M1-A e testes curtos no fim de cada marco; dúvidas agrupadas por prazo |

### 7.1 Cenários de duração [SUPOSIÇÃO]

**Não é estimativa.** Não se sabe o tamanho nem a velocidade da equipe. A tabela só mostra quantas semanas seriam necessárias **se** a equipe entregasse, em média, a quantidade de pontos indicada por semana, arredondando para cima.

| Pontos por semana [SUPOSIÇÃO] | M1 (118) | M1 + M2 (178) | MVP completo (215) | Painel web (24) | v1.1 (15) |
|---|---|---|---|---|---|
| 5 | 24 semanas | 36 semanas | 43 semanas | 5 semanas | 3 semanas |
| 10 | 12 semanas | 18 semanas | 22 semanas | 3 semanas | 2 semanas |
| 15 | 8 semanas | 12 semanas | 15 semanas | 2 semanas | 1 semana |
| 20 | 6 semanas | 9 semanas | 11 semanas | 2 semanas | 1 semana |

Cuidados ao ler a tabela:

- Não inclui espera por respostas do dono nem os até +6 pontos da §6.5 (a contingência sozinha soma +3).
- A cadeia mais longa do MVP tem **69 pontos** em sequência (§1); acrescentar pessoas não encurta esse trecho, e boa parte dela está no back-end do M1.
- A v2 não aparece porque seus épicos principais ainda não têm histórias nem pontos. O MVP mínimo saiu da tabela porque foi descartado (F-02).

---

## 8. Suposições e dúvidas

### 8.1 Suposições deste roadmap

| # | Suposição |
|---|---|
| S-RM-01 | [SUPOSIÇÃO] Nas builds do M1 e do M2 o dono usa o app em paralelo ao controle atual, como teste; o app só vira o registro oficial no fim do M3. |
| S-RM-03 | [SUPOSIÇÃO] A 09.6 é feita no M1 (primeiro APK no celular do dono e atualização pelo app funcionando), e o APK final sai no fim do M3, sem mudar os pontos da história. |
| S-RM-04 | [SUPOSIÇÃO] As histórias Pós-MVP do app foram divididas entre v1.1 (ajustes para o dono) e v2 (outros usuários e módulos); o painel web é uma fase própria, porque o backlog o separou num épico (FIN-EP-10). |
| S-RM-06 | [SUPOSIÇÃO] Regras e limites dos planos gratuitos (Supabase, PowerSync, hospedagem da API e do painel, agendador do backup, EAS) e o comportamento do Android com APK de fora da loja precisam ser conferidos na prova de conceito; não foram verificados para este documento. |
| S-RM-07 | O protótipo de referência foi considerado pelo que o 04-backlog e o 02-design §8.3 descrevem dele. |
| S-RM-10 | [SUPOSIÇÃO] O ponto de controle M1-A é uma divisão deste documento, não do backlog: as histórias e os pontos são os do backlog v8, só agrupados em duas partes para o dono ver progresso no meio do M1. |
| S-RM-11 | [SUPOSIÇÃO] A hospedagem da API (09.9) fica no M1, e não no fim do MVP como sugere a ordem do backlog ("Fechar o MVP"), porque sem ela o APK de teste no celular do dono não sincroniza. As dependências do backlog (01.12, 07.10) permitem. |
| S-RM-12 | [SUPOSIÇÃO] O painel web vem depois do MVP (ST-06), mas pode começar antes da v1.1 ou em paralelo a ela; a ordem entre painel e v1.1 depende do que o dono pedir primeiro (D-RM-06). |
| S-RM-13 | [SUPOSIÇÃO] Os critérios por história citados na §3 seguem o 05 que o QA está atualizando; a contagem será a dele. |

### 8.2 Dúvidas novas para o dono

| # | Dúvida | Efeito no roadmap |
|---|---|---|
| D-RM-01 | Aceita usar as builds de teste (M1 e M2) **em paralelo** ao controle atual, até o MVP ficar pronto? | Se não, M1 e M2 ficam só como teste e o registro oficial espera o M3 |
| D-RM-06 | Depois do MVP, prefere o **painel web** primeiro ou os ajustes da **v1.1**? | Ordem entre §2.3 e §2.4 |

### 8.3 Situação das dúvidas

Nenhuma dúvida do dono bloqueia o início do M1. O que decide a base agora é técnico e está no próprio M1: a prova de conceito do PowerSync (07.10) e a hospedagem gratuita da API. Continuam abertas, sem bloquear o início: a dúvida 13 (antes do M3), as dúvidas de detalhe da §6.2 e §6.3, D-RM-01 e D-RM-06. Todas as demais estão resolvidas (§6.4).
