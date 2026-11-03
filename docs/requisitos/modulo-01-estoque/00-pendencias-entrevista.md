# Módulo 1 — Produtos e Estoque · Pendências para a entrevista com o usuário

Projeto: Lavajato Sistema · Autor: Orquestrador
Situação: **ARQUIVADO em 2026-11-03.** O 1º módulo passou a ser Gestão de Finanças (`../modulo-01-financas/`). Este roteiro fica guardado para quando o estoque for retomado como módulo futuro.

Documento de referência: [01-visao.md](01-visao.md) (versão 2)

---

## 1. Onde paramos

| Etapa | Situação |
|---|---|
| 0 — Conexão com os agentes | ✔ Arquitetura, DEV, Design, QA e Release respondem pelo nome |
| 1 — Visão do módulo | ✔ Versão 2 escrita · ⏸ aguardando aprovação após a entrevista |
| 2 — Design + Arquitetura | Não iniciada |
| 3 — Backlog (DEV) | Não iniciada |
| 4 — Critérios de aceite (QA) | Não iniciada |
| 5 — Roadmap (Release) | Não iniciada |
| 6 — Consolidação | Não iniciada |

## 2. O que já está confirmado pelo dono

- Lava-jato com poucos funcionários; o sistema precisa ser claro e ágil.
- Mais de uma unidade. Um usuário pode ser gerente em mais de uma unidade; funcionários podem trabalhar em mais de uma unidade.
- O consumo por lavagem não é padronizado: a dosagem é feita no olhômetro.
- O sistema deve ser um aplicativo de celular, rápido e fácil, que não deixe o usuário pensando no que gastou para lavar o veículo.

## 3. Roteiro de perguntas para a entrevista

### 3.1 Negócio e unidades
1. Quantas unidades existem hoje e quantas estão previstas?
2. Quantos funcionários por unidade, e em quais funções?
3. Quem é gerente de quê? Há gerente que cuida de várias unidades?
4. Funcionários trocam de unidade no mesmo dia ou em dias diferentes?
5. Quais serviços são oferecidos hoje? Quais são os mais vendidos e os mais caros em produto?
6. Em média, quantos veículos por dia em cada unidade?

### 3.2 Estoque hoje
7. Como o estoque é controlado hoje (nada, caderno, planilha)?
8. Existe um almoxarifado/depósito por unidade, ou os produtos ficam soltos no pátio?
9. As compras são feitas por unidade ou de forma central para todas?
10. Quem compra, com que frequência e como decide quanto comprar?
11. Em que embalagens os produtos chegam (galão 1 L, 5 L, caixas, unidades)?
12. Já aconteceu de faltar produto no meio do expediente? Com que frequência e de quais produtos?
13. Há produtos com validade que importam (perdem efeito, vencem)?
14. Produtos são levados de uma unidade para outra?

### 3.3 Uso de produto no pátio
15. Como cada produto é usado hoje: direto do galão, em borrifador, em balde?
16. Produtos concentrados são diluídos? Em que proporção, e quem decide?
17. Há perda ou desperdício conhecido (derramamento, galão aberto, produto que some)?
18. Como as microfibras, esponjas e escovas são controladas e descartadas?

### 3.4 Uso do celular
19. Todos os funcionários têm celular próprio? Android, iPhone ou ambos?
20. Eles aceitariam usar o próprio celular, ou haveria um aparelho fixo da unidade?
21. Como é a internet (Wi-Fi, dados móveis) no pátio de cada unidade?
22. Qual o nível de familiaridade da equipe com aplicativos?
22b. Um celular pode ser compartilhado por mais de um funcionário (aparelho da unidade)? Se sim, cada um entra com o próprio login?

### 3.5 Mudanças na operação (ver 01-visao.md, seção 6.2)
23. O dono aceita implantar frascos de trabalho com volume fixo e identificados?
24. Aceita padronizar a diluição e afixar uma tabela no pátio?
25. Aceita usar bombas dosadoras e copos medidores?
26. Aceita um almoxarifado único por unidade, de onde o produto só sai para encher frascos?
27. Aceita um período de medição de 2 a 4 semanas antes de definir o consumo de referência?
28. Enquanto não existir o módulo de atendimento, quem pode lançar o total de serviços do dia por unidade?

### 3.6 Expectativas
29. Quais as 3 coisas que o sistema precisa resolver primeiro?
30. Há prazo ou limite de orçamento?
31. Quem precisa ver relatórios, e de quê (custo, consumo, comparação entre unidades)?

## 4. Decisões a tomar na entrevista

| ID | Decisão | Opções | Recomendação atual |
|---|---|---|---|
| D-01 | O módulo controla só insumos ou também produtos de revenda? | A) Só insumos · B) Insumos + revenda | A no MVP, já com o campo "tipo de item" no modelo |
| D-02 | Como o pátio registra o consumo? | A) Por recarga de frasco/retirada · B) Por lavagem | A, junto com as mudanças de operação |
| D-03 | Tipo de aplicativo e armazenamento | — | **DECIDIDO:** dados locais no aparelho + banco em nuvem Supabase + sincronização automática quando há internet + botão "Sincronizar" |

Decisões que aparecerão nas próximas etapas (exigidas na consolidação): estoque negativo permitido ou não; método de custo (custo médio ponderado ou último custo); controle de lote/validade; baixa manual ou automática por serviço.

## 5. Suposições a validar

Todas as [SUPOSIÇÃO] de [01-visao.md](01-visao.md), em especial:

- 2 a 5 unidades e até ~20 usuários no total.
- Catálogo de produtos e de fornecedores comum a todas as unidades; saldo e estoque mínimo por unidade.
- Internet instável no pátio: o registro rápido precisa funcionar sem conexão.
- Orçamento baixo, preferência por ferramentas gratuitas ou baratas.
- Lavadores registram retiradas e recargas; o gerente aprova os ajustes de inventário da sua unidade.
- Metas: 0 rupturas em 2 meses, −15% de consumo em 3 meses, divergência de inventário ≤ 5%, registro em ≤ 3 toques e ≤ 10 segundos.

## 6. Como retomar

1. Registrar as respostas da entrevista (pode ser neste arquivo, abaixo de cada pergunta).
2. O Orquestrador atualiza 01-visao.md para a versão 3, trocando suposições por fatos confirmados.
3. Aprovação da visão ("ok") e escolha de D-01 e D-02.
4. Disparo da Etapa 2: Design → 02-design.md e Arquitetura → 03-arquitetura.md, em paralelo.
