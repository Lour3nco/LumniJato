# Módulo 1 — Gestão de Finanças · Roadmap de entrega

Projeto: Lavajato Sistema
Documento: 06-roadmap.md · Autor: Agente de Roadmap (pedido do Orquestrador, Etapa 5) · Versão: 2 · Status: **rascunho para revisão** (v2: E2-04 decidida, opção a; FIN-US-02.12 desbloqueada)
Fontes: `01-visao.md` (v3), `04-backlog.md` (v2), `05-criterios-aceite.md` (v3). Em caso de conflito, vale a visão; para pontos e dependências, vale o backlog.

> Convenção: **[CONFIRMADO]** veio do dono · **[SUPOSIÇÃO]** não validado · **[DÚVIDA]** precisa de resposta antes de virar regra.
> IDs abreviados nas listas: "02.5" = FIN-US-02.5. Pontos na escala do backlog (esforço relativo, não horas). Dúvidas novas deste documento usam **D-RM-nn**; suposições, **S-RM-nn**.
> Este documento **não estima datas nem velocidade**. A única conta de tempo está na §7.1, em uma tabela de cenários marcada [SUPOSIÇÃO].

---

## 1. Visão geral do roadmap

| Fase | Objetivo | Histórias | Pontos |
|---|---|---|---|
| **MVP** (marcos M1 → M2 → M3) | O dono registra tudo o que entra e sai, de todas as unidades, com e sem internet, e fecha o mês sem planilha | **61** | **169** |
| ↳ M1 — Lançar no celular | Base técnica + lançamentos offline + saldo do dia, em build de teste | 27 | 78 |
| ↳ M2 — Ver e corrigir | Extrato com período e filtros, Resumo, detalhe, editar, excluir | 19 | 52 |
| ↳ M3 — Gerenciar, blindar e publicar | Cadastros, sincronização à prova de falhas, segurança, backup, desempenho, publicação | 15 | 39 |
| *Alternativa:* **MVP mínimo** | Começar a registrar de verdade antes, deixando relatórios e cadastros para uma atualização | 44 | 121 |
| **v1.1** | Ajustes pedidos pelo uso real, ainda com o dono como único usuário | 7 | 20 (+ candidatas sem história) |
| **v2** | Preparar o módulo para outros usuários e para os módulos seguintes | 2 | 3 (+ épicos novos ainda não estimados) |
| **Total do backlog atual** | | **70** | **192** |

Princípios usados:

1. **Nada se perde antes de qualquer coisa** (RNF-08): banco local e sincronização começam no M1, não no fim.
2. **Algo testável na mão do dono no fim de cada marco**, instalado no celular dele por um canal de teste (por isso a FIN-US-09.6, build e publicação, foi antecipada para o M1).
3. **Relatórios dependem de dados, não o contrário**: lançar vem antes de ver. É isso que torna possível o MVP mínimo (§2.2).
4. **Regras pendentes isoladas** (R-14 do 05): histórias que dependem de dúvidas abertas ficam o mais tarde que as dependências permitem, com prazo de resposta na §6.

**Cadeia mais longa do MVP** (não encurta com mais gente, porque cada história depende da anterior): 01.2 → 01.3 → 01.4 → 07.1 → 08.2 → 02.2 → 02.5 → 04.1 → 04.2 → 08.4 → 05.3 → 05.4 → 05.5 → 05.6 = **53 pontos**. A cadeia da sincronização (01.2 → 01.3 → 01.4 → 07.1 → 07.2 → 07.3 → 07.6 → 07.9) soma 29 pontos e corre em paralelo.

A FIN-US-04.7 (filtro por tipo de serviço, 2 pontos) já está no backlog v2 e foi considerada no MVP, no M2. O 05 v1 ainda conta 60 histórias MVP porque o QA está acrescentando os critérios dela; os totais deste documento (61 / 169) seguem o backlog v2.

---

## 2. Fases (MVP com marcos, MVP mínimo, v1.1, v2)

### 2.1 MVP

**Objetivo:** cumprir o escopo da visão §5.1 para o único usuário (dono), em todas as unidades, com dados no aparelho e no Supabase, publicado num canal que o dono instala e atualiza. Atende OBJ-01 a OBJ-05.

**Total: 61 histórias · 169 pontos · 3 marcos.**

#### M1 — Lançar no celular (27 histórias · 78 pontos)

**Entrega testável:** o dono instala a build de teste, entra com e-mail e senha, escolhe a unidade e lança saídas, outras entradas e carros (com "Mais um igual" e "Repetir"), com e sem internet; vê Entrou/Saiu/Sobrou de hoje e do mês no cartão da Início; os lançamentos chegam ao Supabase sozinhos quando há internet.
**Ainda não tem:** extrato, resumo, editar/excluir (só "Desfazer" no aviso), telas de cadastro, indicador de sincronização. [SUPOSIÇÃO S-RM-01] Nesta fase o dono usa o app **em paralelo** ao controle atual, como teste.

