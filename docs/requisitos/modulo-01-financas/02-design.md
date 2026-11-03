# Módulo 1 — Gestão de Finanças · Design (UX)

Projeto: Lavajato Sistema
Documento: 02-design.md · Autor: Design · Versão: 4 · Status: **rascunho para revisão** (DU-01 a DU-03 e DU-07 a DU-11 respondidas pelo dono; v3 incluiu o **tipo de veículo**; v4 aplica as decisões E2-01 a E2-10 da visão §9b)
Fonte da verdade: `01-visao.md` (versão 3). Em caso de conflito, vale a visão. Modelo de dados e regras técnicas: `03-arquitetura.md`.

> Convenção: **[CONFIRMADO]** veio do dono (via 01-visao.md) · **[SUPOSIÇÃO]** decisão de design ainda não validada · **[DÚVIDA]** precisa de resposta do dono.
>
> Contagem de toques: conta cada toque na tela **fora do teclado numérico**. Os dígitos do valor são contados à parte como "digitar valor". Como a digitação é estilo caixa registradora (§5.4), R$ 45,00 = 4 dígitos (`4` `5` `0` `0`). Abrir o app não é contado.

---

## 1. Personas

### 1.1 Dono — usuário único do MVP [CONFIRMADO]

| Item | Descrição |
|---|---|
| Quem é | Dono do lava-jato, com **mais de uma unidade**. Trabalha no meio da operação: recebe de cliente, paga lavador, compra produto, paga almoço e passagem. |
| Aparelho | Celular próprio, Android ou iPhone [SUPOSIÇÃO], muitas vezes com uma mão só, mãos molhadas ou sujas, sob sol forte. |
| Conexão | Internet instável no pátio; o app precisa funcionar sem internet [CONFIRMADO]. |
| Relação com tecnologia | Usa WhatsApp e app de banco no dia a dia; **não quer planilha** [CONFIRMADO]. Não conhece termos contábeis. |
| Hoje | Controle em caderno, planilha ou nenhum [SUPOSIÇÃO, visão §2]. Gastos se perdem em papel, mensagens e memória. |
| Mistura de dinheiro | Às vezes paga coisas pessoais com o dinheiro do lava-jato (e vice-versa); por isso o campo **Pessoal/Empresa** [CONFIRMADO]. |
| Objetivos | 1) Lançar rápido, sem parar o serviço (≤ 15 s). 2) Saber no fim do dia e do mês **quanto entrou, saiu e sobrou**, por unidade. 3) Saber **onde gasta mais** e **qual serviço vende mais**. |
| Frustrações | Telas cheias, muitos campos, digitar texto, ter que lembrar em que unidade está, perder lançamento por falta de internet. |
| Frequência de uso | Muitas vezes por dia (um lançamento por carro) [CONFIRMADO, D-03]; consulta de saldo no fim do dia; análise mensal. |
| Frase-guia | "Lavou, recebeu, lançou. Gastou, lançou. No fim do dia, quero ver quanto sobrou." |

### 1.2 Gerente — **expansão futura** (D-02)

Gerencia uma ou mais unidades. Lançaria entradas e saídas da(s) sua(s) unidade(s) e veria o saldo do dia e do mês dessas unidades. Fora do MVP: nenhuma tela deste documento é desenhada para ele, mas o seletor de unidade (TELA-01) já considera "usuário com acesso a várias unidades".

### 1.3 Funcionário / lavador — **expansão futura** (D-02)

Possível uso: registrar um gasto pago do próprio bolso para pedir reembolso. Dependeria de fluxo de aprovação (D-02, Opção B). Fora do MVP.

---

## 2. Jornadas do Dono

Premissas comuns a todas as jornadas de lançamento [CONFIRMADO, visão §5.2]:
- **Data** = hoje, **Unidade** = unidade atual, **Pessoal/Empresa** = padrão já vêm preenchidos.
- O padrão Pessoal/Empresa é sempre **Empresa**, trocável em Ajustes (TELA-09) [CONFIRMADO, DU-02]. A preferência é sincronizada entre os aparelhos do dono (`preferencia_usuario` em 03-arquitetura.md).
- O seletor de data **não permite dias depois de hoje** (no fuso da unidade), porque o módulo só registra o que já aconteceu (D-01) [SUPOSIÇÃO, 03-arquitetura §5.2]. Datas passadas são permitidas.
- O teclado numérico abre sozinho no campo de valor, com digitação estilo caixa registradora (§5.4) [CONFIRMADO, DU-03].
- **Forma de pagamento** vem pré-selecionada com a última usada naquele tipo de lançamento [SUPOSIÇÃO]; só toca se for diferente.
- **Tipo de veículo** (só nas entradas de serviço) vem pré-selecionado com o **último veículo usado** num serviço [CONFIRMADO, E2-06]; só toca se for diferente. No primeiro uso, nada vem marcado e o app pede "Escolha o veículo".

### Resumo de toques

| ID | Jornada | Toques (caminho comum) | Atende OBJ-01 (≤ 4 toques)? |
|---|---|---|---|
| JOR-a | Lançar uma saída | 3 + valor | Sim |
| JOR-b | Lançar entrada de serviço (1 veículo) | 2 a 5 + valor (comum: 3 a 4; 2 sem tipo de serviço; +2 + nome se criar serviço ou veículo novo) | Sim no caminho comum; 5 quando muda o veículo **e** a forma de pagamento |
| JOR-c | Vários veículos em sequência | 2 + valor por veículo adicional (3 se mudar o veículo) | Sim |
| JOR-d | Lançar outra entrada (não serviço) | 3 + valor | Sim |
| JOR-e | Ver saldo do dia e do mês | 0 (dia) · 1 (mês) · +1 a 2 por filtro | — |
| JOR-f | Extrato com filtros | 1 para abrir + 2 por filtro (período: 2 com atalho · 3 um dia · 4 intervalo no calendário) | — |
| JOR-g | Gastos por categoria / entradas por serviço | 2 a 3 | — |
| JOR-h | Corrigir ou excluir lançamento | 3 a 5 | — |
| JOR-i | Gerenciar categorias, tipos de serviço e tipos de veículo | 4 a 6 | — |
| JOR-j | Trocar de unidade | 2 | — |
| JOR-k | Usar sem internet e sincronizar | 0 (automático) · 1 (botão Sincronizar) | — |

### JOR-a — Lançar uma saída (gasto)

Cenário: o dono pagou R$ 25 de almoço em dinheiro, na unidade atual.

| Passo | Ação do dono | O que o app faz | Toques |
|---|---|---|---|
| 1 | Toca **− Saiu** na tela inicial (TELA-01) | Abre TELA-03 (Nova saída) com teclado numérico aberto no valor | 1 |
| 2 | Digita `2` `5` `0` `0` | Mostra R$ 0,02 → 0,25 → 2,50 → **R$ 25,00** grande | valor |
| 3 | Toca o ícone **Alimentação** | Destaca a categoria | 1 |
| 4 | (Opcional) Confere forma de pagamento, Pessoal/Empresa, data, unidade, descrição — já preenchidos | — | 0 |
| 5 | Toca **Salvar** | Salva no aparelho, volta à TELA-01, mostra aviso "Saída de R$ 25,00 salva · Desfazer" e atualiza o saldo do dia | 1 |

**Total: 3 toques + valor.** Variações: trocar forma de pagamento (+1), trocar Pessoal/Empresa (+2: abrir dropdown e escolher), data passada (+2 a 3; dias depois de hoje aparecem desabilitados no calendário), descrição (+1 e texto).

Validação: sem valor ou sem categoria, o botão Salvar fica desabilitado e o campo faltante é indicado ("Escolha a categoria").

### JOR-b — Lançar a entrada de um serviço (carro por carro)

Cenário: chegou um SUV, Lavagem completa, cliente pagou R$ 60 no Pix.

Ordem dos campos na TELA-02 [SUPOSIÇÃO]: **Serviço → Veículo → Valor → Pagou com → Salvar**. O serviço vem primeiro porque é a escolha que mais varia (mesmo sendo opcional, E2-04 a): quem quer informar toca logo; quem não quer, passa direto); o veículo vem logo abaixo, numa única fileira de ícones, e quase sempre já está certo (pré-selecionado); o valor fica por último antes de pagar, colado ao teclado que já está aberto.

| Passo | Ação do dono | O que o app faz | Toques |
|---|---|---|---|
| 1 | Toca **+ Carro** na tela inicial | Abre TELA-02 (Novo serviço), categoria "Serviços" já definida, último veículo usado já marcado, teclado numérico aberto | 1 |
| 2 | Toca **Lavagem completa** (botões grandes com os tipos de serviço). **Opcional** [CONFIRMADO, E2-04 a)]: pode pular | Destaca o tipo; tocar de novo no mesmo tipo desmarca [SUPOSIÇÃO] | 0 a 1 |
| 3 | Toca **SUV** na fileira de veículos (se não for o já pré-selecionado) | Destaca o veículo | 0 a 1 |
| 4 | Digita `6` `0` `0` `0` | "R$ 60,00" | valor |
| 5 | Toca **Pix** (se não for a forma já pré-selecionada) | Destaca a forma | 0 a 1 |
| 6 | Toca **Salvar** | Salva, volta à TELA-01, aviso "Lavagem completa · SUV · R$ 60,00 salva · Desfazer · Mais um igual" | 1 |

