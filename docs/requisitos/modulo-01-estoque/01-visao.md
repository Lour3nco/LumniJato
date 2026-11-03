# Módulo 1 — Produtos e Estoque · Visão

Projeto: Lavajato Sistema
Documento: 01-visao.md · Autor: Orquestrador · Versão: 2 · Status: **ARQUIVADO — deixou de ser o 1º módulo em 2026-11-03** (o 1º módulo passou a ser Gestão de Finanças, em `../modulo-01-financas/`). Será retomado como módulo futuro; a numeração será revista quando isso acontecer.

> Convenção: itens marcados **[SUPOSIÇÃO]** não foram confirmados pelo dono do negócio e devem ser validados. Itens marcados **[DÚVIDA]** precisam de resposta antes de virar regra. Itens marcados **[CONFIRMADO]** vieram do dono.

---

## 1. Contexto do negócio

- [CONFIRMADO] Lava-jato com **poucos funcionários**, onde **agilidade é essencial**. O sistema precisa ser claro e rápido; ninguém pode perder tempo pensando no que registrar.
- [CONFIRMADO] **Mais de uma unidade.** Um usuário pode ser gerente em mais de uma unidade, e funcionários também podem trabalhar em mais de uma unidade.
- [CONFIRMADO] **O consumo por lavagem não é padronizado:** o dono dosa os produtos "no olhômetro". Não existe hoje medida de referência por serviço.
- [CONFIRMADO] O sistema precisa ser um **aplicativo de celular** ágil e fácil de usar.
- [CONFIRMADO] O app guarda os dados **no próprio aparelho** e sincroniza com o banco em nuvem (**Supabase**) **automaticamente quando há internet** e também por um **botão "Sincronizar"**. Ver Decisão D-03.

## 2. Problema

O lava-jato usa insumos (shampoo, cera, pretinho, desengraxante, APC etc.) e materiais de desgaste (microfibras, esponjas, escovas) todos os dias, mas não sabe com precisão:

- **quanto tem** de cada item, em cada unidade;
- **quando vai acabar**, o que leva a falta de produto no meio do expediente;
- **quanto gasta de insumo** em cada serviço: como a dosagem é no olhômetro, não há como saber a margem real de uma lavagem nem identificar desperdício;
- **para onde foi** o produto (consumo normal, desperdício, perda ou desvio), porque não há registro de quem retirou.

### Restrição de desenho que vem do problema

**O sistema não pode pedir ao lavador que diga, a cada lavagem, quanto usou de cada produto.** Ele não sabe (a dose não é medida), não tem tempo (poucos funcionários, mão molhada) e o dado seria inventado. O consumo deve ser capturado em **eventos simples e verificáveis** (ver seção 6) e o custo por serviço deve ser **calculado** a partir deles.

## 3. Objetivos mensuráveis

| ID | Objetivo | Indicador | Meta inicial |
|---|---|---|---|
| OBJ-01 | Eliminar falta de insumo durante o expediente | Nº de rupturas (saldo zero de item ativo) por unidade, por mês | 0 após 2 meses de uso [SUPOSIÇÃO] |
| OBJ-02 | Conhecer o custo de insumo por serviço | % dos serviços principais com custo de insumo estimado | 100% após o período de medição (seção 6) |
| OBJ-03 | Reduzir desperdício | Consumo de insumo por serviço realizado, comparado à linha de base do período de medição | −15% em 3 meses [SUPOSIÇÃO] |
| OBJ-04 | Saldo do sistema confiável | Divergência entre saldo do sistema e contagem física | ≤ 5% em valor [SUPOSIÇÃO] |
| OBJ-05 | Rastreabilidade | % das movimentações com usuário, unidade, data/hora e motivo | 100% |
| OBJ-06 | Registro sem atrito no pátio | Toques e tempo para registrar uma retirada/recarga | ≤ 3 toques e ≤ 10 segundos [SUPOSIÇÃO] |

## 4. Quem usa e para quê