| ID | História resumida | Pts | Dependências |
|---|---|---|---|
| FIN-US-01.1 | Projeto Expo + navegação com barra inferior | 3 | — |
| FIN-US-01.2 | Projeto Supabase (sa-east-1) + migrações versionadas | 2 | — |
| FIN-US-01.3 | Esquema do banco (12 tabelas, centavos, auditoria, campos reservados) | 5 | 01.2 |
| FIN-US-01.4 | RLS em todas as tabelas + teste com 2 usuários | 5 | 01.3 |
| FIN-US-01.5 | Gatilhos de auditoria, versão e histórico | 3 | 01.3 |
| FIN-US-01.6 | Dados iniciais (organização, unidades, categorias, serviços, veículos, formas) | 2 | 01.3 |
| FIN-US-01.7 | Entrar com e-mail e senha, sessão que funciona offline | 3 | 01.1, 01.2 |
| FIN-US-01.9 | Componentes base, ícones, formatação R$ e datas | 3 | 01.1 |
| FIN-US-09.6 | Build (EAS) e canal de distribuição + EAS Update | 3 | 01.1 |
| FIN-US-07.1 | PowerSync + SQLite no app, regras por unidade | 5 | 01.3, 01.4 |
| FIN-US-08.1 | Tela Mais/Ajustes | 2 | 01.1 |
| FIN-US-08.3 | Unidade atual (seletor no topo) | 3 | 01.6, 01.9 |
| FIN-US-07.2 | UUID v7 no aparelho, `dispositivo`, envio sem duplicar | 2 | 07.1 |
| FIN-US-08.2 | Padrão Pessoal/Empresa sincronizado | 2 | 08.1, 07.1 |
| FIN-US-01.8 | Primeiro uso: boas-vindas, unidade inicial, download | 2 | 01.7, 07.1, 08.3 |
| FIN-US-02.1 | Valor estilo caixa registradora | 3 | 01.9 |
| FIN-US-02.11 | Botões + Carro / + Entrou / − Saiu na Início | 1 | 01.1, 01.9 |
| FIN-US-02.2 | Campos comuns pré-preenchidos | 5 | 01.9, 01.6, 08.2, 08.3 |
| FIN-US-07.3 | Sincronização automática (salvar, abrir, voltar a rede, ~5 min) | 3 | 07.2 |
| FIN-US-02.3 | Lançar saída | 3 | 02.1, 02.2, 07.2 |
| FIN-US-02.5 | Entrada de serviço carro por carro (serviço + veículo) | 5 | 02.1, 02.2, 07.2 |
| FIN-US-02.4 | Lançar outra entrada | 2 | 02.3 |
| FIN-US-02.8 | Volta à Início com aviso e Desfazer | 2 | 02.3 |
| FIN-US-02.10 | "Descartar este lançamento?" | 1 | 02.2 |
| FIN-US-02.12 | Regra serviço × veículo: veículo obrigatório, serviço opcional [CONFIRMADO E2-04 a] | 2 | 02.5, 01.3 |
| FIN-US-02.9 | "Mais um igual" e "Repetir" | 3 | 02.5, 02.8 |
| FIN-US-05.1 | Cartão Entrou/Saiu/Sobrou na Início (Hoje/Mês, Empresa/Pessoal/Tudo) | 3 | 02.3, 02.4, 02.5 |

**Ordem de construção do M1** (cada passo só começa quando as dependências do passo anterior terminam; dentro do passo, as histórias são independentes entre si):

1. 01.1 · 01.2
2. 01.3 · 01.7 · 01.9 · 08.1 · 09.6 (build de teste o quanto antes, ver R-RM-04)
3. 01.4 · 01.5 · 01.6 · 02.1 · 02.11
4. 07.1 · 08.3
5. 07.2 · 08.2 · 01.8
6. 02.2 · 07.3
7. 02.3 · 02.5 · 02.10
8. 02.4 · 02.8 · 02.12
9. 02.9 · 05.1

Observações do M1:

- A FIN-US-07.1 é o maior risco de estimativa do backlog. Recomenda-se começar por uma **prova de conceito de sincronização** (lançar offline, fechar, reabrir, ver no Supabase) logo no passo 4, antes de montar as telas em cima dela.
- Sem as FIN-US-02.6 e 02.7 (M2) e sem as telas de cadastro (M3), o dono só lança com as listas dos dados iniciais. Por isso a **lista completa de tipos de serviço (dúvida 5a da visão)** precisa chegar antes da FIN-US-01.6.
- Critérios do M1 que citam telas de marcos seguintes (ex.: CA-01.8.3 e CA-07.1.1 citam extrato, resumo e cadastros offline; CA-08.1.2 cita as TELA-10/11/12/14) são verificados na parte que existe no M1 e **reverificados por inteiro** no marco em que a tela chega.
- A FIN-US-02.12 não está mais bloqueada: a E2-04 foi decidida (opção a, veículo obrigatório e serviço opcional). Ela entra no passo 8 junto com as outras histórias de lançamento.

#### M2 — Ver e corrigir (19 histórias · 52 pontos)

**Entrega testável:** o dono confere o extrato por período (atalhos e calendário), unidade, Pessoal/Empresa, categoria, serviço e veículo; vê o Resumo de gastos por categoria e de serviços por tipo de serviço e por veículo; toca num número e cai no extrato filtrado; abre o detalhe, edita e exclui; cria serviço e veículo sem sair do lançamento; vê o estado da nuvem no topo da Início.
**Ainda não tem:** telas de cadastro, tela de Sincronização com o botão, tratamento completo de erros e conflitos, sair da conta, backup, publicação final.

| ID | História resumida | Pts | Dependências |
|---|---|---|---|
| FIN-US-04.1 | Extrato agrupado por dia, com totais do filtro | 5 | 02.3, 02.5 |
| FIN-US-07.4 | Indicador de estado da nuvem + relógio nos pendentes | 3 | 07.3 |
| FIN-US-02.6 | "+ Novo serviço" dentro do lançamento | 3 | 02.5 |
| FIN-US-04.2 | Período: atalhos + calendário de intervalo | 5 | 04.1 |
| FIN-US-04.3 | Filtros de unidade e Empresa/Pessoal/Tudo | 3 | 04.1 |
| FIN-US-04.6 | Últimos 5 lançamentos na Início | 2 | 04.1 |
| FIN-US-06.1 | Detalhe do lançamento | 2 | 04.1 |
| FIN-US-02.7 | "+ Novo veículo" dentro do lançamento | 2 | 02.6 |
| FIN-US-04.4 | Filtro por categoria | 2 | 04.3 |
| FIN-US-08.4 | Período compartilhado Extrato ↔ Resumo | 2 | 04.2 |
| FIN-US-05.2 | Consolidado "Todas as unidades" com Sobrou por unidade | 2 | 05.1, 08.3 |
| FIN-US-06.2 | Editar lançamento | 3 | 06.1, 01.5 |
| FIN-US-06.3 | Excluir lançamento (lógico) | 2 | 06.1 |
| FIN-US-04.5 | Filtro por tipo de veículo | 2 | 04.4 |
| FIN-US-04.7 | Filtro por tipo de serviço | 2 | 04.4 |
| FIN-US-05.3 | Gastos por categoria (barras) | 5 | 04.2, 04.3, 08.4 |
| FIN-US-05.4 | Serviços por tipo de serviço | 3 | 05.3 |
| FIN-US-05.5 | Serviços por tipo de veículo | 2 | 05.4 |
| FIN-US-05.6 | Do Resumo para o Extrato filtrado | 2 | 05.3, 05.5, 04.4, 04.5, 04.7 |

**Ordem de construção do M2:**

1. 04.1 · 07.4 · 02.6 · 05.2
2. 04.2 · 04.3 · 04.6 · 06.1 · 02.7
3. 04.4 · 08.4 · 06.2 · 06.3
4. 04.5 · 04.7 · 05.3
5. 05.4
6. 05.5
7. 05.6

