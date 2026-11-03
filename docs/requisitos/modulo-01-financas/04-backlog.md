# Módulo 1 — Gestão de Finanças · Backlog

Projeto: Lavajato Sistema
Documento: 04-backlog.md · Autor: Agente Dev · Versão: 3 · Status: **rascunho para revisão** (v2: filtro por tipo de serviço no Extrato, FIN-US-04.7, pedido pelo QA em D-QA-03; registro de que "Produtos" é categoria de saída · v3: E2-04 respondida, opção a — veículo obrigatório, tipo de serviço opcional; FIN-US-02.12 desbloqueada e "Sem tipo de serviço" no Resumo e no filtro do Extrato)
Fontes: `01-visao.md` (v3), `02-design.md` (v4), `03-arquitetura.md` (v1). Em caso de conflito, vale a visão.

> Convenção: **[CONFIRMADO]** veio do dono · **[SUPOSIÇÃO]** não validado · **[DÚVIDA]** precisa de resposta antes de virar regra.
> Pontos: escala 1, 2, 3, 5, 8 (esforço relativo, não horas). Persona "Dono" = usuário único do MVP (D-02). Persona "equipe de desenvolvimento" = histórias técnicas.
> Abreviações nas tabelas: **Pts** = pontos · **Dep.** = dependências · **Fase** = MVP ou Pós-MVP.

---

## 1. Visão geral do backlog

O backlog transforma a visão, o design e a arquitetura do Módulo 1 em **70 histórias** distribuídas em **9 épicos**:

| | Histórias | Pontos |
|---|---|---|
| MVP | 61 | 170 |
| Pós-MVP | 9 | 23 |
| **Total** | **70** | **193** |

Ordem sugerida de construção (respeitando as dependências):

1. **Base técnica:** projeto do app, Supabase, esquema, RLS, auditoria, dados iniciais (FIN-EP-01) e PowerSync (FIN-EP-07, primeiras histórias). Sem isso nada é salvo nem sincronizado.
2. **Lançar:** valor estilo caixa registradora, campos comuns, saída, entrada de serviço, outras entradas (FIN-EP-02), com cadastros mínimos vindos dos dados iniciais.
3. **Ver:** saldo na Início, Extrato com período e filtros, Resumo (FIN-EP-04, FIN-EP-05).
4. **Corrigir e gerenciar:** detalhe, editar, excluir (FIN-EP-06); telas de cadastro (FIN-EP-03); Ajustes (FIN-EP-08).
5. **Fechar o MVP:** sincronização completa com erros e conflitos (FIN-EP-07), segurança, backup, desempenho e publicação (FIN-EP-09).

Pontos de atenção:

- **E2-04 / DU-12 (serviço × veículo) foi respondida pelo dono: opção a.** Numa entrada de serviço, o **tipo de veículo é obrigatório** e o **tipo de serviço é opcional**. "Entrada de serviço" passa a ser a entrada da categoria de sistema "Serviços" (não mais "entrada com tipo de serviço preenchido"). A regra está na FIN-US-02.12, agora desbloqueada; o Resumo (FIN-US-05.4) e o filtro do Extrato (FIN-US-04.7) ganham "Sem tipo de serviço" [SUPOSIÇÃO].
- O protótipo de referência (E2-01) ainda **não tem** tipo de veículo, "+ Novo veículo", TELA-14, filtro por veículo nem calendário de período (02-design §8.3). As histórias desses itens seguem os wireframes e o texto do 02-design.

---

## 2. Épicos

| ID | Épico | Objetivo | Histórias MVP | Pontos MVP | Pontos Pós-MVP |
|---|---|---|---|---|---|
| FIN-EP-01 | Fundação | Projeto do app, banco central, esquema, RLS, auditoria, dados iniciais, login, navegação e componentes base | 9 | 28 | 2 |
| FIN-EP-02 | Lançamentos | Lançar saída, entrada de serviço carro por carro e outras entradas em ≤ 4 toques | 12 | 33 | 0 |
| FIN-EP-03 | Cadastros | Categorias (4 de sistema + novas), tipos de serviço, tipos de veículo e formas de pagamento | 5 | 16 | 6 |
| FIN-EP-04 | Extrato e filtros | Lista de lançamentos com período (atalhos + calendário), unidade, categoria, tipo de serviço, veículo e Pessoal/Empresa | 7 | 21 | 0 |
| FIN-EP-05 | Resumo | Entrou/Saiu/Sobrou, gastos por categoria, entradas por tipo de serviço e por tipo de veículo | 6 | 17 | 3 |
| FIN-EP-06 | Correção e histórico | Detalhe, editar, excluir (lógico), histórico de alterações | 3 | 7 | 6 |
| FIN-EP-07 | Funcionamento offline e sincronização | Banco local, sincronização automática e por botão, pendências, erros, conflitos | 9 | 27 | 0 |
| FIN-EP-08 | Ajustes e preferências | Tela Mais/Ajustes, padrão Pessoal/Empresa, unidade atual, período compartilhado | 4 | 9 | 3 |
| FIN-EP-09 | Segurança, privacidade e operação | Sair da conta, backup, LGPD, revisão de segurança, desempenho, publicação | 6 | 12 | 3 |

**Ajustes em relação à sugestão do Orquestrador:**

