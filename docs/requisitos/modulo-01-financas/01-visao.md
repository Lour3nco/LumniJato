# Módulo 1 — Gestão de Finanças · Visão

Projeto: Lavajato Sistema
Documento: 01-visao.md · Autor: Orquestrador · Versão: 3 · Status: **aguardando aprovação** (D-01, D-02 e D-03 decididas)

> Convenção: **[CONFIRMADO]** veio do dono · **[SUPOSIÇÃO]** não foi confirmado e deve ser validado · **[DÚVIDA]** precisa de resposta antes de virar regra.
>
> Este módulo substitui o antigo Módulo 1 (Produtos e Estoque), que fica arquivado em `../modulo-01-estoque/` para ser retomado como módulo futuro.

---

## 1. Contexto do negócio

- [CONFIRMADO] O primeiro módulo do sistema é a **gestão de finanças**.
- [CONFIRMADO] O app deve funcionar **como uma planilha de gastos, mas sem planilha**: registrar o que **entra** e o que **sai** de forma clara e amigável.
- [CONFIRMADO] Tipos de gasto citados pelo dono: **mão de obra, reembolso, gasto de produtos, alimentação, passagem, gastos de água**.
- [CONFIRMADO] Toda entrada e toda saída é classificada como **Pessoal** ou **Empresa**, escolhida num **dropdown**. Interpretação do Orquestrador: separar o dinheiro pessoal do dono do dinheiro do lava-jato.
- [CONFIRMADO] O módulo registra **só o que já entrou e já saiu** (D-01).
- [CONFIRMADO] No início, **só o dono usa o app**; no futuro haverá expansão para outros usuários (D-02).
- [CONFIRMADO] As entradas de serviço são lançadas **carro por carro**, com **tipo de serviço** (ex.: Lavagem rápida, Lavagem completa…) (D-03) e **tipo de veículo** (ex.: Carro, Moto, SUV…).
- [CONFIRMADO] Lava-jato com **poucos funcionários**, onde **agilidade é essencial**. Ninguém pode perder tempo pensando em como lançar.
- [CONFIRMADO] **Mais de uma unidade.** Um usuário pode ser gerente em mais de uma unidade, e funcionários podem trabalhar em mais de uma unidade.
- [CONFIRMADO] **Aplicativo de celular** que guarda os dados no aparelho, funciona sem internet e sincroniza com o banco em nuvem (**Supabase**) automaticamente quando há internet, além de um botão "Sincronizar".

## 2. Problema

O dono não tem uma visão clara e rápida do dinheiro do lava-jato:

- os gastos do dia a dia (diária de lavador, almoço, passagem, produto comprado às pressas, conta de água) se perdem ou ficam espalhados em papel, mensagens e memória;
- não sabe, ao fim do dia ou do mês, **quanto entrou, quanto saiu e quanto sobrou**, por unidade;
- não sabe **em que categoria gasta mais**, então não sabe onde cortar;
- uma planilha resolveria em tese, mas é lenta e difícil de preencher no celular, no meio do expediente.

[SUPOSIÇÃO] Hoje o controle é feito em caderno, planilha ou não é feito.

## 3. Objetivos mensuráveis

| ID | Objetivo | Indicador | Meta inicial |
|---|---|---|---|
| OBJ-01 | Registro sem atrito | Tempo para lançar um gasto ou uma entrada no celular | ≤ 15 segundos e ≤ 4 toques [SUPOSIÇÃO] |
| OBJ-02 | Nada fica de fora | % dos gastos do mês lançados no app (comparado com comprovantes/extrato) | ≥ 95% após o 1º mês [SUPOSIÇÃO] |
| OBJ-03 | Fechamento sem planilha | O dono consegue ver entradas, saídas e saldo do mês por unidade sem montar nada fora do app | Sim, desde o MVP |
| OBJ-04 | Saber onde o dinheiro vai | Resumo de gastos por categoria, por período e por unidade | Disponível no MVP |
| OBJ-05 | Rastreabilidade | % dos lançamentos com usuário, unidade, data e categoria | 100% |