A sequência 04.2 → 08.4 → 05.3 → 05.4 → 05.5 → 05.6 é o trecho final da cadeia mais longa do MVP; vale começá-la cedo no marco.

#### M3 — Gerenciar, blindar e publicar (15 histórias · 39 pontos)

**Entrega:** o MVP completo, publicado no canal combinado (D-RM-05), com cadastros editáveis, sincronização à prova de falhas, saída segura da conta, cópia de segurança testada e desempenho medido. A partir daqui o app pode ser **o registro oficial** do dono.

| ID | História resumida | Pts | Dependências |
|---|---|---|---|
| FIN-US-03.1 | Categorias: criar, renomear, desativar | 5 | 01.6, 07.1, 08.1 |
| FIN-US-03.3 | Tipos de serviço: criar, renomear, desativar | 3 | 01.6, 07.1, 08.1 |
| FIN-US-07.5 | Tela de Sincronização + "Sincronizar agora" | 3 | 07.4, 08.1 |
| FIN-US-07.6 | Falhas de envio sem perda (espera crescente, sessão, erros) | 5 | 07.3 |
| FIN-US-07.7 | Conflito entre aparelhos (vale o último, com histórico e aviso) | 3 | 07.3, 01.5 |
| FIN-US-07.8 | Aviso de pendências há mais de 24 h | 1 | 07.4 |
| FIN-US-09.1 | Sair da conta apagando os dados locais | 2 | 01.7, 07.4 |
| FIN-US-09.2 | Cópias de segurança + restauração testada | 3 | 01.2 |
| FIN-US-09.3 | Política de privacidade + orientação na descrição | 1 | 02.2 |
| FIN-US-09.5 | Desempenho medido com 10.000 lançamentos | 2 | 04.1, 05.3 |
| FIN-US-03.2 | 4 categorias de sistema travadas | 2 | 03.1 |
| FIN-US-03.4 | Tipos de veículo: criar, renomear, desativar | 3 | 03.3 |
| FIN-US-07.9 | Roteiro de resiliência executado | 2 | 07.6 |
| FIN-US-03.5 | Reordenar categorias, serviços e veículos | 3 | 03.1, 03.3, 03.4 |
| FIN-US-09.4 | Revisão de segurança antes de publicar | 1 | 01.4, 01.7 |

**Ordem de construção do M3:**

1. 07.6 · 07.5 · 07.7 · 07.8 · 03.1 · 03.3 · 09.2 · 09.3 · 09.1
2. 07.9 · 03.2 · 03.4 · 09.5
3. 03.5
4. 09.4 (última, sobre a versão candidata) → publicação (fecho da 09.6 iniciada no M1)

A FIN-US-09.2 (backup) não depende de nada recente e pode ser adiantada para qualquer ponto depois do M1; ela **precisa** estar pronta antes de o dono passar a usar o app como registro oficial.

#### Conferência dos totais do MVP

| Marco | Histórias | Pontos |
|---|---|---|
| M1 | 27 | 78 |
| M2 | 19 | 52 |
| M3 | 15 | 39 |
| **MVP** | **61** | **169** |

#### Se for preciso enxugar o MVP completo sem mudar a ideia

Primeiras candidatas a sair do MVP (vão para a v1.1), em ordem: FIN-US-03.5 reordenar (3, já indicada na S-BL-05) · FIN-US-05.6 do Resumo para o Extrato (2) · FIN-US-04.7 e 04.5 filtros por serviço e por veículo (2 + 2; o Resumo por serviço e por veículo continua) · FIN-US-07.7 conflito, **só se o dono usar um único aparelho** (3, D-RM-04). Total possível: 12 pontos.

---

### 2.2 MVP mínimo (alternativa)

**Ideia:** o que tem valor desde o primeiro dia é **registrar**; os relatórios podem chegar numa atualização (EAS Update), porque os dados já estarão lá. O MVP mínimo publica para uso real assim que o registro estiver seguro, sem esperar Resumo, filtros e telas de cadastro.

**Objetivo:** o dono passa a lançar todas as entradas e saídas, de todas as unidades, como registro oficial, com o saldo de hoje e do mês por unidade no cartão da Início, extrato simples, editar e excluir.

**Total: 44 histórias · 121 pontos** = M1 inteiro (78) + 43 pontos abaixo.

| ID | História resumida | Pts | Dependências |
|---|---|---|---|
| *M1 inteiro* | *27 histórias da §2.1* | *78* | — |
| FIN-US-04.1 | Extrato agrupado por dia | 5 | 02.3, 02.5 |
| FIN-US-04.6 | Últimos 5 na Início | 2 | 04.1 |
| FIN-US-06.1 | Detalhe | 2 | 04.1 |
| FIN-US-06.2 | Editar | 3 | 06.1, 01.5 |
| FIN-US-06.3 | Excluir | 2 | 06.1 |
| FIN-US-02.6 | "+ Novo serviço" no lançamento | 3 | 02.5 |
| FIN-US-02.7 | "+ Novo veículo" no lançamento | 2 | 02.6 |
| FIN-US-07.4 | Indicador de estado da nuvem | 3 | 07.3 |
| FIN-US-07.5 | Tela de Sincronização + botão | 3 | 07.4, 08.1 |
| FIN-US-07.6 | Falhas de envio sem perda | 5 | 07.3 |
| FIN-US-07.7 | Conflito entre aparelhos | 3 | 07.3, 01.5 |
| FIN-US-07.8 | Aviso de pendências há mais de 24 h | 1 | 07.4 |
| FIN-US-07.9 | Roteiro de resiliência | 2 | 07.6 |
| FIN-US-09.1 | Sair da conta | 2 | 01.7, 07.4 |
| FIN-US-09.2 | Cópias de segurança | 3 | 01.2 |
| FIN-US-09.3 | Política de privacidade | 1 | 02.2 |
| FIN-US-09.4 | Revisão de segurança | 1 | 01.4, 01.7 |

**Ordem:** M1 → (04.1 · 07.4 · 07.6 · 07.7 · 02.6 · 09.2 · 09.3) → (04.6 · 06.1 · 07.5 · 07.8 · 07.9 · 02.7 · 09.1) → (06.2 · 06.3) → 09.4 → publicação.