- **Novo épico FIN-EP-09 (Segurança, privacidade e operação).** Os RNF de backup (RNF-16), LGPD (RNF-22 a RNF-26), revisão de segurança (RNF-18, RNF-21), desempenho medido (RNF-09 a RNF-12) e publicação nas lojas (RNF-02) não cabiam em nenhum épico funcional. Sem um épico próprio, ficariam sem dono e sem estimativa.
- **"Unidade atual" saiu da Fundação e foi para Ajustes (FIN-EP-08)**, como a própria sugestão indicava para "unidade atual". A Fundação fica com as unidades no banco, os dados iniciais e o vínculo usuário × unidade × papel.
- **Os elementos da TELA-01 (Início) ficaram divididos por assunto:** botões de lançamento e "Repetir" em Lançamentos, últimos 5 lançamentos em Extrato, cartão de saldo em Resumo, indicador de sincronização em Sincronização. Não há épico "Início" porque a tela é um painel de partes que têm dono em outros épicos.
- **Detalhe do lançamento (TELA-07)** está em Correção e histórico, porque é a porta de entrada para editar e excluir.

---

## 3. Histórias

### FIN-EP-01 — Fundação

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-01.1 | Como equipe de desenvolvimento, quero criar o projeto React Native com Expo (TypeScript), a estrutura de pastas e a navegação com barra inferior (Início · Extrato · Resumo · Mais), para ter a base onde todas as telas serão montadas. | 3 | — | MVP | TELA-01, TELA-05, TELA-06, TELA-09 (casca) | — | RNF-01, RNF-12 |
| FIN-US-01.2 | Como equipe de desenvolvimento, quero criar o projeto Supabase na região São Paulo (sa-east-1), com migrações SQL versionadas no repositório, para que o banco central seja reproduzível e nenhuma estrutura seja alterada à mão em produção. | 2 | — | MVP | — | — | RNF-23, RNF-27 |
| FIN-US-01.3 | Como equipe de desenvolvimento, quero criar o esquema do banco (organizacao, unidade, usuario, usuario_unidade, categoria, tipo_servico, tipo_veiculo, forma_pagamento, lancamento, lancamento_historico, dispositivo, preferencia_usuario), com valores em centavos, restrições `check`, campos de auditoria, `versao`, exclusão lógica, campos reservados (`situacao`, `origem`, `origem_ref_*`, `aplica_a`) e índices de 03-arquitetura §3, para guardar os dados conforme a arquitetura. A regra de obrigatoriedade de `tipo_veiculo_id` e `tipo_servico_id` nas entradas de serviço **não** entra aqui (ver FIN-US-02.12). | 5 | FIN-US-01.2 | MVP | — | — | RNF-13, RNF-15, RNF-24, RNF-27 |
| FIN-US-01.4 | Como equipe de desenvolvimento, quero ligar a RLS em todas as tabelas, com a função `tem_papel(unidade_id, papeis[])`, políticas só para o papel `dono`, sem DELETE físico e com `criado_por = auth.uid()` na inserção, e um teste automatizado com dois usuários de unidades diferentes, para que ninguém veja ou altere dados de unidade sem vínculo. | 5 | FIN-US-01.3 | MVP | — | — | RNF-18, RNF-19, RNF-20 |
| FIN-US-01.5 | Como equipe de desenvolvimento, quero gatilhos no Postgres que preencham `recebido_servidor_em`, incrementem `versao` e gravem `lancamento_historico` (criação, alteração, exclusão, restauração, com antes/depois e campos alterados), somente leitura para o app, para que toda mudança fique rastreável. | 3 | FIN-US-01.3 | MVP | — | JOR-h | RNF-13, RNF-14 |
| FIN-US-01.6 | Como equipe de desenvolvimento, quero carregar os dados iniciais: a organização, as unidades do dono e o vínculo dono × unidades; as 4 categorias de sistema (Serviços, Produtos, Mão de obra, Reembolso) e as demais categorias iniciais; os tipos de serviço iniciais; os tipos de veículo Carro, Moto, SUV, Caminhonete/Picape, Van (com ícone); e as formas de pagamento Dinheiro, Pix, Cartão de débito, Cartão de crédito, para que o dono possa lançar desde o primeiro acesso. [SUPOSIÇÃO] As unidades são cadastradas na implantação (DU-05). | 2 | FIN-US-01.3 | MVP | TELA-02, TELA-03, TELA-04, TELA-08 | JOR-a, JOR-b, JOR-d | — |
| FIN-US-01.7 | Como Dono, quero entrar com e-mail e senha e continuar conectado, para usar o app e a nuvem sem precisar entrar de novo a cada vez, inclusive sem internet. | 3 | FIN-US-01.1, FIN-US-01.2 | MVP | TELA-13 | — (primeiro uso) | RNF-04, RNF-18, RNF-21 |
| FIN-US-01.8 | Como Dono, no primeiro uso quero ver uma tela curta de boas-vindas, escolher a unidade inicial e ter os dados baixados para o celular, para começar a lançar logo e poder ficar sem internet depois. | 2 | FIN-US-01.7, FIN-US-07.1, FIN-US-08.3 | MVP | TELA-01 (primeiro uso), TELA-08 | — (primeiro uso) | RNF-04 |
| FIN-US-01.9 | Como equipe de desenvolvimento, quero os componentes base de interface (botões grandes, chips, aviso inferior, folha inferior, grade de ícones, item de lista), o catálogo de ícones, a formatação `R$ 1.234,56` e de datas ("Hoje", "Ontem", `03/11`) e rótulos para leitor de tela, para que todas as telas sigam as diretrizes de 02-design §5. | 3 | FIN-US-01.1 | MVP | todas | — | RNF-01 |
| FIN-US-01.10 | Como equipe de desenvolvimento, quero registrar no servidor os eventos `lancamento.criado/alterado/excluido/restaurado`, `tipo_servico.alterado`, `tipo_veiculo.alterado` e `categoria.alterada`, para que módulos futuros possam reagir. A forma de entrega fica para quando existir o primeiro consumidor (03-arquitetura §6.2). | 2 | FIN-US-01.5 | Pós-MVP | — | — | — |