**Total: 2 a 5 toques + valor** (caminho comum, com serviço escolhido e veículo ou forma iguais ao último: 3 a 4; sem escolher serviço e com veículo e forma já certos: 2). Não existe preço cadastrado: o valor é sempre digitado [CONFIRMADO].

**Regra de obrigatoriedade [CONFIRMADO, E2-04 a)]: veículo obrigatório, tipo de serviço opcional.**
- Para salvar, bastam **veículo** e **valor**. Sem veículo, o Salvar fica desabilitado e a fileira mostra "Escolha o veículo". Como o último veículo já vem marcado (E2-06), isso só acontece no primeiro uso ou se o veículo marcado tiver sido desativado.
- O tipo de serviço pode ficar sem escolha. A grade não mostra aviso nem bloqueia o Salvar; o título da grade passa a "Qual serviço? (opcional)" [SUPOSIÇÃO].
- **Entrada de serviço** = toda entrada da categoria de sistema "Serviços", com ou sem tipo de serviço (visão §9b, E2-04 a)). Sem tipo de serviço, o lançamento continua na categoria "Serviços". No aviso, no extrato e no detalhe ele aparece como **"Serviço · SUV · Pix"** [SUPOSIÇÃO]. No Resumo › Serviços › Por serviço, entra numa linha **"Sem tipo de serviço"**; em Por veículo, conta normalmente [SUPOSIÇÃO].
- "Mais um igual" / "Repetir" (JOR-c) copiam o que o lançamento anterior tinha: se não havia tipo de serviço, o novo também vem sem [SUPOSIÇÃO].

Não há placa, modelo nem nome do cliente (fora do escopo, visão §5.3).

[CONFIRMADO, E2-06] Por que pré-selecionar o último veículo: a maioria dos atendimentos é do mesmo tipo (geralmente Carro), então isso poupa um toque por lançamento. O risco é salvar o veículo errado sem perceber; para reduzir, o veículo marcado fica bem destacado (fundo verde e nome), aparece no aviso pós-salvar e pode ser corrigido pelo Desfazer ou pela edição (JOR-h). As medidas contra o erro são [SUPOSIÇÃO].

**Variação — o serviço não está na lista (criar na hora)** [CONFIRMADO]:

| Passo | Ação do dono | O que o app faz | Toques |
|---|---|---|---|
| 2' | No fim da grade de tipos de serviço, toca **+ Novo serviço** | Abre uma folha pequena com **um único campo: Nome** (teclado de texto) | 1 |
| 3' | Digita "Lavagem de motor" e toca **Salvar serviço** | Cria o tipo de serviço, fecha a folha, volta à TELA-02 com **"Lavagem de motor" já selecionado** e o teclado numérico de volta no valor | 1 + nome |
| 4' | Segue do passo 3 (veículo, valor, forma, Salvar) | — | 1 a 3 + valor |

**Total com serviço novo: 4 a 6 toques + nome + valor.** Sem preço, ícone nem cor: só o nome. Renomear, desativar e reordenar continuam na TELA-11 (JOR-i). Nome repetido de um serviço ativo não é aceito ("Já existe um serviço com esse nome"); nome igual a um serviço desativado oferece "Reativar 'Lavagem de motor'?" [SUPOSIÇÃO].

**Variação — o veículo não está na lista (criar na hora)** [SUPOSIÇÃO, visão 3b-1]:

| Passo | Ação do dono | O que o app faz | Toques |
|---|---|---|---|
| 3'' | No fim da fileira de veículos, toca **+ Novo veículo** | Abre uma folha pequena com **um único campo: Nome** (teclado de texto) | 1 |
| 4'' | Digita "Ônibus" e toca **Salvar veículo** | Cria o tipo de veículo, fecha a folha, volta à TELA-02 com **"Ônibus" já selecionado** e o teclado numérico de volta no valor | 1 + nome |
| 5'' | Segue do passo 4 (valor, forma, Salvar) | — | 1 a 2 + valor |

**Total com veículo novo: 5 a 6 toques + nome + valor.** Só o nome; o veículo novo recebe um ícone genérico [SUPOSIÇÃO]. Mesmas regras de nome repetido e de reativação dos tipos de serviço ("Já existe um veículo com esse nome"; "'Ônibus' está desativado. [Reativar e usar]"). Renomear, desativar e reordenar ficam na TELA-14 (JOR-i).

O botão **+ Carro** é separado de **+ Entrou** (outras entradas) na tela inicial, por ser o lançamento mais frequente do dia [CONFIRMADO, DU-01].

### JOR-c — Vários carros em sequência ("repetir último serviço") [SUPOSIÇÃO, visão 3c]

Cenário: entraram 3 lavagens rápidas seguidas, todas em dinheiro: Carro R$ 30,00, Carro R$ 30,00 e Moto R$ 20,00.

| Passo | Ação do dono | O que o app faz | Toques |
|---|---|---|---|
| 1 | Lança o 1º carro pela JOR-b | — | 3 a 5 + valor |
| 2 | No aviso pós-salvar, toca **Mais um igual** (ou, na TELA-01, o botão **Repetir: Lavagem rápida · Carro · Dinheiro**) | Abre TELA-02 já com **tipo de serviço, tipo de veículo e forma de pagamento** do anterior; **valor vazio** e teclado aberto | 1 |
| 3 | Digita `3` `0` `0` `0` | — | valor |
| 4 | Toca **Salvar** | Salva e oferece de novo "Mais um igual" | 1 |
| 5 | Para o 3º (uma moto): toca **Mais um igual**, toca **Moto**, digita `2` `0` `0` `0` e Salvar | O veículo trocado passa a ser o "último usado" | 3 + valor |

**Total por veículo adicional: 2 toques + valor** (3 se o veículo for diferente do anterior). O valor nunca é copiado, para evitar lançar errado sem perceber [CONFIRMADO: "o valor continua sendo digitado"]. O tipo de veículo é copiado [SUPOSIÇÃO, pedido do Orquestrador], porque carros em sequência costumam ser do mesmo tipo e o veículo aparece no aviso para conferência.

O botão "Repetir" na TELA-01 mostra o último serviço lançado **hoje, na unidade atual**; se não houver, não aparece [SUPOSIÇÃO].

### JOR-d — Lançar outra entrada (não serviço)

Cenário: vendeu um aromatizante por R$ 15 em dinheiro.

| Passo | Ação do dono | O que o app faz | Toques |
|---|---|---|---|
| 1 | Toca **+ Entrou** na TELA-01 | Abre TELA-04 (Nova entrada) com teclado aberto; ícones das categorias de entrada (Venda de produtos, Outros…), **sem** "Serviços" (que tem fluxo próprio) [SUPOSIÇÃO] | 1 |
| 2 | Digita `1` `5` `0` `0` | R$ 15,00 | valor |
| 3 | Toca **Venda de produtos** | — | 1 |
| 4 | Toca **Salvar** | Salva, volta, aviso com Desfazer | 1 |

**Total: 3 toques + valor.** Categorias de entrada ainda são [SUPOSIÇÃO] (visão §5.1 item 3).

### JOR-e — Ver o saldo do dia e do mês

| Passo | Ação do dono | O que o app faz | Toques |
|---|---|---|---|
| 1 | Abre o app | TELA-01 mostra **Hoje**: Entrou / Saiu / Sobrou da unidade atual e filtro Pessoal/Empresa no padrão | 0 |
| 2 | Toca a aba **Mês** no cartão de saldo | Mesmo cartão com valores do mês corrente | 1 |
| 3 | Para ver **todas as unidades**: toca o seletor de unidade e escolhe **Todas as unidades** | Cartão mostra o consolidado; abaixo, uma linha por unidade com o seu "Sobrou" | 2 |
| 4 | Para filtrar: toca o seletor **Empresa · Pessoal · Tudo** | Recalcula os números | 1 |

**Total: 0 a 4 toques.** Quando o filtro é "Tudo", o cartão mostra o saldo da empresa e o pessoal separados, além do total [CONFIRMADO, visão 2a: "o saldo da empresa é mostrado separado do pessoal"].

[SUPOSIÇÃO] Para os períodos "semana" e meses anteriores, o caminho é o Extrato/Resumo (TELA-05 e TELA-06); a tela inicial mostra só Hoje e Mês para não poluir.

### JOR-f — Consultar o extrato e filtrar