**O que fica para o "complemento" (17 histórias · 48 pontos, entregue depois por atualização):** 04.2, 04.3, 04.4, 04.5, 04.7, 08.4, 05.2, 05.3, 05.4, 05.5, 05.6, 03.1, 03.2, 03.3, 03.4, 03.5, 09.5. Complemento + MVP mínimo = MVP completo (61 / 169).

**O que se perde enquanto o complemento não chega:**

| Perda | Efeito para o dono | Referência |
|---|---|---|
| Sem Resumo por categoria, por serviço e por veículo | Não sabe **onde** o dinheiro vai; **OBJ-04 não é atendido** no lançamento, embora seja meta "Disponível no MVP" na visão | 05.3–05.6, OBJ-04 |
| Sem escolha de período e sem filtros no Extrato | O extrato só rola por dia; conferir um mês ou uma categoria fica manual. O calendário de período é [CONFIRMADO] na visão §5.1 item 4 e fica adiado | 04.2–04.5, 04.7, 08.4 |
| Sem consolidado "Todas as unidades" com linha por unidade | Vê o saldo de uma unidade por vez (trocando no topo), sem comparar lado a lado | 05.2 |
| Sem telas de cadastro | Não cria categoria nova, não renomeia nem desativa nada; serviço e veículo só podem ser **criados** dentro do lançamento. A criação de categorias pelo dono é [CONFIRMADO] em E2-02 e fica adiada | 03.1–03.5, E2-02 |
| Desempenho não medido formalmente | Risco de lentidão só aparece no uso real | 09.5 (depende da 05.3) |

**O que continua garantido:** lançar em ≤ 4 toques (OBJ-01), rastreabilidade (OBJ-05), saldo de hoje e do mês **por unidade** no cartão da Início (OBJ-03 atendido de forma básica), e nada se perde (toda a FIN-EP-07 e backup).

[SUPOSIÇÃO S-RM-02] O extrato sem filtro de período precisa de uma regra para o que mostrar e para os totais do topo (todo o histórico ou só o mês atual). Isso **não está definido** em nenhum documento: ver D-RM-03.

**Recomendação:** seguir o **MVP completo** se o dono aceitar usar M1 e M2 em paralelo ao controle atual; escolher o **MVP mínimo** se ele quiser abandonar o caderno/planilha o quanto antes. A decisão é do dono (D-RM-02).

---

### 2.3 v1.1 — Ajustes depois do uso real

**Objetivo:** atender o que o dono sentir falta nas primeiras semanas de uso, ainda como único usuário. Todas as histórias já estão no backlog como Pós-MVP; várias **dependem de dúvidas** e podem subir para o MVP ou cair fora (§6).

**Total: 7 histórias · 20 pontos** (+ candidatas sem história).

| ID | História resumida | Pts | Dependências | Condição |
|---|---|---|---|---|
| FIN-US-09.7 | PIN ou biometria ao abrir | 2 | 01.7 | D-BL-06 |
| FIN-US-08.5 | Cadastrar e editar unidades pelo app | 3 | 08.1 | D-BL-04 |
| FIN-US-03.6 | Gestão de formas de pagamento | 3 | 08.1 | D-BL-04; precisa de tela nova no 02-design |
| FIN-US-06.4 | Histórico de alterações no app | 3 | 06.2 | D-BL-05; precisa de tela nova |
| FIN-US-06.5 | Lixeira para restaurar excluídos | 3 | 06.3 | D-BL-05; precisa de tela nova |
| FIN-US-05.7 | Cruzamento tipo de serviço × tipo de veículo | 3 | 05.5 | [CONFIRMADO E2-08] fica para depois |
| FIN-US-03.7 | Categorias próprias para Pessoal e Empresa | 3 | 03.1 | Dúvida 13 da visão; se a resposta for "mesma lista", a história sai |

**Ordem:** todas as dependências já estão no MVP, então a ordem segue a chegada das respostas do dono. Sugestão por valor: 09.7 → 06.5 → 06.4 → 05.7 → 08.5 → 03.6 → 03.7. Antes de construir 03.6, 06.4, 06.5, 08.5 e 09.7, o Design precisa desenhar as telas novas (04-backlog §4.1).

**Candidatas sem história** (só entram se o dono pedir; o Dev escreve e estima): foto do comprovante (dúvida 6 da visão; exige Supabase Storage e tabela `lancamento_anexo`) e exportação para o contador em CSV/PDF (dúvida 8).

---

### 2.4 v2 — Preparar para outros usuários e outros módulos

**Objetivo:** deixar o módulo pronto para a expansão de usuários (D-02) e para receber lançamentos de outros módulos (PIF-01 a PIF-06).

**Total: 2 histórias · 3 pontos** (+ épicos novos ainda não estimados).

| ID | História resumida | Pts | Dependências |
|---|---|---|---|
| FIN-US-01.10 | Eventos `lancamento.*`, `tipo_servico.alterado` etc. no servidor | 2 | 01.5 |
| FIN-US-09.8 | Procedimento de exclusão definitiva de titular (LGPD) | 1 | 01.3 |

**Ordem:** 09.8 antes de qualquer usuário além do dono (RNF-26); 01.10 quando existir o primeiro módulo consumidor (03-arquitetura §6.2).

**Épicos novos que a v2 precisa, sem histórias nem pontos ainda** (precisam de nova rodada de visão → backlog → critérios):

| Épico candidato | Origem | Observação |
|---|---|---|
| Expansão de usuários: gerentes e funcionários, convites, papéis, visibilidade dos itens Pessoais, pedido de reembolso com aprovação | D-02, PIF-05, dúvidas 1 e 11 da visão | O modelo usuário × unidade × papel já existe no MVP; falta todo o comportamento |
| Contas a pagar e a receber, gastos recorrentes | D-01, PIF-06, dúvida 7 da visão | O campo `situacao` já está reservado; muda a ideia de "só o realizado", então pede decisão nova do dono |

---

## 3. Definição de pronto por fase

### 3.1 Vale para toda história, em qualquer fase

- Todos os critérios CA da história passam **com e sem internet**, salvo quando o critério diz o contrário (05 §1).
- Os testes automatizados ligados à história (05 §5.1) existem e passam no pipeline.
- Migrações versionadas; nenhuma mudança à mão no banco (RNF-27); teste de RLS passando a cada migração (CA-01.4.10).
- Nenhum valor monetário tratado fora de centavos inteiros (R-03 do 05).
- Toda regra que depende de dúvida aberta está isolada e marcada (R-14 do 05).
- Revisão de código feita.