| Perfil | Uso principal no módulo |
|---|---|
| Dono | Visão de todas as unidades: custos, consumo comparado entre unidades, cadastros gerais |
| Gerente (de uma ou mais unidades) | Estoque mínimo, aprovação de ajustes de inventário, recebimento de mercadoria, lista de compras da unidade |
| Responsável por compras (pode ser o dono ou o gerente) | Alerta de estoque baixo, lista de compras, registro da entrada da mercadoria |
| Lavador / operador do pátio (pode atuar em mais de uma unidade) | Registra retirada de produto ou recarga de frasco pelo celular, em poucos toques, muitas vezes com a mão molhada |

**Multiunidade (regra de acesso):** o papel do usuário é definido **por unidade**. A mesma pessoa pode ser gerente na unidade A e na unidade B, ou lavador nas unidades A e C. Ao abrir o app, ele trabalha em uma unidade por vez (escolhida ou lembrada da última sessão), e cada movimentação fica registrada na unidade em que aconteceu.

## 5. Escopo

### 5.1 DENTRO do módulo

1. Cadastro de **unidades** (o mínimo necessário para separar estoque e acesso) e vínculo usuário × unidade × papel.
2. Cadastro de produtos (catálogo **comum a todas as unidades**), com categoria, unidade de compra, unidade de consumo e fator de conversão (ex.: galão 5 L → 5.000 ml).
3. **Saldo de estoque por unidade**, com estoque mínimo definido por unidade.
4. Cadastro de fornecedores.
5. Entrada de mercadoria (compra) em uma unidade, com quantidade, custo e fornecedor.
6. **Transferência entre unidades** (saída de uma e entrada na outra, no mesmo registro).
7. Saída/consumo pelo pátio, no modelo de registro rápido da seção 6 (retirada do almoxarifado, recarga de frasco de trabalho, baixa de material desgastado).
8. Registro de perda/avaria e de ajuste, com motivo obrigatório.
9. Inventário (contagem física) por unidade e ajuste das diferenças.
10. Alerta de estoque baixo e lista de reposição/compras por unidade.
11. **Consumo de referência por serviço** (ficha técnica): começa vazio, é preenchido a partir do período de medição e pode ser revisto pelo dono. Custo de insumo por serviço calculado a partir dele.
12. Histórico/extrato de movimentações por produto e unidade, com usuário e data/hora.
13. Relatórios básicos: posição de estoque, consumo por período, valor em estoque, **comparação de consumo entre unidades**.
14. Perfis de acesso por unidade (quem pode cadastrar, movimentar, ajustar, aprovar).

> O catálogo de serviços necessário para a ficha técnica (item 11) entra aqui **só como lista de nomes de serviço**. Preço, duração e regras do serviço pertencem a módulos futuros.

### 5.2 FORA do módulo (agora)

- Agendamento, fila/atendimento, ordem de serviço, cadastro de clientes e veículos.
- Contas a pagar, fluxo de caixa, emissão ou importação de nota fiscal (NF-e/XML).
- Pedido de compra formal enviado ao fornecedor, cotação entre fornecedores.
- Venda ao cliente final (PDV), mesmo que o item seja de revenda; ver Decisão D-01.
- Gestão de cadastro da empresa além do mínimo de unidades (CNPJ, endereço completo, horário de funcionamento etc.).
- Leitura de código de barras/QR code [SUPOSIÇÃO: pode ser avaliado como Pós-MVP; QR no frasco de trabalho pode acelerar o registro].

## 6. Como medir o consumo sem depender do "olhômetro"

### 6.1 Princípio do sistema

O lavador **não informa quanto gastou por lavagem**. O app registra só eventos simples, que ele consegue responder sem pensar:

| Evento | Exemplo | Toques esperados |
|---|---|---|
| Recarga de frasco de trabalho | "Enchi o borrifador de APC (500 ml)" | Produto/frasco → confirmar |
| Retirada do almoxarifado | "Peguei 1 galão de shampoo" | Produto → quantidade sugerida → confirmar |
| Baixa de material desgastado | "Descartei 2 microfibras" | Produto → quantidade → confirmar |