| Passo | Ação do dono | O que o app faz | Toques |
|---|---|---|---|
| 1 | Toca **Extrato** na barra inferior | TELA-05: lista de hoje, agrupada por dia, mais recente em cima; topo com Entrou/Saiu/Sobrou do filtro atual | 1 |
| 2 | Toca o chip **Período** → abre a folha de período (§4.4): atalhos **Hoje / Semana / Mês / Mês passado** em cima e o **calendário** embaixo [CONFIRMADO, visão item 4] | Atalho: aplica na hora e fecha [SUPOSIÇÃO] | 2 |
| 2a | **Um dia só:** toca o dia no calendário e **Aplicar** | Chip mostra "29/10"; lista e totais só daquele dia | 3 |
| 2b | **Intervalo:** toca o dia inicial, o dia final e **Aplicar** | Intervalo destacado; chip mostra "27/10 a 02/11" | 4 (+1 por mês navegado com ‹ ›) |
| 3 | Toca o chip **Unidade** → escolhe uma ou Todas | — | 2 |
| 4 | Toca o chip **Categoria** → marca uma ou mais | — | 2+ |
| 4a | Toca o chip **Serviço** → escolhe um tipo de serviço ou **"Sem tipo de serviço"** (último item da lista) [SUPOSIÇÃO, E2-04 a)] | Mostra só as entradas de serviço daquele tipo, ou as que foram lançadas sem tipo; o chip mostra o nome escolhido | 2 |
| 4b | Toca o chip **Veículo** → marca um ou mais tipos (Carro, Moto, SUV…) [SUPOSIÇÃO] | Mostra só as entradas de serviço desses veículos; saídas e outras entradas somem da lista e dos totais, e o chip Categoria passa a "Serviços" | 2+ |
| 5 | Toca o chip **Empresa/Pessoal/Tudo** | — | 1 a 2 |
| 6 | Toca um lançamento | Abre TELA-07 (Detalhe) | 1 |

Cada item de serviço no extrato mostra o veículo: "Lavagem completa · SUV · Pix" [SUPOSIÇÃO, visão 3b-1].

**Calendário do filtro de período** (o mesmo no Extrato e no Resumo):
- [CONFIRMADO] Existe um calendário para escolher as datas (visão §5.1 item 4).
- [SUPOSIÇÃO] Abre em **folha inferior**, já no **mês atual**, com setas **‹ ›** para os meses anteriores. A seta **›** some no mês atual, porque não há meses futuros.
- [CONFIRMADO, E2-09] O atalho **Semana** é a semana atual, **de segunda-feira até hoje**; no calendário, a semana também começa na segunda (alinhado a 03-arquitetura). [SUPOSIÇÃO] Hoje tem um contorno; "Mês" vai do dia 1 até hoje.
- [CONFIRMADO, E2-10] O período escolhido **vale junto para Extrato e Resumo**: trocar numa tela troca na outra, e tocar uma barra do Resumo abre o Extrato no mesmo período.
- [SUPOSIÇÃO] **Um toque** num dia marca só aquele dia. Um **segundo toque** em outro dia fecha o intervalo, que fica destacado do início ao fim (pontas cheias, meio em verde claro). Se o segundo dia for anterior ao primeiro, o app inverte sozinho. Um **terceiro toque** recomeça a escolha. O intervalo pode passar de um mês para outro.
- [SUPOSIÇÃO] **Dias depois de hoje** aparecem apagados e não respondem ao toque, porque o módulo só registra o realizado (D-01). O mesmo vale para o calendário dos formulários (§5.6 "Data futura").
- [SUPOSIÇÃO] Abaixo do calendário, uma linha confirma a escolha ("De 27/10 a 02/11 · 7 dias"); o botão **Aplicar** fica desabilitado até haver pelo menos um dia marcado. Fechar (✕ ou arrastar para baixo) não muda o filtro.
- [SUPOSIÇÃO] Ao reabrir, o calendário mostra o período em uso já marcado.
- [SUPOSIÇÃO] Texto do chip: atalhos pelo nome ("Hoje", "Semana", "Mês", "Mês passado"); um dia "29/10"; intervalo "27/10 a 02/11"; intervalo que pega outro ano com o ano: "15/12/25 a 10/01/26".

Filtros ativos aparecem como chips preenchidos com "×" para limpar; botão "Limpar filtros" quando houver algum. [SUPOSIÇÃO] Os filtros do extrato são lembrados enquanto o app estiver aberto e voltam ao padrão (Hoje, unidade atual) ao reabrir; o período é compartilhado com o Resumo [CONFIRMADO, E2-10].

### JOR-g — Gastos por categoria e entradas por tipo de serviço

| Passo | Ação do dono | O que o app faz | Toques |
|---|---|---|---|
| 1 | Toca **Resumo** na barra inferior | TELA-06, aba **Gastos** aberta, período = mês atual, unidade atual | 1 |
| 2 | Vê barras horizontais por categoria, da maior para a menor, com valor e % | — | 0 |
| 3 | Toca a aba **Serviços** | Lista por tipo de serviço: **quantidade de veículos** e **valor recebido**, com opção Dia/Mês [CONFIRMADO, visão 6a]. Quando houver entradas de serviço sem tipo no período, aparece a linha **"Sem tipo de serviço"**, ordenada pelo valor como as demais [SUPOSIÇÃO, E2-04 a)]. Tocar uma linha abre o Extrato filtrado por aquele tipo (ou por "Sem tipo de serviço") e período [SUPOSIÇÃO] | 1 |
| 3b | Toca o seletor **Por serviço · Por veículo** no topo da aba [CONFIRMADO, E2-08: separados no MVP; o seletor é SUPOSIÇÃO] | Mesma lista agrupada por tipo de veículo (Carro, Moto, SUV…): quantidade e valor. Tocar uma linha abre o Extrato filtrado por aquele veículo e período | 1 |
| 4 | (Opcional) Muda período, unidade ou Pessoal/Empresa pelos mesmos chips da TELA-05; o chip Período abre o mesmo calendário (§4.4) | — | 1 a 2 cada (período: 2 a 4) |
| 5 | Toca uma barra/categoria | Abre o Extrato já filtrado por aquela categoria e período | 1 |

**Total: 2 a 3 toques** (4 para ver por veículo). [CONFIRMADO, E2-08] O cruzamento serviço × veículo (ex.: "Lavagem completa em SUV") fica fora do MVP (§7); até lá, dá para obter pelo Extrato filtrando categoria e veículo. [SUPOSIÇÃO] Barras horizontais em vez de pizza: leem melhor no celular e cabem nomes longos.

### JOR-h — Corrigir ou excluir um lançamento errado

| Passo | Ação do dono | O que o app faz | Toques |
|---|---|---|---|
| 0 | **Logo após salvar:** toca **Desfazer** no aviso (fica ~5 s) | Remove o lançamento | 1 |
| 1 | Caso contrário: na TELA-01 (últimos lançamentos) ou na TELA-05, toca o lançamento | Abre TELA-07 (Detalhe) | 1 |
| 2a | **Corrigir:** toca **Editar** | Abre o mesmo formulário do lançamento (TELA-02/03/04) preenchido | 1 |
| 3a | Altera o campo e toca **Salvar alterações** | Salva, registra quem alterou e quando [CONFIRMADO, visão item 7]; mostra "Alterado" no detalhe. Na edição, a data também não pode ir para depois de hoje [SUPOSIÇÃO, 03-arquitetura §5.2] | 1 + edição |
| 2b | **Excluir:** toca **Excluir** | Pergunta "Excluir esta saída de R$ 25,00 (Alimentação, hoje)? Não dá para desfazer depois." | 1 |
| 3b | Toca **Excluir** na confirmação | Remove, volta à lista, aviso "Lançamento excluído" | 1 |

**Total: 3 a 4 toques** (+ edição). No detalhe aparece "Criado por Dono em 03/11 14:32 · Alterado em 03/11 15:10".

[SUPOSIÇÃO] A exclusão é "lógica" (o registro fica guardado com a marca de excluído) para manter o histórico; isso é decisão da Arquitetura. Ver DU-04 sobre exibir esse histórico ao dono.

### JOR-i — Gerenciar categorias, tipos de serviço e tipos de veículo

| Passo | Ação do dono | O que o app faz | Toques |
|---|---|---|---|
| 1 | Toca **Mais** na barra inferior | TELA-09 (Mais/Ajustes) | 1 |
| 2 | Toca **Categorias**, **Tipos de serviço** ou **Tipos de veículo** | TELA-10 com abas "Saídas" / "Entradas", TELA-11 ou TELA-14 | 1 |
| 3a | **Criar:** toca **+ Nova**, digita o nome, escolhe ícone e cor (categoria) e toca Salvar | Aparece na grade de ícones dos lançamentos | 3 a 4 + texto |
| 3b | **Renomear:** toca o item, edita o nome, Salvar | Lançamentos antigos passam a mostrar o novo nome [SUPOSIÇÃO] | 2 + texto |
| 3c | **Desativar:** toca o item e liga/desliga **Ativa** | Some da grade de lançamento, mas continua nos relatórios e no extrato antigo | 2 |
| 3d | **Reordenar:** arrasta o item | A ordem define a posição na grade (mais usadas primeiro) | 1 gesto |

**Total: 4 a 6 toques.** [SUPOSIÇÃO] Não existe "excluir" categoria/tipo usado em lançamentos; só desativar. Tipos de serviço têm **só nome** (sem preço) [CONFIRMADO]. Tipos de veículo também têm **só nome** [SUPOSIÇÃO, visão 3b-1]; o ícone vem pronto nos iniciais (Carro, Moto, SUV, Caminhonete/Picape, Van [CONFIRMADO, E2-07]; lista igual em todas as unidades [CONFIRMADO, E2-05]) e é genérico nos criados pelo dono.