## 4. Quem usa e para quê

| Perfil | Fase | Uso principal no módulo |
|---|---|---|
| Dono | **MVP (único usuário)** | Lança todas as entradas (carro por carro) e saídas, de todas as unidades; vê saldo, extrato e gastos por categoria; gerencia categorias e tipos de serviço |
| Gerente (de uma ou mais unidades) | Expansão futura | Lançar entradas e saídas da sua unidade; acompanhar o saldo do dia e do mês |
| Funcionário / lavador | Expansão futura | Possível uso: registrar um gasto que pagou do próprio bolso, para reembolso |

**Multiunidade:** cada lançamento pertence a uma unidade, e o dono vê o consolidado e cada unidade separada. O modelo de dados já nasce com usuário × unidade × papel (decisão do sistema todo), mas **no MVP só existe o papel Dono**. Telas de convite e gestão de usuários ficam para a expansão.

## 5. Escopo

### 5.1 DENTRO do módulo

1. **Lançamento de saída (gasto):** valor, **Pessoal/Empresa**, categoria, data, unidade, forma de pagamento, descrição opcional.
2. **Lançamento de entrada:** valor, **Pessoal/Empresa**, categoria, data, unidade, forma de pagamento, descrição opcional.
2a. **Classificação Pessoal / Empresa:** campo obrigatório em todo lançamento, escolhido num dropdown, com valor padrão já preenchido ([SUPOSIÇÃO] padrão "Empresa"). Extrato, resumo e gráfico por categoria podem ser filtrados por Pessoal, Empresa ou ambos, e o saldo da empresa é mostrado separado do pessoal.
3. **Categorias** prontas, com ícone e cor, e possibilidade de o dono criar, renomear e desativar categorias.
   - Saídas iniciais [CONFIRMADO]: Mão de obra · Reembolso · Produtos · Alimentação · Passagem · Água.
   - Saídas adicionais [SUPOSIÇÃO]: Energia · Aluguel · Manutenção de equipamentos · Outros.
   - Entradas [SUPOSIÇÃO]: Serviços (lavagens) · Venda de produtos · Outros.
3a. **Tipos de serviço** [CONFIRMADO, D-03]: lista editável pelo dono, **só com o nome** do serviço (sem preço cadastrado). [CONFIRMADO] Um serviço novo pode ser criado também **direto na tela de lançamento do carro** (botão "+ Novo serviço"), sem sair do lançamento. Iniciais: Lavagem rápida · Lavagem completa · [SUPOSIÇÃO] Polimento · Higienização interna · Cristalização.
3b. **Entrada de serviço carro por carro** [CONFIRMADO, D-03]: o dono **escolhe o tipo de serviço e digita o valor na hora**, escolhe a forma de pagamento e confirma. Cada carro é um lançamento na categoria "Serviços".
3b-1. **Tipo de veículo** [CONFIRMADO]: ao lançar um serviço, o dono escolhe também o **tipo de veículo** (ex.: Carro, Moto, SUV…). É só a categoria do veículo; placa, modelo e cliente continuam fora do escopo (PIF-01, PIF-04).
   - [SUPOSIÇÃO] Lista editável pelo dono, como os tipos de serviço (só o nome), com criação também direto no lançamento ("+ Novo veículo"). Iniciais: Carro · Moto · SUV · [SUPOSIÇÃO] Caminhonete/Picape · Van.
   - [SUPOSIÇÃO] Obrigatório nas entradas de serviço; não se aplica a saídas nem a outras entradas.
   - [SUPOSIÇÃO] O resumo de entradas por tipo de serviço também pode ser visto por tipo de veículo.