O **consumo por serviço é calculado**: consumo do produto no período ÷ número de serviços realizados no período. No MVP, o número de serviços por dia é informado de forma simples pelo gerente (total do dia por tipo de serviço) [SUPOSIÇÃO]. Quando existir o módulo de atendimento, esse número virá automaticamente (PIF-01).

### 6.2 Sugestões de mudança na operação (para o dono avaliar)

Estas mudanças são **na rotina do lava-jato**, não no software, e servem para tornar o consumo mensurável e cortar desperdício:

1. **Frascos de trabalho com volume fixo e identificados.** Borrifadores e baldes com volume marcado (ex.: borrifador 500 ml, balde com marca de 10 L). Cada recarga vira um registro de um toque, com quantidade conhecida.
2. **Diluição padronizada.** Para produtos concentrados (shampoo, APC, desengraxante), fixar a diluição (ex.: 1:10) e afixar uma tabela visível no pátio. O sistema passa a calcular o concentrado gasto a partir das recargas.
3. **Dosadores e bombas.** Usar bomba dosadora ou válvula pump nos galões (ex.: 1 acionamento = 10 ml) e copos medidores, em vez de despejar direto.
4. **Almoxarifado único por unidade.** Produto sai do almoxarifado só para encher frasco de trabalho, e não fica galão aberto espalhado pelo pátio.
5. **Período de medição (2 a 4 semanas).** Com os itens 1 a 3 implantados, registrar recargas e total de serviços. Ao final, o sistema propõe o consumo de referência por serviço, e o dono revisa e aprova.
6. **Kit por tipo de serviço** (opcional, após a medição): para serviços de maior custo, como polimento e cristalização, separar a dose antes de começar.
7. **Controle de microfibras.** Lote de microfibras numerado e baixa só no descarte, para enxergar perda e lavagem inadequada.
8. **Revisão mensal de desvio.** Comparar o consumo real com a referência por unidade; desvio alto indica desperdício, dose errada ou perda.

## 7. Pontos de integração futura

Registrados apenas como contrato de alto nível, sem especificação detalhada.

| ID | Módulo futuro | Integração |
|---|---|---|
| PIF-01 | Atendimento/fila (ordem de serviço) | Número de serviços realizados por unidade e período (substitui o lançamento manual) e, depois, baixa automática estimada de insumos ao concluir um serviço |
| PIF-02 | Financeiro | Envio do custo de insumo por serviço e do valor das entradas (compras) |
| PIF-03 | Financeiro | Entradas de mercadoria geram contas a pagar ao fornecedor |
| PIF-04 | Catálogo de serviços | O catálogo de serviços passa a ser mantido pelo módulo de serviços; o estoque só referencia o serviço |
| PIF-05 | Agendamento | Previsão de consumo a partir dos serviços agendados, para antecipar a reposição |
| PIF-06 | Vendas/PDV (se houver revenda) | Venda de produto de revenda gera saída de estoque |
| PIF-07 | Usuários, unidades e permissões | O vínculo usuário × unidade × papel criado aqui passa a ser o cadastro comum do sistema |

**Regra de preparação:** toda movimentação guarda **unidade**, **usuário**, **origem** (manual, recarga, inventário, transferência, serviço, venda…) e uma **referência opcional ao documento de origem**, para que os módulos futuros gerem movimentações sem mudar o modelo.

## 8. Suposições