- **Tipos de veículo (TELA-14)** [SUPOSIÇÃO]: mesmo padrão da TELA-11 (criar, renomear, desativar, reordenar). A ordem define a posição na fileira de veículos da TELA-02. Desativar um veículo o tira da fileira, mas ele continua no extrato e no resumo antigos. Se o veículo desativado era o "último usado", a TELA-02 abre sem veículo marcado.
- **Atalho para criar tipo de serviço:** o caminho mais rápido é o botão **+ Novo serviço** dentro da TELA-02, no meio do lançamento (JOR-b, variação). A TELA-11 continua sendo o lugar para **criar, renomear, desativar e reordenar** [CONFIRMADO]. Do mesmo jeito, o **+ Novo veículo** da TELA-02 é o atalho, e a TELA-14 é o lugar de gerenciar [SUPOSIÇÃO].
- **Categorias de sistema** — são **quatro**: **Serviços, Produtos, Mão de obra e Reembolso** [CONFIRMADO, E2-02; 03-arquitetura `categoria.sistema`]. O dono **pode criar categorias novas** [CONFIRMADO, E2-02]. As quatro fixas **podem** ser renomeadas e ter ícone e cor trocados, mas **não podem** ser desativadas [SUPOSIÇÃO: interpretação do Orquestrador, a confirmar com o dono], porque os lançamentos e os módulos futuros apontam para elas pelo identificador. Na TELA-10, a chave **Ativa** dessas categorias aparece ligada e travada, com um cadeado e o texto curto: "Categoria usada pelo sistema. Pode mudar o nome, mas não pode ser desativada."

### JOR-j — Trocar de unidade

| Passo | Ação do dono | O que o app faz | Toques |
|---|---|---|---|
| 1 | Toca o nome da unidade no topo da TELA-01 ("📍 Unidade Centro ▾") | Abre TELA-08 (seletor em folha inferior): lista de unidades + "Todas as unidades" | 1 |
| 2 | Toca **Unidade Bairro** | Fecha, troca saldo, lista e os novos lançamentos passam a usar essa unidade; o topo muda de cor/nome para deixar claro | 1 |

**Total: 2 toques.** A unidade escolhida fica salva até o dono trocar de novo [SUPOSIÇÃO].

Regra de segurança: com "Todas as unidades" selecionado, ao tocar **+ Carro / + Entrou / − Saiu**, o formulário pede para escolher a unidade (fica no topo, destacado, sem valor padrão) [SUPOSIÇÃO] — para nunca lançar na unidade errada sem querer. Dentro de qualquer formulário, a unidade pode ser trocada pelo campo "Unidade" (+2 toques).

### JOR-k — Usar sem internet e sincronizar [CONFIRMADO, visão §1 e §10]

O que o dono vê:

| Situação | O que aparece | Onde |
|---|---|---|
| Tudo sincronizado | Ícone de nuvem com ✓ e "Tudo salvo na nuvem · 14:32" | Topo da TELA-01 e TELA-09 |
| Sem internet | Faixa discreta "Sem internet. Seus lançamentos estão salvos no celular." O app funciona normalmente | Topo da TELA-01 |
| Lançamentos pendentes | Ícone de nuvem com número: "3 para enviar" | Topo da TELA-01; cada lançamento pendente tem um pequeno ícone de relógio no extrato |
| Sincronizando | "Enviando 3 lançamentos…" com indicador de progresso | Topo da TELA-01 |
| Sucesso | Aviso rápido "Tudo enviado ✓" (some sozinho) | Aviso inferior |
| Erro | Faixa amarela "Não consegui enviar 3 lançamentos. Eles estão seguros no celular. [Tentar de novo]" | Topo da TELA-01 e TELA-12 |

| Passo | Ação do dono | O que o app faz | Toques |
|---|---|---|---|
| 1 | Lança normalmente sem internet | Salva no aparelho; contador de pendentes sobe | 0 a mais |
| 2 | Volta a ter internet | Envia sozinho; mostra "Tudo enviado ✓" | 0 |
| 3 | (Opcional) Toca o ícone da nuvem | Abre TELA-12 (Sincronização): última sincronização, pendentes, erros e botão **Sincronizar agora** | 1 |
| 4 | Toca **Sincronizar agora** | Tenta enviar e receber; mostra resultado | 1 |

[SUPOSIÇÃO] Mensagens de erro nunca usam termos técnicos ("timeout", "409"). Conflitos (o mesmo lançamento alterado em dois aparelhos) não devem ocorrer no MVP com um só usuário, mas a regra de resolução é da Arquitetura (`03-arquitetura.md`).

---

## 3. Telas

Navegação [SUPOSIÇÃO]: barra inferior com 4 itens — **Início · Extrato · Resumo · Mais**. Os três botões de lançamento ficam fixos na parte de baixo da TELA-01, logo acima da barra.

| ID | Nome | Objetivo | Elementos-chave | Jornadas |
|---|---|---|---|---|
| TELA-01 | Início | Lançar em 1 toque e ver o saldo de hoje/mês | Seletor de unidade; status de sincronização; cartão Entrou/Saiu/Sobrou com abas Hoje/Mês e filtro Empresa/Pessoal/Tudo; atalho "Repetir último serviço" (serviço · veículo · forma); últimos 5 lançamentos (serviços mostram o veículo); botões grandes **+ Carro**, **+ Entrou**, **− Saiu**; barra inferior | a, b, c, d, e, h, j, k |
| TELA-02 | Novo serviço (carro) | Lançar a entrada de um veículo em ≤ 4 toques (caminho comum) | **Obrigatórios: veículo e valor; tipo de serviço opcional** [CONFIRMADO, E2-04 a)]. Grade de tipos de serviço "Qual serviço? (opcional)" (botões grandes; tocar de novo desmarca) terminando no botão **+ Novo serviço** (abre folha só com o campo Nome; ao salvar, o serviço novo fica selecionado); **fileira de tipos de veículo** com ícones (Carro, Moto, SUV, Caminhonete/Picape, Van) terminando em **+ Novo veículo** (folha só com o Nome; ao salvar, fica selecionado), último veículo usado pré-selecionado [CONFIRMADO, E2-06], obrigatório [CONFIRMADO, E2-04 a)]; valor com teclado numérico aberto (caixa registradora); forma de pagamento (4 botões); Pessoal/Empresa (dropdown, padrão Empresa); data (hoje; sem dias futuros) e unidade preenchidas; descrição opcional recolhida; Salvar | b, c, h, i |
| TELA-03 | Nova saída | Lançar um gasto em ≤ 3 toques | Valor com teclado aberto (caixa registradora); grade de ícones de categorias de saída; forma de pagamento; Pessoal/Empresa (padrão Empresa); data (sem dias futuros); unidade; descrição opcional; Salvar | a, h |
| TELA-04 | Nova entrada (outras) | Lançar entrada que não é serviço | Igual à TELA-03, com categorias de entrada e cor verde; data sem dias futuros | d, h |
| TELA-05 | Extrato | Ver e filtrar todos os lançamentos | Totais do filtro (Entrou/Saiu/Sobrou); chip **Período** (folha com atalhos Hoje/Semana/Mês/Mês passado + **calendário** de um dia ou intervalo, dias futuros desabilitados, Aplicar; o chip mostra o período, ex.: "27/10 a 02/11") [CONFIRMADO: calendário; detalhes SUPOSIÇÃO]; chips Unidade, Categoria, **Serviço** (tipos de serviço + opção **"Sem tipo de serviço"**) [SUPOSIÇÃO, E2-04 a)], **Veículo** [SUPOSIÇÃO], Empresa/Pessoal; lista agrupada por dia, com ícone, categoria/serviço, **tipo de veículo** (nos serviços), unidade, forma, valor colorido, marca de pendente | f, h, k |
| TELA-06 | Resumo | Ver onde o dinheiro vai e o que vende mais | Abas **Gastos** (barras por categoria, valor e %) e **Serviços** (quantidade e valor, Dia/Mês, com seletor **Por serviço · Por veículo**: separados no MVP [CONFIRMADO, E2-08]; em Por serviço, linha **"Sem tipo de serviço"** quando houver entradas de serviço sem tipo [SUPOSIÇÃO, E2-04 a)]); chips de filtro iguais aos do Extrato, inclusive o **calendário** no chip Período, com o **mesmo período do Extrato** [CONFIRMADO, E2-10] (o Dia/Mês da aba Serviços usa os atalhos Hoje e Mês do mesmo chip [SUPOSIÇÃO]); "Por unidade" quando "Todas" | e, g |
| TELA-07 | Detalhe do lançamento | Conferir, corrigir ou excluir | Todos os campos (nos serviços, inclui o tipo de veículo); "Criado por / Alterado em"; situação de sincronização; botões Editar e Excluir | h |
| TELA-08 | Seletor de unidade (folha inferior) | Trocar a unidade ativa | Lista de unidades com marca na atual; "Todas as unidades" | e, f, j |
| TELA-09 | Mais / Ajustes | Acesso às configurações | Categorias; Tipos de serviço; **Tipos de veículo** (TELA-14) [SUPOSIÇÃO]; Formas de pagamento [SUPOSIÇÃO]; **Padrão Pessoal/Empresa** (Empresa, trocável; vale em todos os aparelhos) [CONFIRMADO]; Sincronização; Unidades [DÚVIDA DU-05]; Sobre/Sair | i, k |
| TELA-10 | Categorias | Criar, renomear, desativar, reordenar categorias | Abas Saídas/Entradas; lista com ícone e cor; chave Ativa; + Nova; editor (nome, ícone, cor). O dono pode criar categorias novas [CONFIRMADO, E2-02]. As **4 categorias de sistema** (Serviços, Produtos, Mão de obra, Reembolso) [CONFIRMADO, E2-02] com chave Ativa **travada** (cadeado) e explicação curta; nome, ícone e cor editáveis [SUPOSIÇÃO: renomear sim, desativar não, a confirmar] | i |
| TELA-11 | Tipos de serviço | Criar, renomear, desativar, reordenar serviços | Lista só com nomes; chave Ativo; + Novo. Serviços criados pelo atalho da TELA-02 aparecem aqui normalmente | i |
| TELA-12 | Sincronização | Ver o estado da nuvem e forçar envio | Última sincronização; pendentes; erros em linguagem simples; botão **Sincronizar agora** | k |
| TELA-13 | Entrar | Acesso do dono à conta (necessário para a nuvem) | Login simples; "manter conectado" [SUPOSIÇÃO: método de login definido pela Arquitetura] | — (primeiro uso) |
| TELA-14 | Tipos de veículo | Criar, renomear, desativar, reordenar tipos de veículo [SUPOSIÇÃO, visão 3b-1] | Mesmo padrão da TELA-11: lista com ícone e nome; chave Ativo; arrastar para reordenar (define a ordem da fileira na TELA-02); + Novo (só nome, ícone genérico). Iniciais: Carro, Moto, SUV, Caminhonete/Picape, Van [CONFIRMADO, E2-07]; mesma lista em todas as unidades [CONFIRMADO, E2-05]. Veículos criados pelo atalho da TELA-02 aparecem aqui normalmente. Acesso por Mais / Ajustes (TELA-09) | i |