### FIN-EP-02 — Lançamentos

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-02.1 | Como Dono, quero digitar o valor no teclado numérico que abre sozinho, no estilo caixa registradora (dígitos entram nos centavos; ⌫ apaga o último; segurar ⌫ zera; começa em R$ 0,00 cinza), para lançar o valor sem pensar em vírgula. Valor zero não salva; máximo R$ 999.999,99; acima de R$ 10.000,00 pede "Confere?" [SUPOSIÇÃO de limites]. O valor é guardado em centavos inteiros. | 3 | FIN-US-01.9 | MVP | TELA-02, TELA-03, TELA-04 | JOR-a, JOR-b, JOR-d | RNF-10 |
| FIN-US-02.2 | Como Dono, quero que os campos comuns do lançamento já venham preenchidos (Pessoal/Empresa no dropdown com o padrão; data = hoje no fuso da unidade, sem dias futuros; unidade = unidade atual, obrigatória quando "Todas as unidades" está ativo; forma de pagamento = última usada naquele tipo de lançamento [SUPOSIÇÃO]; descrição opcional recolhida, até 200 caracteres [SUPOSIÇÃO]), para só tocar no que for diferente. | 5 | FIN-US-01.9, FIN-US-01.6, FIN-US-08.2, FIN-US-08.3 | MVP | TELA-02, TELA-03, TELA-04 | JOR-a, JOR-b, JOR-d, JOR-j | RNF-10, RNF-24 |
| FIN-US-02.3 | Como Dono, quero lançar uma saída escolhendo o valor e a categoria por ícone (7 primeiras ativas + "Outros/•••") e tocando Salvar, para registrar um gasto em 3 toques + valor. Salvar fica desabilitado sem valor ou categoria ("Escolha a categoria"); grava só no banco local, com usuário, unidade e aparelho. | 3 | FIN-US-02.1, FIN-US-02.2, FIN-US-07.2 | MVP | TELA-03 | JOR-a | RNF-03, RNF-09, RNF-13 |
| FIN-US-02.4 | Como Dono, quero lançar outra entrada (não serviço), com as categorias de entrada sem "Serviços" e cor verde, para registrar, por exemplo, uma venda de produto (categoria de entrada "Venda de produtos", não a categoria de sistema "Produtos", que é de saída) em 3 toques + valor. | 2 | FIN-US-02.3 | MVP | TELA-04 | JOR-d | RNF-03, RNF-09 |
| FIN-US-02.5 | Como Dono, quero lançar a entrada de um serviço carro por carro, escolhendo o tipo de serviço na grade (opcional), o tipo de veículo na fileira (obrigatório) (último veículo usado já marcado e bem destacado), digitando o valor e a forma de pagamento, para registrar cada lavagem em 3 a 4 toques + valor. A categoria "Serviços" é definida sozinha; não há preço cadastrado. A validação de obrigatoriedade (veículo obrigatório, serviço opcional, E2-04 a) está na FIN-US-02.12. | 5 | FIN-US-02.1, FIN-US-02.2, FIN-US-07.2 | MVP | TELA-02 | JOR-b | RNF-03, RNF-09, RNF-10 |
| FIN-US-02.6 | Como Dono, quero criar um tipo de serviço novo pelo botão "+ Novo serviço" dentro do lançamento (folha só com o Nome), já selecionado ao salvar, para não sair do lançamento. Nome repetido de serviço ativo é recusado; nome de serviço desativado oferece "Reativar e usar" [SUPOSIÇÃO]. O novo entra no fim da ordem. | 3 | FIN-US-02.5 | MVP | TELA-02 | JOR-b (variação) | RNF-03 |
| FIN-US-02.7 | Como Dono, quero criar um tipo de veículo novo pelo botão "+ Novo veículo" no fim da fileira (folha só com o Nome, ícone genérico), já selecionado ao salvar, com as mesmas regras de nome repetido e reativação, para lançar um veículo que não está na lista [SUPOSIÇÃO, visão 3b-1]. | 2 | FIN-US-02.6 | MVP | TELA-02 | JOR-b (variação) | RNF-03 |
| FIN-US-02.8 | Como Dono, depois de salvar quero voltar à Início com o saldo atualizado e ver um aviso de ~5 s ("Saída de R$ 25,00 salva · Desfazer"; nos serviços, com serviço e veículo), para conferir e desfazer um erro na hora. [SUPOSIÇÃO] Desfazer faz exclusão lógica. | 2 | FIN-US-02.3 | MVP | TELA-01 | JOR-a, JOR-b, JOR-d, JOR-h | RNF-09 |
| FIN-US-02.9 | Como Dono, quero lançar vários carros em sequência com "Mais um igual" (no aviso) e "Repetir: serviço · veículo · forma" (na Início), que trazem tipo de serviço, tipo de veículo e forma de pagamento do anterior e nunca o valor, para gastar só 2 toques + valor por carro [SUPOSIÇÃO, visão 3c]. "Repetir" mostra o último serviço de hoje na unidade atual; sem ele, não aparece. | 3 | FIN-US-02.5, FIN-US-02.8 | MVP | TELA-01, TELA-02 | JOR-c | RNF-10 |
| FIN-US-02.10 | Como Dono, ao fechar um formulário com dados preenchidos quero a pergunta "Descartar este lançamento?", para não perder um lançamento por toque acidental. | 1 | FIN-US-02.2 | MVP | TELA-02, TELA-03, TELA-04 | JOR-a, JOR-b, JOR-d | — |
| FIN-US-02.11 | Como Dono, quero os botões grandes **+ Carro**, **+ Entrou** e **− Saiu** fixos na parte de baixo da Início, na zona do polegar, para começar qualquer lançamento com 1 toque. | 1 | FIN-US-01.1, FIN-US-01.9 | MVP | TELA-01 | JOR-a, JOR-b, JOR-d | RNF-01, RNF-10 |
| FIN-US-02.12 | Como Dono, quero que, numa entrada de serviço (categoria de sistema "Serviços"), o **tipo de veículo seja obrigatório** e o **tipo de serviço seja opcional** [CONFIRMADO, E2-04 opção a], para lançar um carro mesmo quando o serviço não se encaixa na lista, sem perder o resumo por veículo. No app: sem veículo, Salvar desabilitado com "Escolha o veículo" junto à fileira (também na edição); sem tipo de serviço, Salvar habilitado e nenhum aviso; tocar de novo no serviço marcado o desmarca [SUPOSIÇÃO]; o lançamento sem tipo aparece como "Serviço · SUV · Pix" no aviso, Extrato, Início e Detalhe [SUPOSIÇÃO de texto]; "Mais um igual"/"Repetir" copiam a ausência de tipo. No servidor: entrada da categoria "Serviços" sem `tipo_veiculo_id` é recusada (vira erro de dado, FIN-US-07.6); saída ou entrada de outra categoria com `tipo_veiculo_id` ou `tipo_servico_id` é recusada. [SUPOSIÇÃO] A categoria "Serviços" é reconhecida pelo id fixo carregado nos dados iniciais (FIN-US-01.6), não pelo nome, que pode ser renomeado. **Pontos: de 2 para 3**, porque a regra no servidor passa a depender da categoria (outra tabela), o que exige gatilho em vez de uma simples restrição `check`, e porque há o estado "sem tipo de serviço" na exibição e no "Repetir". | 3 | FIN-US-02.5, FIN-US-01.3 | MVP | TELA-02 | JOR-b | — |