- [SUPOSIÇÃO] Poucas unidades (2 a 5) e até ~20 usuários no total.
- [SUPOSIÇÃO] Serviços: lavagem simples, lavagem completa, polimento, higienização interna, cristalização.
- [SUPOSIÇÃO] Insumos comprados em galões (1 L, 5 L), caixas e unidades; consumo medido em ml, g ou unidade.
- [SUPOSIÇÃO] Catálogo de produtos e de fornecedores comum a todas as unidades; saldo e estoque mínimo por unidade.
- [CONFIRMADO] O app funciona sem conexão e sincroniza com o Supabase automaticamente quando há internet, além do botão "Sincronizar" (D-03).
- [SUPOSIÇÃO] Orçamento baixo: preferência por ferramentas gratuitas ou de baixo custo.
- [SUPOSIÇÃO] Lavadores registram retiradas e recargas; o gerente aprova ajustes de inventário da sua unidade.
- [SUPOSIÇÃO] No MVP, o total de serviços do dia é lançado pelo gerente, enquanto não existir o módulo de atendimento.

## 9. Dúvidas abertas para o dono do negócio

1. Quantas unidades existem hoje e quantas são previstas?
2. Quais serviços são oferecidos hoje?
3. Como o estoque é controlado hoje (nada, caderno, planilha)?
4. Existe um almoxarifado por unidade, ou os produtos ficam soltos no pátio?
5. O dono aceita implantar frascos de volume fixo e diluição padronizada (seção 6.2)?
6. Há prazo ou limite de orçamento?

## 10. Decisões que precisam do dono

### D-01 — Insumos internos ou também revenda?

| | **Opção A — Só insumos de uso interno** | **Opção B — Insumos + produtos de revenda** |
|---|---|---|
| O que controla | Insumos de consumo e materiais de desgaste | Os mesmos, mais itens vendidos ao cliente (aromatizantes, ceras etc.) |
| Campos a mais no produto | — | Tipo de item (insumo/revenda), preço de venda, margem |
| Movimentações a mais | — | Saída por venda; possível devolução de cliente |
| Relatórios a mais | — | Giro e margem dos itens de revenda |
| Dependência | Nenhuma | Venda depende de um módulo de vendas/PDV (PIF-06); até lá, a saída por venda seria manual |
| Impacto em prazo | Menor | Médio: +1 épico pequeno e regras de preço |
| Risco | Baixo | Misturar insumo e revenda no mesmo saldo, se não houver tipo de item bem definido |

**Recomendação do Orquestrador:** Opção A no MVP, com o campo **tipo de item** já no modelo de dados, para a revenda entrar depois sem retrabalho.

### D-02 — Como o pátio registra o consumo

| | **Opção A — Recarga/retirada (recomendada)** | **Opção B — Por lavagem** |
|---|---|---|
| O que o lavador faz | Registra quando enche um frasco ou pega um produto do almoxarifado | Informa o que usou em cada veículo |
| Tempo no pátio | Poucos registros por dia | Um registro por veículo, com vários produtos |
| Qualidade do dado | Quantidades conhecidas (frasco de volume fixo) | Estimativa no olhômetro |
| Custo por serviço | Calculado por período | Direto, mas pouco confiável |

**Recomendação do Orquestrador:** Opção A, junto com as mudanças de operação da seção 6.2.

### D-03 — Tipo de aplicativo e armazenamento · **DECIDIDO pelo dono**

**Decisão:** app de celular **local + sincronização com a nuvem**.

- Cada aparelho guarda os dados localmente e funciona sem internet.
- O banco central fica na nuvem, no **Supabase**.
- A sincronização acontece de duas formas:
  - **automática**, sempre que o aparelho tiver internet;
  - **manual**, por um **botão "Sincronizar"** no app, para forçar o envio e o recebimento na hora.
- Em ambos os casos, o app envia os registros feitos no aparelho e recebe os dados atualizados da nuvem.

Opções descartadas:
- Dados só no celular: não permite estoque compartilhado entre funcionários e unidades.
- Servidor local em cada unidade: exige um computador ligado por loja e sincronização entre as lojas.

Diretriz para a Arquitetura (Etapa 2): detalhar o banco local no aparelho, o mecanismo de sincronização e o tratamento de registros feitos offline em mais de um aparelho. Recomenda-se que as movimentações sejam registros que nunca são editados (o saldo é a soma das movimentações), para que a sincronização não gere conflitos.