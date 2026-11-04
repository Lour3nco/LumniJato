# ADR-002 · Sincronização: PowerSync ou sincronização própria — RASCUNHO

- **Data:** 04/11/2026 · **Status:** **RASCUNHO — a decisão final é do dono e do Orquestrador**
- **História:** FIN-US-07.10 (prova de conceito) · CA-07.10.1
- **Roteiro e números:** [infra/powersync/prova-de-conceito.md](../../infra/powersync/prova-de-conceito.md)

## Contexto

O 03-arquitetura (§2.2, §2.3) manda usar o PowerSync no plano gratuito **se** a prova de
conceito aprovar os critérios (a) a (d); senão, a sincronização própria via API NestJS
(FIN-US-07.12, +3 pontos). Tudo em planos gratuitos (F-03b).

## O que a prova já mostrou sem conta

| Critério | Situação | Base |
|---|---|---|
| (a) volume cabe com folga | **Aprovado no volume atual estimado; reprovado no teto da S-01 a partir do ~9º mês** (dado hospedado > 50% de 500 MB) | estimativa; falta medir |
| (b) inatividade não atrapalha | **Aprovado com ressalva:** o uso diário evita a pausa; parada de 1+ semana exige reativar à mão, sem perda de dados | regras publicadas |
| (c) offline → online sem perda | **Pendente** (conector pronto e testado com fila falsa; falta o teste no aparelho) | — |
| (d) mesmo JWT no PowerSync e no NestJS | **Pendente** (NestJS valida o JWT do Supabase; falta o lado do PowerSync com conta) | — |

## Recomendação (rascunho)

**Seguir com o PowerSync na prova com conta**, porque:

1. O tráfego mensal fica em ~1% do limite e o dado hospedado no volume atual do dono fica
   abaixo de 20% por dois anos; a folga só acaba se o negócio chegar perto do teto da S-01.
2. O que acaba o plano gratuito no teto da S-01 (500 MB hospedados) também acaba o banco
   gratuito do Supabase (500 MB) — é limite do projeto todo, não do PowerSync. A sincronização
   própria não resolve isso.
3. A alternativa custa ~2 a 3 semanas a mais e tem risco técnico maior (§2.3).

Condições para aprovar de vez: (c) e (d) aprovados no aparelho; e a Arquitetura decidir uma
das mitigações de volume (sincronizar só os últimos N meses / enxugar o histórico enviado) ou
aceitar o plano pago quando o volume passar de ~250 MB.

**Riscos que ficam:** os dois serviços pausam após ~1 semana sem uso (reativação manual); a
página de preços do PowerSync se contradiz sobre o prazo (1 ou 2 semanas); "Sync Rules" foram
substituídas por "Sync Streams" (usamos o formato novo).

## Hospedagem gratuita da API

**Não escolhida** (precisa de conta e de conferir os termos de uso comercial — §2.1). Fica com
o dono e o Orquestrador; a prova pode usar a API num computador com túnel HTTPS.

## Decisão

_(preencher depois da prova com conta: PowerSync ou sincronização própria, data, quem decidiu)_