### FIN-EP-03 — Cadastros

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-03.1 | Como Dono, quero ver as categorias em abas Saídas/Entradas e criar (nome, ícone, cor), renomear e desativar categorias, para adaptar a grade de lançamento ao meu negócio. Desativar esconde da grade, mas mantém extrato e resumo antigos; não há excluir. Nome único por tipo entre as ativas. | 5 | FIN-US-01.6, FIN-US-07.1, FIN-US-08.1 | MVP | TELA-10 | JOR-i | RNF-03 |
| FIN-US-03.2 | Como Dono, quero que as 4 categorias de sistema (Serviços, Produtos, Mão de obra, Reembolso) apareçam com a chave Ativa travada e um cadeado ("Categoria usada pelo sistema. Pode mudar o nome, mas não pode ser desativada."), para não quebrar lançamentos nem módulos futuros. [SUPOSIÇÃO: interpretação do Orquestrador de E2-02, a confirmar.] | 2 | FIN-US-03.1 | MVP | TELA-10 | JOR-i | — |
| FIN-US-03.3 | Como Dono, quero criar, renomear e desativar tipos de serviço (só o nome), com recusa de nome repetido e oferta de reativação, para manter a grade da TELA-02 com os serviços que ofereço. | 3 | FIN-US-01.6, FIN-US-07.1, FIN-US-08.1 | MVP | TELA-11 | JOR-i | RNF-03 |
| FIN-US-03.4 | Como Dono, quero criar (ícone genérico), renomear e desativar tipos de veículo, com a mesma lista em todas as unidades, para manter a fileira de veículos da TELA-02 atualizada. Se o veículo desativado era o último usado, a TELA-02 abre sem veículo marcado. | 3 | FIN-US-03.3 | MVP | TELA-14 | JOR-i | RNF-03 |
| FIN-US-03.5 | Como Dono, quero reordenar categorias, tipos de serviço e tipos de veículo arrastando, para que os mais usados fiquem primeiro na grade e na fileira. | 3 | FIN-US-03.1, FIN-US-03.3, FIN-US-03.4 | MVP | TELA-10, TELA-11, TELA-14 | JOR-i | — |
| FIN-US-03.6 | Como Dono, quero criar, renomear, desativar e reordenar formas de pagamento, para incluir formas além das quatro iniciais. [SUPOSIÇÃO] No MVP a lista vem só dos dados iniciais (FIN-US-01.6), porque o item "Formas de pagamento" da TELA-09 não tem tela desenhada. | 3 | FIN-US-08.1 | Pós-MVP | TELA-09 (+ tela nova) | JOR-i | — |
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
| FIN-US-06.2 | Como Dono, quero editar um lançamento no mesmo formulário em que foi criado, já preenchido (valor completo, data sem dias futuros), com "Alterado" no detalhe, para corrigir um erro sem perder o registro de quem alterou e quando. | 3 | FIN-US-06.1, FIN-US-01.5 | MVP | TELA-07, TELA-02, TELA-03, TELA-04 | JOR-h | RNF-13, RNF-14 |
| FIN-US-06.3 | Como Dono, quero excluir um lançamento com confirmação ("Excluir esta saída de R$ 25,00 (Alimentação, hoje)?"), para remover um lançamento errado. A exclusão é lógica: some de extrato, saldo e resumo, mas fica no banco e no histórico. | 2 | FIN-US-06.1 | MVP | TELA-07, TELA-05 | JOR-h | RNF-14, RNF-15 |
| FIN-US-06.4 | Como Dono, quero ver no app o histórico de alterações de um lançamento (antes/depois, quem, quando, aparelho, conflito) e voltar a valores anteriores, para entender e desfazer mudanças. **[DÚVIDA DU-04]** O registro já é guardado no MVP (FIN-US-01.5). | 3 | FIN-US-06.2 | Pós-MVP | TELA-07 (+ tela nova) | JOR-h | RNF-14 |
| FIN-US-06.5 | Como Dono, quero uma lixeira para ver e restaurar lançamentos excluídos (ação `restauracao`), para recuperar uma exclusão por engano. **[DÚVIDA 2 da arquitetura: lixeira e prazo]** | 3 | FIN-US-06.3 | Pós-MVP | (tela nova) | JOR-h | RNF-14, RNF-15 |