---

## 4. Wireframes (celular, ~360 px de largura)

As 3 telas mais usadas: TELA-01 (Início), TELA-02 (Novo serviço) e TELA-03 (Nova saída), mais a folha de período com calendário (Extrato e Resumo).

### 4.1 TELA-01 — Início

```
┌──────────────────────────────────────┐
│ 📍 Unidade Centro ▾        ☁ ✓ 14:32 │
├──────────────────────────────────────┤
│  [ Hoje ]  Mês        Empresa ▾      │
│ ┌──────────────────────────────────┐ │
│ │  Entrou            R$ 1.240,00 ▲ │ │  (verde)
│ │  Saiu                R$ 310,00 ▼ │ │  (vermelho)
│ │  ──────────────────────────────  │ │
│ │  SOBROU            R$   930,00   │ │  (grande, negrito)
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ↻ Repetir: L. rápida · Carro·Pix │ │
│ └──────────────────────────────────┘ │
│                                      │
│  Últimos lançamentos       Ver tudo › │
│  🚙 L. completa · SUV · Pix  +60,00  │
│  🚗 L. rápida · Carro · Din. +30,00  │
│  🍽 Alimentação · Dinh.      −25,00  │
│  👷 Mão de obra · Pix       −120,00  │
│  🏍 L. rápida · Moto · Pix   +20,00  │
│                                      │
│ ┌──────────┐┌──────────┐┌──────────┐ │
│ │    🚗    ││    +     ││    −     │ │
│ │ + Carro  ││ + Entrou ││ − Saiu   │ │
│ └──────────┘└──────────┘└──────────┘ │
│   (verde)     (verde)    (vermelho)  │
├──────────────────────────────────────┤
│  🏠 Início  📄 Extrato  📊 Resumo  ☰ Mais │
└──────────────────────────────────────┘
```

Notas: botões de lançamento com ~72 px de altura, na zona do polegar. Com "Todas as unidades", o cartão mostra o consolidado e uma linha "Sobrou" por unidade abaixo dele. Com filtro "Tudo", o cartão ganha as linhas "Empresa: R$ …" e "Pessoal: R$ …".

### 4.2 TELA-02 — Novo serviço (carro)

```
┌──────────────────────────────────────┐
│ ✕  Novo serviço       📍 Centro ▾    │
├──────────────────────────────────────┤
│  Qual serviço? (opcional)            │
│ ┌────────────────┐┌────────────────┐ │
│ │ Lavagem rápida ││[Lavagem compl.]│ │  (selecionado)
│ └────────────────┘└────────────────┘ │
│ ┌────────────────┐┌────────────────┐ │
│ │   Polimento    ││ Higienização   │ │
│ └────────────────┘└────────────────┘ │
│ ┌────────────────┐┌ ─ ─ ─ ─ ─ ─ ─ ─┐ │
│ │ Cristalização  ││ + Novo serviço │ │  (tracejado)
│ └────────────────┘└ ─ ─ ─ ─ ─ ─ ─ ─┘ │
│                                      │
│  Qual veículo?                       │
│ ┌────┐┌────┐┌────┐┌────┐┌────┐┌ ─ ─┐ │
│ │ 🚗 ││ 🏍 ││[🚙]││ 🛻 ││ 🚐 ││ +  │ │  (SUV selecionado)
│ │Carr││Moto││SUV ││Pic.││Van ││Novo│ │  (nomes cortados só no rascunho)
│ └────┘└────┘└────┘└────┘└────┘└ ─ ─┘ │
│                                      │
│  Valor                               │
│          R$  60,00▌                  │  (grande, verde)
│                                      │
│  Pagou com                           │
│ [ Pix ] Dinheiro  Débito  Crédito    │
│                                      │
│  Empresa ▾      Hoje, 03/11 ▾        │
│  + Observação                        │
│ ┌──────────────────────────────────┐ │
│ │            SALVAR                │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│   1      2      3                    │
│   4      5      6                    │
│   7      8      9                    │
│          0      ⌫                    │
└──────────────────────────────────────┘
```

Estado "+ Novo serviço" aberto (folha inferior sobre a TELA-02):

```
┌──────────────────────────────────────┐
│ ░░░░░░░ (TELA-02 escurecida) ░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├──────────────────────────────────────┤
│  ───                                 │
│  Novo serviço                     ✕  │
│                                      │
│  Nome                                │
│ ┌──────────────────────────────────┐ │
│ │ Lavagem de motor▌                │ │
│ └──────────────────────────────────┘ │
│  O valor você digita na hora, como   │
│  nos outros serviços.                │
│ ┌──────────────────────────────────┐ │
│ │         SALVAR SERVIÇO           │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│        (teclado de texto)            │
└──────────────────────────────────────┘
```

Ao salvar, a folha fecha, "Lavagem de motor" entra na grade (antes do "+ Novo serviço") **já selecionado**, e o foco volta ao valor.

Estado "+ Novo veículo" aberto: mesma folha inferior, com o título **Novo veículo**, um único campo **Nome** (ex.: "Ônibus") e o botão **SALVAR VEÍCULO**, sem o texto sobre o valor. Ao salvar, a folha fecha, o veículo novo entra na fileira (antes do "+ Novo") **já selecionado**, com ícone genérico, e o foco volta ao valor [SUPOSIÇÃO].

Notas: o teclado numérico do sistema abre já focado no valor; o botão Salvar fica **acima** do teclado para não precisar fechá-lo. Valor digitado como caixa registradora: `6` `0` `0` `0` = R$ 60,00 [CONFIRMADO, DU-03]. Com mais de 6 tipos, a grade rola ou mostra "Ver mais"; o "+ Novo serviço" fica sempre no fim.

Fileira de veículos [SUPOSIÇÃO]: uma linha só, com botões de ícone + nome curto de ~52 × 64 dp (acima do mínimo de 48 dp), para não empurrar o valor e o Salvar para fora da tela. Os 5 iniciais + "+ Novo" cabem em 360 px; com mais veículos, a fileira rola para o lado e o "+ Novo" fica sempre no fim. O veículo marcado tem fundo verde, borda e nome em negrito (não só a cor). Sem veículo marcado, a fileira mostra "Escolha o veículo" e o Salvar fica desabilitado.

### 4.3 TELA-03 — Nova saída