3c. **Atalho "repetir último serviço"** [SUPOSIÇÃO], que já traz o tipo de serviço e a forma de pagamento do lançamento anterior, para lançar vários carros em sequência; o valor continua sendo digitado.
4. **Extrato** do dia, da semana e do mês, com filtro por unidade e por categoria. [CONFIRMADO] O filtro de período tem um **calendário** para escolher as datas.
5. **Resumo do período:** total que entrou, total que saiu e saldo, por unidade e consolidado.
6. **Gastos por categoria** em visual simples (ex.: barras ou pizza), para ver onde o dinheiro vai.
6a. **Entradas por tipo de serviço:** quantidade de carros e valor recebido por tipo de serviço, por dia e por mês.
7. **Editar e excluir lançamento**, mantendo registro de quem alterou e quando.
8. **Formas de pagamento** [SUPOSIÇÃO]: dinheiro, Pix, cartão de débito, cartão de crédito.
9. Perfis de acesso por unidade (quem lança, quem vê o quê, quem gerencia categorias).

### 5.2 Diretrizes de experiência ("amigável, sem cara de planilha")

- Linguagem do dia a dia, sem termos contábeis ("Entrou", "Saiu", "Sobrou").
- Botões grandes de **+ Entrada** e **− Saída** sempre visíveis na tela inicial.
- Categoria escolhida por **ícone**, não por lista longa.
- Teclado numérico abre direto no campo de valor.
- Data e unidade já preenchidas (hoje e a unidade atual); só muda se precisar.
- Pessoal/Empresa num dropdown já preenchido com o valor padrão, para não acrescentar um passo a cada lançamento.
- Verde para entrada, vermelho para saída, e o saldo do dia em destaque.

### 5.3 FORA do módulo (agora)

- Agendamento, fila/atendimento, ordem de serviço, clientes e veículos.
- Controle de estoque (arquivado em `modulo-01-estoque/`).
- Emissão de nota fiscal, cálculo de impostos, contabilidade (DRE, balanço).
- Integração automática com banco ou Pix (conciliação bancária, importação de extrato).
- Folha de pagamento completa (encargos, férias, 13º, CLT); o módulo registra apenas o valor pago de mão de obra.
- Contas a pagar e a receber com vencimento futuro (D-01: o módulo registra só o realizado).
- Identificação do veículo ou do cliente no lançamento do serviço (placa, nome): pertence aos módulos de atendimento e clientes (PIF-01, PIF-04).
- Gestão de usuários além do dono (D-02: expansão futura).

## 6. Pontos de integração futura

Registrados apenas como contrato de alto nível, sem especificação detalhada.

| ID | Módulo futuro | Integração |
|---|---|---|
| PIF-01 | Atendimento/fila | Serviço concluído e pago gera automaticamente a entrada carro por carro (hoje lançada à mão pelo dono), já com o tipo de serviço e o veículo; a lista de tipos de serviço criada aqui passa a ser o catálogo de serviços do sistema |
| PIF-02 | Estoque | Entrada de mercadoria (compra de produto) gera uma saída na categoria "Produtos"; custo de insumo por serviço alimenta relatórios de margem |
| PIF-03 | Funcionários / equipe | Pagamentos de mão de obra e reembolsos ligados ao funcionário, com histórico por pessoa |
| PIF-04 | Clientes | Entradas ligadas ao cliente que pagou |
| PIF-05 | Usuários, unidades e permissões | O vínculo usuário × unidade × papel criado aqui passa a ser o cadastro comum do sistema; a expansão para gerentes e funcionários (D-02) usa esse vínculo |
| PIF-06 | Contas a pagar/receber (evolução deste módulo) | Contas com vencimento futuro; o lançamento já reserva um campo de situação (pago/previsto) para isso |

**Regra de preparação:** todo lançamento guarda **unidade**, **usuário**, **origem** (manual, serviço, compra de estoque…) e uma **referência opcional ao registro de origem**, para que os módulos futuros gerem lançamentos sem mudar o modelo.

## 7. Suposições

- [SUPOSIÇÃO] Poucas unidades (2 a 5) e até ~20 usuários no total.
- [SUPOSIÇÃO] Moeda única (real) e valores com centavos.
- [CONFIRMADO] As entradas de serviço são lançadas manualmente, carro por carro, pelo dono (D-02, D-03).
- [CONFIRMADO] Não há tabela de preços: o dono escolhe o tipo de serviço e digita o valor no momento do lançamento.
- [SUPOSIÇÃO] Categorias são comuns a todas as unidades.
- [SUPOSIÇÃO] Orçamento baixo: preferência por ferramentas gratuitas ou de baixo custo.