### FIN-EP-07 — Funcionamento offline e sincronização

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-07.1 | Como equipe de desenvolvimento, quero configurar o PowerSync (serviço, regras de sincronização por organização/unidade do usuário e SDK com SQLite no app), para que o app leia e grave no banco local e sincronize com o Supabase respeitando a RLS. [Se o dono vetar o PowerSync por custo, esta história é refeita com a alternativa simples de 03-arquitetura §2.2, incluindo a `fila_envio`.] | 5 | FIN-US-01.3, FIN-US-01.4 | MVP | — | JOR-k | RNF-03, RNF-05, RNF-08 |
| FIN-US-07.2 | Como equipe de desenvolvimento, quero gerar UUID v7 no aparelho para todo registro, registrar o `dispositivo` na primeira sincronização e garantir no servidor "inserir ou ignorar se já existe", para que reenvios não dupliquem lançamentos. | 2 | FIN-US-07.1 | MVP | — | JOR-k | RNF-08, RNF-13 |
| FIN-US-07.3 | Como Dono, quero que o app sincronize sozinho ao salvar, ao abrir, ao voltar a ter internet e a cada ~5 min com o app aberto, sem nunca esperar a rede para salvar, para não ter que lembrar de enviar nada. | 3 | FIN-US-07.2 | MVP | TELA-01 | JOR-k | RNF-05, RNF-08, RNF-09 |
| FIN-US-07.4 | Como Dono, quero ver sempre no topo da Início o estado da nuvem (✓ com hora, "N para enviar", "Enviando…", sem internet com a faixa "Seus lançamentos estão salvos no celular", erro em amarelo) e um relógio nos lançamentos pendentes do extrato, para saber se está tudo salvo. | 3 | FIN-US-07.3 | MVP | TELA-01, TELA-05 | JOR-k | RNF-07 |
| FIN-US-07.5 | Como Dono, quero uma tela de Sincronização (última sincronização, pendentes, erros em linguagem simples) com o botão "Sincronizar agora", que mostra o resultado (sucesso, nada pendente ou erro), para forçar o envio quando eu quiser. | 3 | FIN-US-07.4, FIN-US-08.1 | MVP | TELA-12, TELA-09, TELA-01 | JOR-k | RNF-06 |
| FIN-US-07.6 | Como Dono, quero que falhas de envio sejam tratadas sem perder nada: erro temporário tenta de novo com espera crescente; sessão vencida renova ou pede login sem apagar a fila; recusa por permissão ou por dado fica marcada como erro, com opção de corrigir e reenviar ou descartar (com confirmação); um erro não trava os outros envios, para confiar que nenhum lançamento se perde. | 5 | FIN-US-07.3 | MVP | TELA-12, TELA-01 | JOR-k | RNF-08 |
| FIN-US-07.7 | Como Dono, se o mesmo lançamento for alterado em dois aparelhos sem internet, quero que valha a última alteração recebida pelo servidor (excluir vence editar), com o histórico marcado como conflito e o aviso "Este lançamento foi alterado em outro aparelho", para não perder nenhuma versão. [SUPOSIÇÃO, dúvida 1 da arquitetura] | 3 | FIN-US-07.3, FIN-US-01.5 | MVP | TELA-07 | JOR-h, JOR-k | RNF-14 |
| FIN-US-07.8 | Como Dono, quero um aviso na Início quando houver lançamentos pendentes há mais de 24 h, para saber que eles ainda existem só no celular [SUPOSIÇÃO de prazo]. | 1 | FIN-US-07.4 | MVP | TELA-01 | JOR-k | RNF-17 |
| FIN-US-07.9 | Como equipe de desenvolvimento, quero um roteiro de teste de resiliência (modo avião, lançar, fechar o app à força, reiniciar o aparelho, reconectar, conferir no servidor) executado a cada versão, para garantir que nada se perde. | 2 | FIN-US-07.6 | MVP | — | JOR-k | RNF-03, RNF-08 |

### FIN-EP-08 — Ajustes e preferências

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-08.1 | Como Dono, quero a tela Mais/Ajustes com acesso a Categorias, Tipos de serviço, Tipos de veículo, Padrão Pessoal/Empresa, Sincronização, Sobre e Sair, para encontrar as configurações num só lugar. | 2 | FIN-US-01.1 | MVP | TELA-09 | JOR-i, JOR-k | — |
| FIN-US-08.2 | Como Dono, quero trocar o padrão Pessoal/Empresa (inicial "Empresa") e ter a mesma preferência em todos os meus aparelhos (`preferencia_usuario`, sincronizada), para que um celular não lance com padrão diferente do outro. | 2 | FIN-US-08.1, FIN-US-07.1 | MVP | TELA-09 | JOR-a, JOR-b, JOR-d | RNF-03 |
| FIN-US-08.3 | Como Dono, quero trocar a unidade atual pelo seletor no topo (lista + "Todas as unidades"), com o topo mudando de nome e cor e a escolha lembrada até eu trocar de novo, para nunca lançar na unidade errada. | 3 | FIN-US-01.6, FIN-US-01.9 | MVP | TELA-08, TELA-01 | JOR-j, JOR-e | — |
| FIN-US-08.4 | Como Dono, quero que o período escolhido valha junto no Extrato e no Resumo (trocar numa tela troca na outra), para não ter que escolher duas vezes [CONFIRMADO E2-10]. O período padrão ao abrir depende de dúvida (ver §6, D-BL-02). | 2 | FIN-US-04.2 | MVP | TELA-05, TELA-06 | JOR-f, JOR-g | — |
| FIN-US-08.5 | Como Dono, quero cadastrar e editar unidades pelo app (nome, fuso), para abrir uma unidade nova sem depender da equipe. **[DÚVIDA DU-05]** | 3 | FIN-US-08.1 | Pós-MVP | TELA-09 (+ tela nova) | — | RNF-20 |