### 3.2 Por fase

| Fase | Critérios de aceite | Testes automatizados exigidos | Checklist manual no celular (05 §5.3) | Indicadores que a fase permite medir |
|---|---|---|---|---|
| **M1** | Os das 27 histórias do M1 (**119 critérios**; parte dos critérios de 01.8, 07.1 e 08.1 é reverificada nos marcos seguintes). Inclui os critérios CA-02.12.x do 05 v3. Casos de borda: CB-a (valor), CB-c (datas e fuso), CB-d.1, d.2, d.4 (duplicado), CB-h (Todas as unidades ao lançar), CB-i.2, i.3, i.5, CB-k.1, k.2 | **Unidade:** caixa registradora, formatação, somas em centavos (teste de propriedade), "hoje" no fuso da unidade, validações do formulário, "Repetir"/"Mais um igual". **Integração:** esquema e restrições, RLS com 2 usuários/2 organizações, gatilhos de histórico, idempotência do envio, regras de sincronização por unidade, dados iniciais idempotentes. **E2E:** login e primeiro uso, uso offline, lançar saída/entrada/serviço, três carros com "Mais um igual", Todas as unidades ao lançar, offline → fechar à força → reabrir | Login certo e errado; primeiro uso; botões na zona do polegar; teclado e caixa registradora; valor zero e "Confere?"; saída em ≤ 4 toques; serviço com veículo pré-marcado; aviso, Desfazer e "Mais um igual"; toque duplo no Salvar; "Descartar?"; Todas as unidades exige unidade; troca de unidade; cartão Hoje/Mês e Empresa/Pessoal/Tudo; lançamento às 23h30; modo avião: abre sem login, lança, fecha à força, reinicia, reconecta e tudo chega ao servidor | **OBJ-01** (teste com o dono: 10 lançamentos reais, ≤ 15 s e ≤ 4 toques). **OBJ-05** (consulta no servidor: 100% com usuário, unidade, data e categoria). **OBJ-03** parcial (saldo do mês por unidade no cartão) |
| **M2** | Os das 19 histórias do M2 (**71 critérios** contados no 05 v1, mais os da 04.7 e os ajustes de E2-04 no 05 v3), mais a reverificação de CA-01.8.3 e CA-07.1.1 para extrato e resumo. Casos de borda: CB-b (somas), CB-i.1, i.4, CB-j (período), CB-e.6 | **Unidade:** cálculo de períodos (atalhos, intervalo, inversão, inclusivo), percentuais, filtros e totais, nome repetido e reativação (02.6/02.7). **Integração:** reconciliação de totais aparelho × servidor (R-07). **E2E:** extrato com período e filtros, ida do Resumo para o Extrato, editar e excluir | Tudo do M1 + Extrato (agrupamento, filtros, "Limpar filtros", sem resultado); período (atalhos, um dia, intervalo invertido, 3º toque, futuro apagado); período igual no Extrato e no Resumo; barra/linha do Resumo abre Extrato filtrado; Resumo › Gastos e › Serviços; detalhe, editar, excluir; "+ Novo serviço" e "+ Novo veículo"; indicador da nuvem e relógio nos pendentes | **OBJ-03** completo (entradas, saídas e saldo do mês por unidade sem nada fora do app). **OBJ-04** (gastos por categoria, período e unidade) |
| **M3 = MVP pronto** | **Todos** os critérios do 05 v3, incluindo os CA-02.12.x da FIN-US-02.12, e todos os casos de borda CB-a a CB-k | Todos os do 05 §5.1, incluindo: **integração** de fila com falha no meio do lote, retomada e erros (CB-f), conflito com dois clientes (CB-e), vínculo removido (CB-k.3); **E2E** de sessão expirada offline (CB-k.4) e sair da conta com pendências. Sem nenhum teste desligado | **Checklist completo do 05 §5.3** em todos os aparelhos da lista (Android de entrada, Android recente, tela pequena, fonte grande; iPhone se a D-BL-07 incluir). Mais: roteiro de resiliência (07.9) aprovado; desempenho medido (09.5) dentro dos limites; restauração de backup testada (09.2); checklist de segurança assinado (09.4); atualização por EAS Update com pendências na fila sem perder nada (CA-09.6.3); política de privacidade publicada | **OBJ-01 a OBJ-05** todos mensuráveis. **OBJ-02** (≥ 95% dos gastos lançados) só pode ser medido **um mês depois** de o app virar o registro oficial, comparando com comprovantes e extrato bancário (manual, com o dono) |
| **MVP mínimo** | Os critérios das 44 histórias do MVP mínimo e os casos de borda que não dependem do complemento (CB-a, c, d, e, f, h, i.2, i.3, i.5, k) | Os do M1 + integração de fila, conflito e CB-k.3; E2E de editar/excluir, sessão expirada offline e sair com pendências | Checklist do M1 + detalhe/editar/excluir, indicador, tela de Sincronização, sair da conta; roteiro de resiliência, backup testado e checklist de segurança, como no M3 | OBJ-01, OBJ-05, OBJ-03 (básico, pelo cartão). **OBJ-04 não é medível.** OBJ-02 mensurável após 1 mês, com conferência mais trabalhosa (sem filtro de período nem de categoria) |
| **v1.1** | Critérios novos escritos pelo QA para cada história que entrar (o 05 §7 não cobre o Pós-MVP); regressão de todos os critérios do MVP | Os das histórias novas + regressão completa do MVP no pipeline | Checklist do MVP + telas novas | Nenhum indicador novo; **OBJ-05** ganha visibilidade no app com o histórico (06.4) |
| **v2** | Critérios das histórias e épicos novos; regressão do MVP | Testes de RLS estendidos aos papéis `gerente` e `funcionario` quando houver | Checklist com mais de um usuário e unidades diferentes | **OBJ-05** passa a ser medido com vários usuários (cada lançamento com o usuário certo) |

Contagem de critérios por marco feita a partir da tabela de cobertura do 05 (119 + 71 + 51 = 241).

---

## 4. Dependências de outros módulos