## 8. Dúvidas abertas para o dono

1. **Reembolso:** é o dinheiro devolvido a um funcionário que pagou algo do próprio bolso, ou devolução a um cliente insatisfeito? Ou os dois?
2. **Mão de obra:** como os lavadores são pagos (diária, semanal, por carro lavado, salário mensal)? Isso muda a forma de lançar.
3. **Passagem e alimentação:** são pagas pelo lava-jato a cada funcionário, por dia? O valor é fixo?
4. **Água:** é a conta mensal, compra de caminhão-pipa, ou os dois?
5. ~~Funcionários vão lançar gastos, ou só o dono e os gerentes?~~ Respondida em D-02: no MVP, só o dono.
5a. Quais são todos os tipos de serviço oferecidos hoje? (O preço não precisa ser cadastrado: é digitado na hora.)
6. Quer anexar **foto do comprovante** (nota, recibo) ao lançamento?
7. Há gastos que se repetem todo mês com o mesmo valor (aluguel, internet), que o app poderia lançar sozinho?
8. Precisa exportar os dados para o contador (planilha ou PDF)?
9. Como o estoque e o dinheiro são controlados hoje (nada, caderno, planilha)?
10. **Pessoal/Empresa:** a interpretação "separar o dinheiro pessoal do dono do dinheiro do lava-jato" está correta?
11. Quando outros usuários entrarem (D-02), quem poderá ver os itens **Pessoais**? No MVP só o dono usa, então a questão fica para a expansão.
12. Um lançamento **Pessoal** pertence a uma unidade, ou fica fora das unidades?
14. ~~**Serviço x veículo (E2-04):** qual é a regra?~~ Respondida: opção a (veículo obrigatório, tipo de serviço opcional).
13. As categorias são as mesmas para Pessoal e Empresa, ou cada um tem a sua lista (ex.: "Água" da empresa e "Mercado" pessoal)?

## 9. Decisões do dono

| ID | Decisão tomada |
|---|---|
| D-01 | **Opção A:** só o que já entrou e já saiu. Contas futuras ficam para evolução (PIF-06). |
| D-02 | **Opção A no MVP:** só o dono usa o app. Expansão futura para outros usuários, já prevista no modelo. |
| D-03 | **Opção B:** entradas de serviço carro por carro, com tipo de serviço (Lavagem rápida, Lavagem completa etc.). |

As tabelas abaixo registram as opções que foram apresentadas.

### D-01 — Só o que já aconteceu, ou também contas futuras? · **DECIDIDO: Opção A**

| | **Opção A — Só o realizado (recomendada para o MVP)** | **Opção B — Realizado + contas a pagar/receber** |
|---|---|---|
| O que registra | Dinheiro que já entrou ou já saiu | Também contas com vencimento futuro (aluguel do mês que vem, fornecedor a prazo) |
| Telas a mais | — | Agenda de vencimentos, marcar como pago, alerta de conta vencendo |
| Simplicidade para o usuário | Máxima: é o "caderno de caixa" | Menor: cada conta tem dois momentos (prevista e paga) |
| Impacto em prazo | Menor | Médio a alto |

**Recomendação do Orquestrador:** Opção A no MVP, com o lançamento já tendo um campo de situação (pago/previsto) reservado no modelo, para as contas futuras entrarem depois sem retrabalho.

### D-02 — Quem pode lançar · **DECIDIDO: só o dono no MVP, expansão futura**

| | **Opção A — Só dono e gerentes** | **Opção B — Funcionários também** |
|---|---|---|
| Quem lança | Dono e gerentes | Todos; o funcionário lança gastos próprios (ex.: pedido de reembolso) |
| Controle | Alto | Exige aprovação do gerente antes de o gasto contar no saldo |
| Escopo | Menor | +1 fluxo (pedido → aprovação → pagamento) |