### FIN-EP-09 — Segurança, privacidade e operação

| ID | História | Pts | Dep. | Fase | Telas | Jornadas | RNF |
|---|---|---|---|---|---|---|---|
| FIN-US-09.1 | Como Dono, quero sair da conta apagando os dados do celular, com confirmação explícita se houver lançamentos ainda não enviados, para proteger meus dados ao trocar ou emprestar o aparelho. | 2 | FIN-US-01.7, FIN-US-07.4 | MVP | TELA-09 | — | RNF-25 |
| FIN-US-09.2 | Como equipe de desenvolvimento, quero cópia de segurança diária (retenção ≥ 7 dias) e semanal fora do Supabase (retenção de 3 meses), com uma restauração testada antes de ir para produção, para não perder dados do servidor [SUPOSIÇÃO de prazos; custo depende da dúvida 4 da arquitetura]. | 3 | FIN-US-01.2 | MVP | — | — | RNF-16 |
| FIN-US-09.3 | Como Dono, quero uma política de privacidade simples publicada com o app e uma orientação no campo descrição para não colocar dados sensíveis, para cumprir a LGPD. | 1 | FIN-US-02.2 | MVP | TELA-09, TELA-02, TELA-03, TELA-04 | — | RNF-22, RNF-24 |
| FIN-US-09.4 | Como equipe de desenvolvimento, quero uma revisão de segurança antes de publicar (nenhuma chave service_role no app, só HTTPS, senha mínima de 8 caracteres, RLS testada), para não expor dados. | 1 | FIN-US-01.4, FIN-US-01.7 | MVP | — | — | RNF-18, RNF-19, RNF-21 |
| FIN-US-09.5 | Como equipe de desenvolvimento, quero medir em um aparelho Android de entrada, com 10.000 lançamentos, os tempos de salvar (≤ 300 ms), abrir formulário (≤ 1 s), extrato/resumo (≤ 1 s) e partida a frio (≤ 3 s), para garantir agilidade no pátio. | 2 | FIN-US-04.1, FIN-US-05.3 | MVP | TELA-01 a TELA-06 | JOR-a, JOR-b, JOR-f, JOR-g | RNF-02, RNF-09, RNF-10, RNF-11, RNF-12 |
| FIN-US-09.6 | Como equipe de desenvolvimento, quero gerar e publicar o app (EAS Build) para Android 8+ e, se for o caso, iOS 15+, com atualizações pelo EAS Update, para que o dono instale e receba correções. [Plataformas dependem da dúvida 6 da arquitetura.] | 3 | FIN-US-01.1 | MVP | — | — | RNF-01, RNF-02 |
| FIN-US-09.7 | Como Dono, quero que o app peça PIN ou biometria ao abrir, para proteger os dados se o celular for perdido. **[DÚVIDA 3 da arquitetura]** Pode subir para o MVP se o dono quiser. | 2 | FIN-US-01.7 | Pós-MVP | (tela nova) | — | RNF-25 |
| FIN-US-09.8 | Como equipe de desenvolvimento, quero um procedimento administrativo documentado (fora do app) para apagar definitivamente os dados de um titular, para atender pedidos de exclusão da LGPD antes da expansão para outros usuários. | 1 | FIN-US-01.3 | Pós-MVP | — | — | RNF-26 |

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
| TELA-07 Detalhe | 06.1, 06.2, 06.3, 07.7 | 06.4 |
| TELA-08 Seletor de unidade | 01.6, 01.8, 04.3, 05.2, 08.3 | — |
| TELA-09 Mais / Ajustes | 01.1, 07.5, 08.1, 08.2, 09.1, 09.3 | 03.6, 08.5 |
| TELA-10 Categorias | 03.1, 03.2, 03.5 | 03.7 |
| TELA-11 Tipos de serviço | 03.3, 03.5 | — |
| TELA-12 Sincronização | 07.5, 07.6 | — |
| TELA-13 Entrar | 01.7 | — |
| TELA-14 Tipos de veículo | 03.4, 03.5 | — |

**Todas as 14 telas têm pelo menos uma história MVP.** (IDs abreviados: "02.5" = FIN-US-02.5.)

Telas novas que só aparecem em histórias Pós-MVP e **ainda não existem no 02-design**: gestão de formas de pagamento (03.6), histórico de alterações (06.4), lixeira (06.5), gestão de unidades (08.5), bloqueio por PIN/biometria (09.7).

### 4.2 Entidades do modelo de dados × histórias

| Entidade | Histórias que criam ou usam |
|---|---|
| organizacao | 01.3, 01.6 |
| unidade | 01.3, 01.6, 08.3, 05.2, 04.3 |
| usuario | 01.3, 01.7 |
| usuario_unidade | 01.3, 01.4, 01.6 |
| categoria | 01.3, 01.6, 02.3, 02.4, 02.12, 03.1, 03.2, 03.5, 05.3 · Pós: 03.7 (`aplica_a`) |
| tipo_servico | 01.3, 01.6, 02.5, 02.6, 03.3, 03.5, 04.7, 05.4 |
| tipo_veiculo | 01.3, 01.6, 02.5, 02.7, 03.4, 03.5, 04.5, 05.5 |
| forma_pagamento | 01.3, 01.6, 02.2 · Pós: 03.6 (gestão) |
| lancamento | 01.3, 02.3, 02.4, 02.5, 02.12, 04.1, 05.1, 06.2, 06.3, 07.2, 07.7 |
| lancamento_historico | 01.5, 06.2, 06.3, 07.7 · Pós: 06.4, 06.5 |
| dispositivo | 01.3, 07.2 |
| preferencia_usuario | 01.3, 08.2 |
| config_local (só no aparelho) | 02.2 (última forma), 02.5 (último veículo), 02.9 (repetir), 08.3 (unidade atual), 08.4 (período), 07.3 (marcador) |
| fila_envio (só no aparelho) | Não se aplica com PowerSync (fila interna). Só seria usada se FIN-US-07.1 for refeita com a alternativa simples. |