```
┌──────────────────────────────────────┐
│ ✕  Nova saída         📍 Centro ▾    │
├──────────────────────────────────────┤
│  Valor                               │
│          R$  25,00▌                  │  (grande, vermelho)
│                                      │
│  Com o quê?                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │  👷  │ │  ↩   │ │  🧴  │ │ [🍽] │ │
│  │ Mão  │ │Reemb.│ │Produ-│ │Alim. │ │
│  │de obr│ │      │ │ tos  │ │      │ │
│  └──────┘ └──────┘ └──────┘ └──────┘ │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │  🚌  │ │  💧  │ │  ⚡  │ │  •••  │ │
│  │Passa-│ │ Água │ │Ener- │ │Outros│ │
│  │ gem  │ │      │ │ gia  │ │      │ │
│  └──────┘ └──────┘ └──────┘ └──────┘ │
│                                      │
│  Pagou com                           │
│ [Dinheiro] Pix  Débito  Crédito      │
│  Empresa ▾      Hoje, 03/11 ▾        │
│  + Observação                        │
│ ┌──────────────────────────────────┐ │
│ │            SALVAR                │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│        (teclado numérico)            │
└──────────────────────────────────────┘
```

Notas: o valor vem primeiro (o dono geralmente sabe quanto pagou antes de pensar na categoria). As 7 primeiras categorias ativas aparecem na grade; "Outros/•••" abre a lista completa. A TELA-04 (Nova entrada) segue este mesmo layout, em verde, com as categorias de entrada.

### 4.4 Folha de período com calendário (TELA-05 e TELA-06)

Exemplo: hoje é terça, 03/11; o dono marcou de 01/11 a 03/11. `[n]` = ponta do intervalo, `=n=` = dia no meio do intervalo, `(n)` = hoje, `·n` = dia futuro desabilitado.