**Recomendação do Orquestrador:** Opção A no MVP. A Opção B pode entrar como evolução, junto com a resposta da dúvida 1 (reembolso).

### D-03 — Como as entradas dos serviços são lançadas · **DECIDIDO: Opção B (carro por carro)**

| | **Opção A — Total do dia** | **Opção B — Cada serviço** |
|---|---|---|
| O que o gerente faz | Fecha o dia: "entrou R$ 1.250 em Pix, R$ 300 em dinheiro" | Lança cada lavagem paga |
| Tempo | Um lançamento por forma de pagamento por dia | Um lançamento por carro |
| Detalhe | Sem detalhe por serviço | Sabe quais serviços venderam mais |

**Recomendação do Orquestrador:** Opção A no MVP, porque o detalhe por serviço virá automaticamente quando existir o módulo de atendimento (PIF-01).

## 9b. Decisões de detalhe do dono (Etapa 2, 2026-11-03)

| # | Tema | Decisão |
|---|---|---|
| E2-01 | Protótipo | Usar o protótipo em HTML feito pelo Design: https://claude.ai/artifact/45rWcNZWpPyjXfEPiZ2WXC (o arquivo do Figma fica só com os componentes). |
| E2-02 | Categorias | Serviços, Produtos, Mão de obra e Reembolso são as categorias fixas do sistema, e o dono **pode criar novas categorias**. [Interpretação do Orquestrador, a confirmar: as quatro fixas podem ser renomeadas, mas não desativadas.] |
| E2-03 | Tecla apagar | Segurar ⌫ zera o valor. |
| E2-04 | Serviço x veículo | **Opção a (confirmada pelo dono):** numa entrada de serviço (categoria "Serviços"), o **tipo de veículo é obrigatório** e o **tipo de serviço é opcional**. Entradas sem tipo de serviço aparecem como "Sem tipo de serviço" no Resumo e no filtro do Extrato. |
| E2-05 | Veículos e unidades | A lista de **tipos** de veículo é a mesma em todas as unidades. Cada serviço lançado pertence a **uma única unidade** (a unidade onde o carro foi lavado, ex.: o Gol placa 1111-0000 lavado na unidade 1 não aparece na unidade 2) e é **somado no total geral**. A placa não é registrada no MVP. |
| E2-06 | Veículo pré-selecionado | O último veículo usado já vem marcado. |
| E2-07 | Lista inicial de veículos | Carro · Moto · SUV · Caminhonete/Picape · Van. |
| E2-08 | Resumo | Serviço e veículo separados no MVP; cruzamento serviço × veículo fica para depois. |
| E2-09 | Atalho "Semana" | Semana atual, de segunda-feira até hoje. |
| E2-10 | Período | O período escolhido vale junto para Extrato e Resumo. |

## 9c. Decisões finais do dono (consolidação, 2026-11-03)

| # | Tema | Decisão |
|---|---|---|
| F-06 | Categorias fixas (D-BL-03) | **Confirmado:** Serviços, Produtos, Mão de obra e Reembolso podem ser renomeadas (nome, ícone, cor), mas **não podem ser desativadas**. |
| F-12 | Formas de pagamento (D-QA-02) | **Todas ficam disponíveis:** Dinheiro, Pix, Cartão de débito e Cartão de crédito. No primeiro lançamento vem marcado **Pix**; nos seguintes, a última usada. |
| F-13 | Editar pode trocar o tipo (D-QA-05) | **Não.** Para mudar entre saída, entrada e serviço, exclui e lança de novo. |
| F-15 | Quantos celulares (D-RM-04) | **Um celular.** |

## 10. Decisões herdadas do levantamento anterior

- **Tipo de aplicativo e armazenamento (antiga D-03 do estoque):** app de celular com dados locais no aparelho, banco em nuvem Supabase, sincronização automática quando há internet e botão "Sincronizar". Vale para este módulo e para o sistema todo.
- **Multiunidade com papel por unidade:** vale para o sistema todo.