**Nenhuma entidade sem história.** Observações:

- `forma_pagamento` só tem **gestão** no Pós-MVP (03.6); no MVP é usada a partir dos dados iniciais. Ver D-BL-04.
- Campos reservados sem comportamento no MVP, criados só na estrutura (01.3): `lancamento.situacao` (PIF-06), `lancamento.origem`/`origem_ref_*` (PIF-01 a PIF-04), `categoria.aplica_a` (dúvida 13), papéis `gerente`/`funcionario` (PIF-05).

### 4.3 RNF × histórias

| RNF | Histórias | RNF | Histórias |
|---|---|---|---|
| RNF-01 | 01.1, 01.9, 02.11, 09.6 | RNF-15 | 01.3, 06.3 |
| RNF-02 | 09.5, 09.6 | RNF-16 | 09.2 |
| RNF-03 | 07.1, 07.9, 02.3, 02.4, 02.5, 03.x, 04.1, 05.1 | RNF-17 | 07.8 |
| RNF-04 | 01.7, 01.8 | RNF-18 | 01.4, 01.7, 09.4 |
| RNF-05 | 07.1, 07.3 | RNF-19 | 01.4, 09.4 |
| RNF-06 | 07.5 | RNF-20 | 01.4 |
| RNF-07 | 07.4 | RNF-21 | 01.7, 09.4 |
| RNF-08 | 07.1, 07.2, 07.3, 07.6, 07.9 | RNF-22 | 09.3 |
| RNF-09 | 02.3, 02.8, 07.3, 09.5 | RNF-23 | 01.2 |
| RNF-10 | 02.1, 02.2, 02.5, 02.9, 09.5 | RNF-24 | 01.3, 02.2, 09.3 |
| RNF-11 | 04.1, 04.2, 05.1, 05.3–05.5, 09.5 | RNF-25 | 09.1 · Pós: 09.7 |
| RNF-12 | 01.1, 09.5 | RNF-26 | Pós: 09.8 |
| RNF-13 | 01.3, 01.5, 02.3, 06.1, 06.2, 07.2 | RNF-27 | 01.2, 01.3 |
| RNF-14 | 01.5, 06.2, 06.3, 07.7 | | |

Todos os 27 RNF estão cobertos. **RNF-26** só tem história Pós-MVP, o que é coerente com o próprio critério ("antes da expansão para outros usuários"). **RNF-25** fica parcial no MVP: sair da conta sim, bloqueio por PIN/biometria depende de dúvida.

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
| JOR-h | 02.8, 06.1, 06.2, 06.3, 07.7 |
| JOR-i | 03.1 a 03.5, 08.1 |
| JOR-j | 08.3 |
| JOR-k | 07.1 a 07.9 |

---

## 5. Totais

| Épico | Histórias MVP | Pontos MVP | Histórias Pós-MVP | Pontos Pós-MVP | Pontos totais |
|---|---|---|---|---|---|
| FIN-EP-01 Fundação | 9 | 28 | 1 | 2 | 30 |
| FIN-EP-02 Lançamentos | 12 | 33 | 0 | 0 | 33 |
| FIN-EP-03 Cadastros | 5 | 16 | 2 | 6 | 22 |
| FIN-EP-04 Extrato e filtros | 7 | 21 | 0 | 0 | 21 |
| FIN-EP-05 Resumo | 6 | 17 | 1 | 3 | 20 |
| FIN-EP-06 Correção e histórico | 3 | 7 | 2 | 6 | 13 |
| FIN-EP-07 Offline e sincronização | 9 | 27 | 0 | 0 | 27 |
| FIN-EP-08 Ajustes e preferências | 4 | 9 | 1 | 3 | 12 |
| FIN-EP-09 Segurança, privacidade e operação | 6 | 12 | 2 | 3 | 15 |
| **Total** | **61** | **170** | **9** | **23** | **193** |

- **Total do MVP: 61 histórias, 170 pontos.**
- **Total Pós-MVP: 9 histórias, 23 pontos.**
- Histórias técnicas ("equipe de desenvolvimento") no MVP: 14 histórias, 43 pontos (01.1–01.6, 01.9, 07.1, 07.2, 07.9, 09.2, 09.4, 09.5, 09.6).
- Maiores riscos de estimativa: FIN-US-07.1 (PowerSync; vira 8+ com a alternativa simples), FIN-US-07.6 (erros de sincronização) e FIN-US-04.2 (calendário de intervalo, ainda não prototipado).

---

## 6. Suposições e dúvidas

### 6.1 Suposições deste backlog