O que o Módulo 1 **já deixa preparado** no MVP: campos `origem`, `origem_ref_*` e `situacao` no lançamento (FIN-US-01.3), vínculo usuário × unidade × papel (01.3, 01.4), categorias de sistema que não podem ser desativadas (03.2) e histórico de alterações (01.5). O que **ainda falta** do lado deste módulo para qualquer integração: os eventos (FIN-US-01.10, v2) e a regra de alteração de lançamentos gerados por outro módulo (`origem ≠ manual`, 03-arquitetura §6.3), que ainda não tem história.

| PIF | Módulo de quem depende | O que entra no Finanças | Pré-requisitos no Finanças | Quando pode entrar |
|---|---|---|---|---|
| PIF-01 | Atendimento/fila | Serviço concluído e pago gera a entrada carro por carro, já com tipo de serviço e veículo; a lista de tipos de serviço vira o catálogo do sistema | 01.10 (eventos); regra para `origem ≠ manual`; seguir a regra E2-04 a (veículo obrigatório, serviço opcional) | Depois que o módulo de Atendimento existir. Até lá, o lançamento manual do MVP continua |
| PIF-02 | Estoque (arquivado em `modulo-01-estoque/`) | Compra de mercadoria gera saída na categoria de sistema "Produtos"; custo de insumo por serviço para margem | 01.10; regra `origem ≠ manual`; categoria "Produtos" travada (03.2) | Depois que o módulo de Estoque for retomado e entregue |
| PIF-03 | Funcionários / equipe | Mão de obra e reembolso ligados ao funcionário, com histórico por pessoa | `origem_ref_*`; respostas das dúvidas 1, 2 e 3 da visão (reembolso, mão de obra, passagem/alimentação) | Depois do módulo de Equipe |
| PIF-04 | Clientes | Entrada ligada ao cliente que pagou | `origem_ref_*`; normalmente chega junto com o PIF-01 | Depois do módulo de Clientes (e, na prática, do de Atendimento) |
| PIF-05 | Usuários, unidades e permissões | Gerentes e funcionários usando o app | 09.8 (exclusão LGPD), dúvida 11 (quem vê Pessoais), RLS estendida aos novos papéis | Na v2, quando o dono decidir expandir (D-02) |
| PIF-06 | Contas a pagar/receber (evolução deste módulo) | Contas com vencimento futuro e recorrentes | Campo `situacao` já reservado; nova decisão do dono revendo a D-01 | Na v2 ou depois, a pedido do dono |
| — | Integração bancária / Pix automático | Importação de extrato, conciliação | Não há PIF: a visão §5.3 deixa **fora do sistema por ora** | Fora do roadmap (§5) |

---

## 5. Fora do roadmap

| Item | Por quê | Referência |
|---|---|---|
| Integração bancária, Pix automático, conciliação, importação de extrato | Fora do sistema por ora, na visão | visão §5.3 |
| Nota fiscal, impostos, contabilidade (DRE, balanço) | Fora do sistema por ora | visão §5.3 |
| Folha de pagamento completa (encargos, férias, 13º) | O módulo registra só o valor pago de mão de obra | visão §5.3 |
| Agendamento de clientes | Outro módulo, sem pedido para este | visão §5.3 |
| Placa, modelo e cliente no lançamento do serviço | Pertence a Atendimento e Clientes; entra pelo PIF-01/PIF-04 (§4), não por este roadmap | E2-05, PIF-01, PIF-04 |
| Controle de estoque | Módulo próprio, arquivado; entra pelo PIF-02 (§4) | visão §1 |
| Painel web para o dono | Não foi pedido | 03-arquitetura §8 |
| Notificações e alertas de gasto acima do normal | Não foi pedido | 03-arquitetura §8 |
| Histórico de alterações das tabelas de cadastro | Evolução sem pedido; os campos de auditoria já existem | 03-arquitetura §8 |
| Modo escuro | Prioridade baixa | 02-design §5.7 |
| Foto do comprovante e exportação para o contador | **Não estão fora de vez**: ficam como candidatas da v1.1, mas só entram se o dono pedir (dúvidas 6 e 8) | §2.3 |

---

## 6. Decisões que bloqueiam o roadmap

Os prazos são marcados por **ponto do roadmap**, não por data: "antes do passo X" quer dizer antes de a equipe começar aquela história.

### 6.1 Bloqueiam ou mudam a base (responder antes de começar o M1)

| Dúvida | O que muda no roadmap | Precisa de resposta até |
|---|---|---|
| **D-BL-07** — custo de plano pago (Supabase/PowerSync) e só Android ou também iPhone (dúvidas 4 e 6 da arquitetura) | Se o PowerSync for vetado, a FIN-US-07.1 sobe de 5 para pelo menos 8 pontos e surge a `fila_envio` (S-BL-01): o M1 vai a 81+. Muda a forma de backup (09.2) e o esforço de publicação (09.6, conta Apple, aparelhos de teste) | **Antes do passo 4 do M1** (07.1). Para a parte de lojas, antes do passo 2 (09.6) |
| **D-BL-09** — lançamento Pessoal pertence a uma unidade? (dúvida 12) | Muda o esquema (`unidade_id` opcional), a 02.2 e o cartão 05.1. A parte "categorias separadas" (dúvida 13) só move a 03.7 entre v1.1, MVP (+3 no M3) ou fora | Dúvida 12: **antes da FIN-US-01.3** (passo 2 do M1). Dúvida 13: antes do M3 (03.1) |
| **D-QA-04** — "água" = "Água"? e "Agua"? | Define a restrição de nome único no banco (CA-01.3.6), além das regras de 02.6, 02.7 e 03.x | Antes da FIN-US-01.3; no máximo antes do M2 (custa uma migração) |
| **Dúvida 5a da visão** — lista completa de tipos de serviço | Só os dados iniciais (01.6), mas no M1 o dono não tem como criar serviço sem ela | Antes da FIN-US-01.6 (passo 3 do M1) |
| **D-BL-04** (parte 1) — quem cadastra as unidades | A 01.6 carrega as unidades; se for pelo app, a 08.5 (+3) sobe para o MVP | Lista das unidades: antes da 01.6. Tela de unidades: antes do M3 |

### 6.2 Bloqueiam histórias do MVP (responder durante o M1)