```
┌──────────────────────────────────────┐
│ ░░░░░░ (Extrato escurecido) ░░░░░░░░ │
├──────────────────────────────────────┤
│  ───                                 │
│  Período                          ✕  │
│ [ Hoje ] [Semana] [ Mês ] [Mês pass.]│
│                                      │
│   ‹       Novembro 2026              │  (sem › no mês atual)
│  Seg  Ter  Qua  Qui  Sex  Sáb  Dom   │
│                                [1]   │
│  =2=  [3]  ·4   ·5   ·6   ·7   ·8    │  (3 = hoje e fim)
│  ·9   ·10  ·11  ·12  ·13  ·14  ·15   │
│  ·16  ·17  ·18  ·19  ·20  ·21  ·22   │
│  ·23  ·24  ·25  ·26  ·27  ·28  ·29   │
│  ·30                                 │
│                                      │
│  De 01/11 a 03/11 · 3 dias           │
│ ┌──────────────────────────────────┐ │
│ │             APLICAR              │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

Notas [SUPOSIÇÃO]: cada dia tem área de toque de pelo menos 44 × 44 dp (7 colunas em 360 px); quando hoje não está marcado, aparece como `(3)`, com contorno. Os atalhos aplicam e fecham na hora; o calendário precisa de **Aplicar**. Depois de aplicar, o chip do Extrato mostra "01/11 a 03/11 ×".

---

## 5. Diretrizes de interface

### 5.1 Linguagem

| Use | Evite |
|---|---|
| Entrou · Saiu · Sobrou | Receita · Despesa · Saldo líquido · Débito/Crédito contábil |
| Carro · Serviço · Veículo (Carro, Moto, SUV…) | Ordem de serviço · Item de venda · Categoria veicular |
| Pagou com | Forma de pagamento / meio de liquidação |
| Salvar · Excluir · Desfazer | Confirmar operação · Persistir · Remover registro |
| "Sem internet. Está tudo salvo no celular." | "Erro de rede" · "Offline mode" |

- Frases curtas, verbos no imperativo ("Escolha a categoria"), tratamento "você".
- Valores sempre no formato brasileiro: `R$ 1.240,00`. Datas: "Hoje", "Ontem", depois `03/11`.
- Nada de inglês na interface.

### 5.2 Cores

| Uso | Cor | Observação |
|---|---|---|
| Entrada (Entrou, + Carro, + Entrou) | Verde | [CONFIRMADO] |
| Saída (Saiu, − Saiu) | Vermelho | [CONFIRMADO] |
| Sobrou positivo / negativo | Texto escuro / vermelho | Negativo também ganha sinal "−" |
| Pendente de sincronizar | Cinza com ícone de relógio | |
| Aviso / erro de sincronização | Amarelo/âmbar | Não usar vermelho para não confundir com "Saiu" |
| Pessoal | Rótulo roxo discreto ("Pessoal") na linha do extrato [SUPOSIÇÃO] | Lançamentos Empresa não ganham rótulo (é o padrão) |

- Cor nunca é o único sinal: sempre acompanhar com "+"/"−", ícone ou texto (daltonismo e sol forte).
- Contraste mínimo 4,5:1 (WCAG AA); testar em tela com brilho alto ao ar livre.
- Cada categoria tem ícone + cor própria, usados na grade, no extrato e no gráfico.

### 5.3 Tamanhos de toque e layout

- Área mínima de toque: **48 × 48 dp**; botões de lançamento e de tipo de serviço: **≥ 64 dp** de altura.
- Ações principais (lançar, Salvar) na **metade de baixo da tela**, ao alcance do polegar.
- Espaço de pelo menos 8 dp entre alvos tocáveis (mão molhada, luva).
- Fonte mínima 16 sp no corpo; valor sendo digitado ≥ 32 sp; "Sobrou" ≥ 28 sp.
- Respeitar o tamanho de fonte do sistema sem quebrar o layout.

### 5.4 Teclado numérico e campo de valor

- Ao abrir TELA-02/03/04, o foco já está no valor e o **teclado numérico** abre sozinho [CONFIRMADO].
- **Digitação estilo caixa registradora** [CONFIRMADO, DU-03]: os dígitos entram **pela direita, nos centavos**, e vão empurrando para a esquerda.

  | Dígitos digitados | Valor mostrado |
  |---|---|
  | `2` | R$ 0,02 |
  | `2` `5` | R$ 0,25 |
  | `2` `5` `0` | R$ 2,50 |
  | `2` `5` `0` `0` | R$ 25,00 |
  | `1` `2` `4` `0` `0` `0` | R$ 1.240,00 |

  - O campo começa mostrando **R$ 0,00** (em cinza); não há tecla de vírgula, ela é automática.
  - **⌫** apaga o último dígito (R$ 25,00 → R$ 2,50).
  - Segurar **⌫** zera o valor [CONFIRMADO, E2-03].
  - Na edição (JOR-h), o valor existente aparece completo e o ⌫ apaga a partir dos centavos.
  - O valor é guardado em centavos (`valor_centavos` em 03-arquitetura.md), sem conversão.
- Valor zero ou vazio não pode ser salvo. Valor muito alto (ex.: > R$ 10.000) pede confirmação "Confere? R$ 12.000,00" [SUPOSIÇÃO, limite a definir].
- Botão Salvar sempre visível acima do teclado.

### 5.5 Estados vazios

| Onde | Mensagem | Ação |
|---|---|---|
| TELA-01 sem lançamentos hoje | "Nada lançado hoje ainda. Lavou um carro? Toque em **+ Carro**." | Destaque nos botões |
| TELA-05 sem resultados no filtro | "Nenhum lançamento com esses filtros." | Botão "Limpar filtros" |
| TELA-06 sem gastos no período | "Sem gastos neste período." | — |
| TELA-06 aba Serviços vazia | "Nenhum carro lançado neste período." | Botão "+ Carro" |
| Primeiro uso | Tela curta: "Lance o que entra e o que sai. A gente soma tudo para você." + escolher unidade inicial | "Começar" |

### 5.6 Mensagens de confirmação e erro

- **Após salvar:** aviso inferior por ~5 s, sem bloquear: "Saída de R$ 25,00 salva · **Desfazer**". Para serviço: "Lavagem completa · R$ 60,00 salva · **Desfazer** · **Mais um igual**". Vibração curta [SUPOSIÇÃO].
- **Excluir:** sempre pede confirmação, mostrando o que será excluído (valor, categoria, data). Botão de excluir em vermelho, botão "Cancelar" à esquerda.
- **Sair do formulário com dados preenchidos (✕):** "Descartar este lançamento?" [Continuar lançando] [Descartar].
- **Campos faltando:** mensagem junto ao campo ("Escolha a categoria"), nunca em janela pop-up.
- **Data futura** [SUPOSIÇÃO, 03-arquitetura §5.2]: no calendário, os dias depois de hoje aparecem apagados e não podem ser tocados. Se, por algum motivo, a data ficar no futuro (ex.: relógio do aparelho adiantado), o campo mostra "Só dá para lançar o que já aconteceu. Escolha hoje ou um dia anterior." e o Salvar fica desabilitado.
- **Novo serviço com nome repetido:** "Já existe um serviço com esse nome." Se o nome for de um serviço desativado: "'Lavagem de motor' está desativado. [Reativar e usar]" [SUPOSIÇÃO].
- **Novo veículo com nome repetido:** "Já existe um veículo com esse nome." Se for de um veículo desativado: "'Ônibus' está desativado. [Reativar e usar]" [SUPOSIÇÃO].
- **Serviço sem veículo:** junto à fileira, "Escolha o veículo"; Salvar desabilitado [CONFIRMADO, E2-04 a): veículo obrigatório; texto SUPOSIÇÃO]. Sem tipo de serviço, nenhum aviso: é opcional.
- **Categoria de sistema (TELA-10):** chave Ativa travada com o texto "Categoria usada pelo sistema. Pode mudar o nome, mas não pode ser desativada."
- **Erros de sincronização:** sempre dizer que os dados estão seguros no celular e oferecer "Tentar de novo".
- **Nunca** perder um lançamento: salvar no aparelho é imediato; a nuvem é sempre em segundo plano.

### 5.7 Acessibilidade e contexto de uso

- Funciona com uma mão, em pé, sob sol.
- Leitores de tela: cada botão com rótulo ("Adicionar carro", "Registrar saída").
- Modo escuro [SUPOSIÇÃO] opcional, seguindo o sistema; prioridade baixa no MVP.

---

## 6. Suposições e dúvidas

### 6.1 Suposições de design

| ID | Suposição |
|---|---|
| SUP-D01 | ~~Suposição~~ → **[CONFIRMADO, DU-01]** 3 botões de lançamento na Início: **+ Carro** (serviço, separado), **+ Entrou** (outras entradas) e **− Saiu**. |
| SUP-D02 | Forma de pagamento vem pré-selecionada com a última usada naquele tipo de lançamento. |
| SUP-D03 | ~~Valor em reais inteiros, vírgula opcional~~ → **[CONFIRMADO, DU-03]** substituída pela regra da caixa registradora: os dígitos entram pela direita, nos centavos (`2` `5` = R$ 0,25), §5.4. |
| SUP-D04 | "Repetir último serviço" considera o último serviço de hoje na unidade atual e nunca copia o valor. |
| SUP-D05 | Com "Todas as unidades" ativo, o lançamento exige escolher a unidade (sem padrão). |
| SUP-D06 | Categoria/tipo usado em lançamentos não pode ser excluído, só desativado. **[CONFIRMADO, E2-02]** As categorias de sistema são **quatro**: Serviços, Produtos, Mão de obra e Reembolso, e o dono pode criar categorias novas. [SUPOSIÇÃO, interpretação do Orquestrador a confirmar com o dono] As quatro **podem ser renomeadas** (nome, ícone, cor), mas **não podem ser desativadas** (chave travada na TELA-10), alinhado a 03-arquitetura. |
| SUP-D07 | Gráfico de categorias em barras horizontais, não pizza. |
| SUP-D08 | Navegação com barra inferior de 4 itens (Início, Extrato, Resumo, Mais). |
| SUP-D09 | Tela inicial mostra só Hoje e Mês; semana e outros períodos ficam no Extrato/Resumo. |
| SUP-D10 | Lançamento com valor acima de um limite pede confirmação extra. |
| SUP-D11 | ~~Suposição~~ → **[CONFIRMADO, DU-02]** Padrão Pessoal/Empresa = sempre "Empresa", trocável em Ajustes (TELA-09); guardado em `preferencia_usuario` e sincronizado. |
| SUP-D12 | Lançamentos Pessoais pertencem a uma unidade como os demais (depende da dúvida 12 da visão). |
| SUP-D13 | O seletor de data das TELA-02/03/04 (e na edição) bloqueia dias depois de hoje no fuso da unidade (03-arquitetura §5.2, derivado de D-01). |
| SUP-D14 | Tipo de serviço criado pelo "+ Novo serviço" da TELA-02 entra no fim da ordem da grade; nome repetido é recusado e nome de serviço desativado oferece reativação. |
| SUP-D15 | Tipo de veículo na TELA-02: ordem dos campos Serviço → Veículo → Valor → Pagou com; fileira única de ícones terminando em "+ Novo veículo" (só nome, ícone genérico, já selecionado ao salvar). **[CONFIRMADO, E2-04 a)]** veículo obrigatório e tipo de serviço opcional nas entradas de serviço; serviço sem tipo aparece como "Serviço" e no Resumo como "Sem tipo de serviço" [SUPOSIÇÃO]. |
| SUP-D16 | **[CONFIRMADO, E2-06]** O último veículo usado num serviço já vem marcado na TELA-02. [SUPOSIÇÃO] No primeiro uso, nada marcado; "Mais um igual" / "Repetir" copiam também o veículo. |
| SUP-D17 | Extrato com chip "Veículo" e veículo visível no item de serviço; Resumo › Serviços com seletor "Por serviço · Por veículo". **[CONFIRMADO, E2-08]** serviço e veículo separados no MVP; cruzamento serviço × veículo fica para depois (§7). |
| SUP-D18 | Tipos de veículo gerenciados na TELA-14 (padrão da TELA-11), acessível por Mais / Ajustes; não há "excluir", só desativar. |
| SUP-D19 | Calendário do filtro de período (TELA-05/06): folha inferior no mês atual com ‹ ›; 1 toque = um dia, 2 toques = intervalo (inverte se preciso), 3º toque recomeça; dias futuros desabilitados; atalhos aplicam na hora, calendário pede Aplicar; chip mostra "27/10 a 02/11". |

### 6.2 Dúvidas para o dono

| ID | Dúvida | Impacto |
|---|---|---|
| DU-01 | ~~Botão separado + Carro ou único + Entrou?~~ **Respondida:** botão **+ Carro** separado. | TELA-01 com 3 botões |
| DU-02 | ~~Padrão sempre "Empresa" ou "o último usado"?~~ **Respondida:** sempre **Empresa**, trocável em Ajustes. | TELA-02/03/04 e TELA-09 |
| DU-03 | ~~`2` `5` = R$ 25,00 ou R$ 0,25?~~ **Respondida:** **R$ 0,25** (caixa registradora). | §5.4 |
| DU-04 | Quer ver o histórico de alterações e os lançamentos excluídos no app, ou basta o sistema guardar? | Tela extra de histórico na TELA-07 |
| DU-05 | Quem cadastra as unidades (nome, endereço)? O dono pelo app ou é feito uma vez na implantação? | TELA-09 ganha "Unidades" ou não |
| DU-06 | Na tela inicial, quer ver o saldo de "Hoje" ou de "Mês" primeiro? | Aba padrão do cartão |
| DU-07 | ~~Veículo já marcado com o último usado, sempre "Carro" ou nada marcado?~~ **Respondida (E2-06):** o **último veículo usado** já vem marcado. | Toques da JOR-b e JOR-c |
| DU-08 | ~~Quais tipos de veículo iniciais?~~ **Respondida (E2-07):** Carro · Moto · SUV · Caminhonete/Picape · Van; mesma lista em todas as unidades (E2-05). | Fileira da TELA-02 |
| DU-09 | ~~Resumo por serviço ou por veículo, ou o cruzamento?~~ **Respondida (E2-08):** separados no MVP; cruzamento fica para depois (§7). | TELA-06, aba Serviços |
| DU-10 | ~~"Semana" = semana atual ou últimos 7 dias?~~ **Respondida (E2-09):** semana atual, de **segunda-feira até hoje**. | Atalhos da folha de período |
| DU-11 | ~~O período vale junto para Extrato e Resumo?~~ **Respondida (E2-10):** **vale junto** para as duas telas. | TELA-05 e TELA-06 |
| DU-12 | ~~(E2-04) Regra de obrigatoriedade de serviço e veículo~~ **Respondida pelo dono (opção a):** **veículo obrigatório, tipo de serviço opcional**. Aplicada na TELA-02 e na JOR-b. Ainda falta o Orquestrador registrar no 01-visao.md. | TELA-02, JOR-b, validação do Salvar |

Dúvidas da visão que afetam diretamente o design (não repetidas aqui): 6 (foto do comprovante → botão de câmera nos formulários), 8 (exportar para o contador → ação no Extrato), 12 (Pessoal pertence a unidade?) e 13 (categorias separadas para Pessoal e Empresa → grade de ícones muda conforme o dropdown).

---

## 7. Fora do escopo / módulos futuros

| Ideia | Módulo futuro | Observação de design |
|---|---|---|
| Placa, modelo do veículo e nome do cliente no lançamento de serviço (o **tipo** de veículo já está no módulo) | Atendimento/fila, Clientes (PIF-01, PIF-04) | TELA-02 tem espaço reservado abaixo da fileira de veículos |
| Lançamento automático da entrada quando o serviço é concluído | Atendimento/fila (PIF-01) | "+ Carro" manual continuaria como reserva |
| Saída automática ao registrar compra de produto | Estoque (PIF-02) | Lançamentos com origem "Estoque" ganhariam selo próprio no extrato |
| Mão de obra e reembolso por funcionário, com histórico | Funcionários/equipe (PIF-03) | Campo "Para quem?" na categoria Mão de obra/Reembolso |
| Pedido de reembolso feito pelo funcionário com aprovação | Expansão de usuários (D-02, Opção B) | Nova jornada e caixa de aprovações |
| Gerentes lançando pela sua unidade; convite e permissões | Usuários/unidades (PIF-05) | Seletor de unidade já preparado para "só as minhas" |
| Contas a pagar e receber com vencimento | Evolução do módulo (PIF-06) | Abas "Já pago / A pagar" no Extrato |
| Resumo cruzado serviço × veículo (ex.: quantas "Lavagem completa" em SUV) [CONFIRMADO, E2-08: fica para depois] | Evolução do módulo (Resumo) | Na TELA-06, aba Serviços, uma tabela ou um filtro de veículo dentro de cada serviço |
| Agendamento de clientes | Agendamento | — |
| Gastos recorrentes lançados sozinhos (aluguel, internet) | Depende da dúvida 7 da visão | — |
| Exportação para o contador (planilha/PDF) | Depende da dúvida 8 da visão | Ação "Exportar" no Extrato |

---

## 8. Protótipo

**Protótipo de referência [CONFIRMADO, E2-01]: o protótipo clicável em HTML** · https://claude.ai/artifact/45rWcNZWpPyjXfEPiZ2WXC (detalhes em §8.3).

O arquivo do Figma fica **só com os componentes** (§8.1). As telas no Figma (§8.2) passam a ser **opcionais / futuras**.

Arquivo do Figma: **Lavajato — Módulo 1 Finanças — Protótipo** · https://www.figma.com/design/zIuNOQBrqinkYUxyqjKVqg

Histórico: depois de 4 chamadas, o servidor do Figma recusou a próxima com a mensagem: *"You've reached the Figma MCP tool call limit on the Starter plan. Upgrade your plan for more tool calls."* Não houve improviso: o trabalho parou nesse ponto.

### 8.1 O que existe no arquivo do Figma (só componentes)

Página **Componentes**, criada e preenchida, mas **ainda não conferida por captura de tela**, porque a chamada de conferência foi a que o Figma recusou:

| Componente | Variantes | Propriedades editáveis |
|---|---|---|
| Botão de lançamento | Tipo = Carro · Entrou · Saiu | — |
| Botão primário | Estado = Ativo · Desabilitado | Rótulo |
| Chip (filtro / opção) | Estado = Inativo · Ativo | Rótulo, Seta (liga/desliga) |
| Botão de serviço | Estado = Normal · Selecionado · Novo ("+ Novo serviço", tracejado) | Nome |
| *(falta)* Botão de veículo | Estado = Normal · Selecionado · Novo ("+ Novo", tracejado) | Nome, Ícone (troca) — ver 8.2 |
| Categoria | Estado = Normal · Saída selecionada · Entrada selecionada | Nome, Ícone (troca) |
| Item de extrato | Tipo = Entrada · Saída | Título, Detalhe, Valor, Ícone, Pendente, Pessoal |
| Cartão saldo | Período = Hoje · Mês | Entrou, Saiu, Sobrou, Filtro |
| Barra inferior | Aba = Início · Extrato · Resumo · Mais | — |
| Teclado numérico | — (caixa registradora, sem vírgula) | — |
| Aviso | — | Mensagem, Mais um igual (liga/desliga) |
| Ícones | 38 ícones de traço (carro, alimentação, água, nuvem, cadeado…) | — |

### 8.2 Telas no Figma — opcional / futuro

Não é necessário para seguir o projeto (E2-01). Fica como plano, caso o dono queira as telas no Figma mais tarde. Página **Protótipo** com frames de 360 × 800:

| Frame | Conteúdo |
|---|---|
| TELA-01 | Início · Hoje · Unidade Centro |
| TELA-01b | Início · Mês |
| TELA-01c | Início com aviso "Saída de R$ 25,00 salva · Desfazer" |
| TELA-01d | Início com aviso "Lavagem de motor · R$ 80,00 salva · Desfazer · Mais um igual" |
| TELA-01e | Início · Mês · Todas as unidades (consolidado + linha por unidade) |
| TELA-01f | Início sem internet · "3 para enviar" |
| TELA-02 / 02b / 02c | Novo serviço **com a fileira de veículos** (SUV marcado) · folha "+ Novo serviço" (só Nome) · serviço novo já selecionado |
| TELA-02d / 02e | Folha "+ Novo veículo" (só Nome) · veículo novo já selecionado na fileira |
| TELA-03 · TELA-04 | Nova saída · Nova entrada |
| TELA-05 a TELA-11 | Extrato (com chip Veículo e veículo no item de serviço), Resumo (aba Serviços com "Por serviço · Por veículo"), Detalhe (com veículo), Seletor de unidade, Mais/Ajustes (com "Tipos de veículo"), Categorias (Serviços, Produtos, Mão de obra e Reembolso com chave travada), Tipos de serviço |
| TELA-12 / 12b | Sincronização com erro e pendentes · sucesso "Tudo enviado" |
| TELA-13 | Entrar |
| TELA-14 | Tipos de veículo (lista com ícone, chave Ativo, + Novo, arrastar) |
| TELA-05b / 05c / 05d | Folha de período: atalhos + calendário do mês atual com dias futuros apagados · intervalo marcado ("De 01/11 a 03/11 · 3 dias") · Extrato com chip "01/11 a 03/11 ×" (o mesmo componente vale para a TELA-06) |

Componente que falta para o calendário: **Dia do calendário** (Normal · Hoje · Ponta do intervalo · Meio do intervalo · Futuro desabilitado), mais o cabeçalho do mês com ‹ ›.

Componentes que faltam para o tipo de veículo: **Botão de veículo** (Normal · Selecionado · Novo) e os ícones **moto, SUV, picape, van e veículo genérico** (hoje só existe "carro" entre os 38 ícones). O componente **Item de extrato** ganha o veículo no texto de detalhe ("Lavagem completa · SUV · Pix"), sem variante nova.

Fluxos clicáveis planejados:
- **JOR-a:** TELA-01 → − Saiu → TELA-03 → Salvar → TELA-01c.
- **JOR-b:** TELA-01 → + Carro → TELA-02 → + Novo serviço → TELA-02b → Salvar serviço → TELA-02c → Salvar → TELA-01d. Variação: TELA-02 → + Novo veículo → TELA-02d → Salvar veículo → TELA-02e.
- **JOR-i (veículos):** TELA-09 → Tipos de veículo → TELA-14.
- **JOR-f (período):** TELA-05 → chip Período → TELA-05b → toca 01 e 03 → TELA-05c → Aplicar → TELA-05d.
- **JOR-e:** TELA-01 → Mês → TELA-01b → unidade → TELA-08 → Todas → TELA-01e.
- **JOR-k:** TELA-01f → nuvem → TELA-12 → Sincronizar agora → TELA-12b.

Além disso, a barra inferior leva às TELA-05, 06 e 09 em todas as telas.

**Se um dia for retomado**, é preciso uma das opções:
1. esperar o limite do Figma renovar;
2. passar para um plano pago do Figma (Professional ou superior), que tem mais chamadas;
3. o dono montar as telas no Figma a partir dos wireframes da seção 4 e dos componentes já criados.

### 8.3 Protótipo clicável em HTML — protótipo de referência [CONFIRMADO, E2-01]

O dono escolheu o protótipo clicável em HTML como protótipo oficial. Ele abre no navegador e no celular: https://claude.ai/artifact/45rWcNZWpPyjXfEPiZ2WXC (privado; para mostrar a outra pessoa, compartilhe pelo menu Share da página).

- Todas as telas estão numa prancheta interativa de 360 × 800 (botão Play): TELA-01 a TELA-13, com dados de exemplo das unidades Centro e Bairro (1 a 3 de novembro).
- **Funciona de verdade:** teclado estilo caixa registradora (segurar ⌫ zera); salvar atualiza o saldo e o extrato; aviso com Desfazer e Mais um igual; "Repetir último serviço"; "+ Novo serviço" com o serviço já selecionado ao salvar; data futura bloqueada; troca de unidade e "Todas as unidades"; filtro Empresa / Pessoal / Tudo; extrato com filtros; resumo por categoria e por serviço; editar e excluir com confirmação; categorias e tipos de serviço (renomear, desativar, criar); padrão Pessoal/Empresa; sincronização (botão "Só no protótipo: simular conexão" para ver sem internet, pendentes, erro e "Tudo enviado").
- **Jornadas cobertas:** JOR-a, b, c, d, e, f, g, h, i, j, k.
- **Mão de obra, Reembolso, Serviços e Produtos aparecem travadas**, como no documento (E2-02).
- **Não incluído:** reordenar categorias e serviços, e escolher ícone e cor de categoria nova (a categoria nova usa um ícone padrão).
- **Tipo de veículo (versão 6 do protótipo):** fileira de veículos na TELA-02 com o último usado já marcado, "+ Novo veículo", veículo obrigatório e tipo de serviço opcional (E2-04 a)), veículo no extrato, no detalhe e no "Mais um igual", filtros Serviço (com "Sem tipo de serviço") e Veículo no Extrato, Resumo "Por serviço · Por veículo" com a linha "Sem tipo de serviço", e a TELA-14 (reordenar com botões ↑ ↓ no lugar de arrastar).
- **Calendário do filtro de período (§4.4):** atalhos Hoje / Semana / Mês / Mês passado, calendário com um dia ou intervalo, dias futuros desabilitados, Aplicar; o período vale junto para Extrato e Resumo (E2-10). Os dados de exemplo agora vão de 01/10 a 03/11.