| # | Suposição |
|---|---|
| S-BL-01 | [SUPOSIÇÃO] Stack recomendada (Expo + PowerSync + Supabase). Se o dono vetar o PowerSync, FIN-US-07.1 sobe para pelo menos 8 pontos e surge a entidade `fila_envio`. |
| S-BL-02 | [SUPOSIÇÃO] As unidades e o vínculo dono × unidades são cadastrados pela equipe na implantação (dados iniciais), enquanto DU-05 não é respondida. |
| S-BL-03 | [SUPOSIÇÃO] No MVP, as formas de pagamento são as quatro iniciais, sem tela de gestão, porque não há tela desenhada para isso (o item aparece na TELA-09 só como [SUPOSIÇÃO]). |
| S-BL-04 | [SUPOSIÇÃO] "Desfazer" do aviso pós-salvar é uma exclusão lógica comum (fica no histórico), e não um apagamento do registro local. |
| S-BL-05 | [SUPOSIÇÃO] Reordenar por arrastar (FIN-US-03.5) fica no MVP porque está no 02-design, embora o protótipo HTML não o tenha. É a primeira candidata a corte se for preciso reduzir o MVP. |
| S-BL-06 | [SUPOSIÇÃO] As suposições já marcadas na visão, no design e na arquitetura (limites de valor, prazos de backup, 24 h de pendência, ~5 min de sincronização, forma de pagamento pré-selecionada, "repetir último", filtro por veículo, histórico com conflito) foram mantidas como estão; as histórias que dependem delas estão marcadas. |
| S-BL-07 | [SUPOSIÇÃO] Lançamento Pessoal pertence a uma unidade (unidade obrigatória), como na arquitetura, enquanto a dúvida 12 da visão não é respondida. |
| S-BL-08 | [SUPOSIÇÃO] O protótipo de referência foi considerado pelo que o 02-design §8.3 descreve dele; onde o protótipo ainda não tem o item (veículo, calendário), valem os wireframes e o texto do 02-design. |
| S-BL-09 | [CONFIRMADO, visão §5.1 item 3] A categoria de sistema **"Produtos" é de saída** (compra de produtos; é nela que o Estoque vai gerar saídas, PIF-02). A venda de produtos ao cliente é outra categoria, **de entrada: "Venda de produtos"**. FIN-US-01.6 carrega as duas; FIN-US-02.4 usa "Venda de produtos". Nenhuma história trata "Produtos" como entrada. |

### 6.2 Dúvidas que bloqueiam ou mudam histórias

| # | Dúvida | Histórias afetadas | Efeito |
|---|---|---|---|
| D-BL-01 | ~~**E2-04 / DU-12:** qual é a regra de obrigatoriedade entre tipo de serviço e tipo de veículo numa entrada de serviço? (a) veículo obrigatório e serviço opcional; (b) os dois opcionais; (c) os dois obrigatórios, independentes.~~ **Respondida (E2-04): opção a**, veículo obrigatório e tipo de serviço opcional. | 02.5, 02.12, 01.3, 04.7, 05.4, 05.6 | Aplicada na v3: FIN-US-02.12 desbloqueada (2 → 3 pts); "entrada de serviço" = categoria "Serviços"; "Sem tipo de serviço" no Resumo (05.4) e no filtro do Extrato (04.7). |
| D-BL-02 | **Período padrão com período compartilhado (E2-10):** o 02-design diz que o Extrato abre em **Hoje** e o Resumo em **Mês atual**, mas também que o período vale junto para as duas telas. Qual vale ao abrir o app: Hoje, Mês, ou o último escolhido? | 08.4, 04.2, 05.3 | Muda o estado inicial e se o período é guardado entre aberturas do app. |
| D-BL-03 | **E2-02:** as 4 categorias de sistema podem ser renomeadas (e ter ícone e cor trocados), mas não desativadas? (interpretação do Orquestrador, a confirmar) | 03.2 | Muda a TELA-10. |
| D-BL-04 | **DU-05:** quem cadastra as unidades: o dono pelo app ou a equipe na implantação? E as formas de pagamento precisam de tela de gestão no MVP? | 01.6, 08.5, 03.6 | Pode trazer 08.5 (3 pts) e 03.6 (3 pts) para o MVP. |
| D-BL-05 | **DU-04 e dúvida 2 da arquitetura:** o dono quer ver o histórico de alterações e uma lixeira no app? | 06.4, 06.5 | Pode trazer até 6 pontos para o MVP. |
| D-BL-06 | **Dúvida 3 da arquitetura:** PIN/biometria ao abrir o app? | 09.7 | Pode trazer 2 pontos para o MVP; acrescenta um passo ao abrir. |
| D-BL-07 | **Dúvidas 4 e 6 da arquitetura:** aceita custo de plano pago (Supabase/PowerSync)? Só Android ou também iPhone? | 07.1, 09.2, 09.6 | Muda a stack de sincronização, a forma de backup e o esforço de publicação. |
| D-BL-08 | **Dúvida 1 da arquitetura:** aceita "vale a última alteração enviada, com aviso e histórico" para edição em dois aparelhos? | 07.7 | Muda a regra de conflito. |
| D-BL-09 | **Dúvidas 12 e 13 da visão:** lançamento Pessoal pertence a uma unidade? Categorias separadas para Pessoal e Empresa? | 02.2, 05.1, 03.7 | Pode tornar a unidade opcional nos pessoais e trazer 03.7 para o MVP. |
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
| Contas a pagar e a receber com vencimento; gastos recorrentes | Evolução deste módulo | PIF-06, D-01, dúvida 7 |
| Regra de alteração de lançamentos gerados por outro módulo (`origem ≠ manual`) | Primeiro módulo que gerar lançamentos | 03-arquitetura §6.3 |
| Agendamento de clientes | Agendamento | visão §5.3 |
| Integração bancária, Pix automático, conciliação, importação de extrato | Fora do sistema por ora | visão §5.3 |
| Nota fiscal, impostos, contabilidade (DRE, balanço), folha de pagamento completa | Fora do sistema por ora | visão §5.3 |
| Foto do comprovante (`lancamento_anexo`, Supabase Storage) | Evolução deste módulo, se o dono pedir | dúvida 6 |
| Exportação para o contador (CSV/PDF) | Evolução deste módulo, se o dono pedir | dúvida 8 |
| Painel web para o dono | Não pedido | 03-arquitetura §8 |
| Notificações e alertas de gasto acima do normal | Não pedido | 03-arquitetura §8 |
| Histórico de alterações das tabelas de cadastro | Evolução | 03-arquitetura §8 |
| Modo escuro | Prioridade baixa | 02-design §5.7 |