| Dúvida | O que muda no roadmap | Precisa de resposta até |
|---|---|---|
| **D-QA-02** — forma de pagamento no primeiro lançamento | Detalhe da 02.2 | Antes da 02.2 (passo 6 do M1) |
| **D-QA-08** — fuso do aparelho diferente do da unidade | Detalhe da 02.2 | Antes da 02.2 |
| **D-QA-06** — "Repetir" com "Todas as unidades" | Detalhe da 02.9 | Antes da 02.9 (passo 9 do M1) |
| **D-QA-10** — passar de R$ 999.999,99 | Detalhe da 02.1 | Antes da 02.1 (passo 3 do M1) |
| **D-BL-10** — cartão abre em Hoje ou Mês | Só a aba padrão da 05.1; troca barata | Antes da 05.1 (fim do M1) |

### 6.3 Bloqueiam histórias do M2 e do M3

| Dúvida | O que muda no roadmap | Precisa de resposta até |
|---|---|---|
| **D-BL-02** — período padrão com período compartilhado | Estado inicial da 08.4 e da 04.2 | Antes do M2 |
| **D-QA-05** — editar pode trocar o tipo do lançamento? | Pode aumentar a 06.2 | Antes do M2 |
| **D-QA-09** — editar lançamento com cadastro desativado | Detalhe da 06.2 | Antes do M2 |
| **D-QA-11** — "últimos 5": de hoje ou de qualquer data? | Detalhe da 04.6 | Antes do M2 |
| **D-BL-05** — histórico e lixeira no app | Pode trazer 06.4 e 06.5 (+6) do v1.1 para o MVP (M2/M3) | Antes do fim do M2; depois disso ficam na v1.1 |
| **D-BL-08** — regra de conflito entre aparelhos | Muda a 07.7 | Antes do M3 |
| **D-BL-03** — categorias de sistema podem ser renomeadas, mas não desativadas? | Muda a 03.2 e a restrição no servidor (CA-03.2.4) | Antes do M3 |
| **D-BL-06** — PIN/biometria | Pode trazer a 09.7 (+2) para o M3 | Antes do M3 |
| **D-BL-04** (parte 2) — tela de formas de pagamento | Pode trazer a 03.6 (+3) para o M3; precisa de tela nova no design | Antes do M3 |
| **D-QA-07** — sessão vencida e outro usuário entra no aparelho | Detalhe de 07.6 e 09.1 | Antes do M3 |
| **D-QA-12** — dois aparelhos criam o mesmo nome offline | Detalhe de 07.6 e 03.x | Antes do M3 |

### 6.4 Já resolvidas ou que não mexem no roadmap agora

- **D-QA-01** ("Produtos" é saída ou entrada): resolvida no backlog v2 (S-BL-09, com base na visão §5.1 item 3): "Produtos" é de saída e "Venda de produtos" é de entrada. O 05 v1 ainda a lista como aberta; falta o QA atualizar.
- **D-QA-03** (filtro por tipo de serviço): resolvida com a criação da FIN-US-04.7.
- **D-BL-01** (regra serviço × veículo, E2-04 / DU-12): **resolvida pelo dono, opção a**: o tipo de veículo é obrigatório e o tipo de serviço é opcional (visão §9b). A FIN-US-02.12 deixa de estar bloqueada e fica no passo 8 do M1. Consequências definidas pelo Orquestrador: "entrada de serviço" passa a ser a entrada da categoria de sistema "Serviços" (responde a D-QA-13); o Resumo ganha a linha "Sem tipo de serviço", e o filtro por tipo de serviço do Extrato (04.7) ganha a opção "Sem tipo de serviço" para a 05.6 abrir essa linha [SUPOSIÇÃO] (responde a D-QA-14). Pontos e marcos não mudam por ora (S-RM-08).
- Dúvidas 1, 2, 3, 4, 10 e 11 da visão: não mudam o MVP; alimentam o PIF-03 e a expansão de usuários (v2). Dúvidas 6, 7 e 8 podem criar histórias na v1.1 ou na v2.

### 6.5 Efeito somado no tamanho do MVP

Se todas as dúvidas que podem **acrescentar** histórias vierem com "sim": D-BL-04 (+6), D-BL-05 (+6), D-BL-06 (+2), dúvida 13 (+3) = **+17 pontos**; e o veto ao PowerSync (D-BL-07) soma pelo menos +3. No pior caso, o MVP passa de 169 para cerca de **189 pontos**.

---

## 7. Riscos de entrega

| # | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R-RM-01 | **Sincronização** maior do que o estimado (07.1, 07.6 são os maiores riscos de estimativa do backlog) | Média | Alta | Prova de conceito no passo 4 do M1, antes das telas; reestimar 07.x depois dela; FIN-EP-07 começa no M1, não no fim; roteiro de resiliência (07.9) desde o M1 como teste manual, mesmo antes de virar história pronta |
| R-RM-02 | **Custo de serviços** maior do que o esperado: o plano gratuito do Supabase pode não ter cópia diária e pode pausar projeto parado; o PowerSync tem limites no gratuito; EAS Build tem fila e limite no gratuito; conta Apple é anual e conta Google tem taxa única [SUPOSIÇÃO: verificar preços e regras atuais] | Média | Média | Decidir a D-BL-07 antes do M1; se ficar no gratuito, backup semanal próprio (`pg_dump` agendado) como na 03-arquitetura S-08; listar os custos mensais para o dono antes de ir a produção |
| R-RM-03 | **Perda de dados em uso real** antes de a sincronização estar blindada | Média | Alta | M1 e M2 são builds de teste, em paralelo ao controle atual (S-RM-01); o app só vira registro oficial no M3 (ou no MVP mínimo, que já inclui toda a FIN-EP-07 e o backup) |
| R-RM-04 | **Publicação nas lojas** atrasa: revisão das lojas, formulário de segurança de dados, política de privacidade e, no Google Play, contas pessoais novas que precisam de um período de teste fechado com vários testadores antes de liberar a produção [SUPOSIÇÃO: confirmar a regra atual]; app de um só usuário pode não ser aceito na App Store pública | Alta | Média | 09.6 antecipada para o M1: criar as contas e publicar no **canal de teste interno** desde o primeiro marco; política de privacidade (09.3) pronta cedo; decidir o canal final do MVP (D-RM-05): loja pública, teste interno/fechado ou instalação direta |
| R-RM-05 | **Dúvidas sem resposta no prazo** (§6) geram retrabalho ou travam o M3 | Alta | Média | Prazos amarrados a passos do roadmap; regras isoladas (R-14 do 05); levar ao dono, de uma vez, as dúvidas da §6.1 e §6.2 antes do M1 |
| R-RM-06 | **Escopo cresce** com dúvidas que puxam Pós-MVP para o MVP (até +20 pontos, §6.5) | Média | Média | Toda história que subir entra no M3 ou num marco novo, nunca no meio de um marco em andamento; lista de cortes pronta (§2.1, fim) para compensar |
| R-RM-07 | **Protótipo incompleto**: não tem tipo de veículo, "+ Novo veículo", TELA-14 nem calendário de período (04-backlog §1) | Média | Média | Design completa a parte de veículo antes do passo 7 do M1 (02.5) e o calendário antes do M2 (04.2); TELA-14 antes do M3; enquanto isso valem os wireframes do 02-design |
| R-RM-08 | **Atualização do app** (EAS Update ou nova versão) quebra o banco local ou a fila | Baixa | Alta | Teste de atualização com pendências na fila antes de cada publicação (CA-09.6.3), a partir do fim do M1 |
| R-RM-09 | **Conflitos entre aparelhos** mais frequentes do que o esperado, se o dono usar mais de um celular | Média | Média | Perguntar quantos aparelhos (D-RM-04); 07.7 só sai do MVP se for um aparelho |
| R-RM-10 | **Falta de aparelho de entrada** para medir desempenho (09.5) e rodar o checklist | Média | Média | Conseguir o Android de entrada (2 GB) até o início do M2, quando extrato e resumo começam a pesar |
| R-RM-11 | **Dono pouco disponível** para testar no fim de cada marco e responder dúvidas | Média | Alta | Marcos pequenos e testáveis; roteiro de teste curto para o dono por marco (o checklist da §3.2 resumido); dúvidas agrupadas por prazo (§6) |

---

### 7.1 Cenários de duração [SUPOSIÇÃO]

**Não é estimativa.** Não se sabe o tamanho nem a velocidade da equipe. A tabela só mostra quantas semanas seriam necessárias **se** a equipe entregasse, em média, a quantidade de pontos indicada por semana, arredondando para cima.

| Pontos por semana [SUPOSIÇÃO] | M1 (78) | MVP mínimo (121) | MVP completo (169) | v1.1 (20) |
|---|---|---|---|---|
| 5 | 16 semanas | 25 semanas | 34 semanas | 4 semanas |
| 10 | 8 semanas | 13 semanas | 17 semanas | 2 semanas |
| 15 | 6 semanas | 9 semanas | 12 semanas | 2 semanas |
| 20 | 4 semanas | 7 semanas | 9 semanas | 1 semana |

Cuidados ao ler a tabela:

- Não inclui espera por respostas do dono, revisão das lojas, nem os até +20 pontos da §6.5.
- A cadeia mais longa do MVP tem 53 pontos em sequência (§1); acrescentar pessoas não encurta esse trecho.
- A v2 não aparece porque seus épicos principais ainda não têm histórias nem pontos.

---

## 8. Suposições e dúvidas

### 8.1 Suposições deste roadmap

| # | Suposição |
|---|---|
| S-RM-01 | [SUPOSIÇÃO] Nas builds do M1 e do M2 o dono usa o app em paralelo ao controle atual, como teste; o app só vira o registro oficial no fim do M3 (ou do MVP mínimo). |
| S-RM-02 | [SUPOSIÇÃO] No MVP mínimo, o extrato sem filtro de período precisa de uma regra de exibição e de totais que não existe nos documentos (D-RM-03). |
| S-RM-03 | [SUPOSIÇÃO] A FIN-US-09.6 pode ser feita no M1 (build e canal de teste), e a publicação final no canal escolhido acontece no fim do M3, sem mudar os pontos da história. |
| S-RM-04 | [SUPOSIÇÃO] As histórias Pós-MVP foram divididas entre v1.1 (ajustes para o dono, dentro do módulo) e v2 (preparar outros usuários e módulos). O backlog só diz "Pós-MVP"; essa divisão é proposta deste documento. |
| S-RM-05 | [SUPOSIÇÃO] Os critérios da FIN-US-04.7 que o QA está escrevendo não mudam os 2 pontos nem a dependência (04.4) do backlog v2. |
| S-RM-06 | [SUPOSIÇÃO] Regras e preços de lojas, Supabase, PowerSync e EAS citados nos riscos precisam ser conferidos na época da decisão; não foram verificados para este documento. |
| S-RM-07 | O protótipo de referência foi considerado pelo que o 04-backlog e o 02-design §8.3 descrevem dele (o que falta: veículo, calendário, TELA-14). |
| S-RM-08 | [SUPOSIÇÃO] Os pontos de FIN-US-02.12, FIN-US-04.7 e das histórias do Resumo (05.4 a 05.6) foram mantidos depois da decisão E2-04 a. Podem mudar um pouco por causa da linha e da opção "Sem tipo de serviço"; se o DEV reestimar, os totais deste documento (M1 78, M2 52, MVP 169) serão atualizados. |

### 8.2 Dúvidas novas para o dono

| # | Dúvida | Efeito no roadmap |
|---|---|---|
| D-RM-01 | Aceita usar as builds de teste (M1 e M2) **em paralelo** ao controle atual, até o MVP ficar pronto? | Se não, o caminho é o MVP mínimo |
| D-RM-02 | Prefere esperar o **MVP completo** (com Resumo, filtros e cadastros) ou começar a registrar antes com o **MVP mínimo** e receber o resto por atualização? | Escolhe entre §2.1 e §2.2 |
| D-RM-03 | (Só se escolher o MVP mínimo) O extrato sem filtro deve mostrar todo o histórico ou só o mês atual? E os totais do topo são de quê? | Regra da 04.1 no MVP mínimo |
| D-RM-04 | Vai usar o app em **um ou mais celulares**? | Decide se a 07.7 (conflito) pode sair do MVP e o peso do R-RM-09 |
| D-RM-05 | O app precisa estar na **loja pública** (Google Play / App Store), ou basta um canal de teste/instalação só para você? As contas de desenvolvedor ficam em nome de quem (pessoa física ou empresa)? | Muda o esforço e o risco da publicação (R-RM-04) |

### 8.3 Dúvidas já abertas que este roadmap considera mais urgentes

Pela ordem de prazo (§6): **D-BL-07** (custo e plataformas), **dúvida 12 da visão / D-BL-09** (Pessoal tem unidade?), **D-QA-04** (nomes repetidos), **dúvida 5a** (lista de serviços). A D-BL-01 já foi resolvida (§6.4).
