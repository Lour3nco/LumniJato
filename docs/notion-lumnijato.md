# Sobre o projeto

**LumniJato** é um sistema de gestão para lava-jato. O primeiro módulo é a **Gestão de Finanças**: funcionar "como uma planilha de gastos, mas sem planilha", registrando de forma rápida e amigável tudo o que **entra** e **sai** do caixa.

**Problema:** os gastos do dia a dia (diária de lavador, almoço, passagem, produtos, conta de água) se perdem em papel, mensagens e memória. O dono não sabe, no fim do dia ou do mês, quanto entrou, quanto saiu e quanto sobrou por unidade, nem em que categoria gasta mais.

**Contexto do negócio**
- Poucos funcionários, onde agilidade é essencial: lançar algo leva no máximo 15 segundos e 4 toques.
- Mais de uma unidade; todo lançamento pertence a uma unidade, e o dono vê cada uma e o consolidado.
- Todo lançamento é marcado como **Pessoal** ou **Empresa**.
- Entradas de serviço lançadas **carro por carro**, com tipo de veículo (obrigatório) e tipo de serviço (opcional); o valor é digitado na hora.
- No MVP, **só o dono usa o app**; outros usuários (gerentes, funcionários) ficam para depois.
- Funciona **sem internet**: os dados ficam no celular e sincronizam com a nuvem automaticamente ou pelo botão "Sincronizar".

**Metas (MVP)**
| ID | Objetivo | Meta |
|---|---|---|
| OBJ-01 | Registro sem atrito | ≤ 15 s e ≤ 4 toques por lançamento |
| OBJ-02 | Nada fica de fora | ≥ 95% dos gastos do mês lançados |
| OBJ-03 | Fechamento sem planilha | Entrou, saiu e sobrou do mês por unidade, dentro do app |
| OBJ-04 | Saber onde o dinheiro vai | Gastos por categoria, período e unidade |
| OBJ-05 | Rastreabilidade | 100% dos lançamentos com usuário, unidade, data e categoria |

**Escopo do Módulo 1:** lançar saídas, entradas de serviço e outras entradas; categorias (Serviços, Produtos, Mão de obra e Reembolso fixas, mais as criadas pelo dono); tipos de serviço e de veículo; extrato com período (atalhos e calendário) e filtros; resumo de entrou/saiu/sobrou, gastos por categoria e entradas por serviço e veículo; editar e excluir com histórico de alterações e lixeira de 90 dias.

**Fora do escopo agora:** agendamento e fila, clientes e placas, estoque (arquivado como módulo futuro), nota fiscal e contabilidade, integração bancária/Pix, folha de pagamento, contas a pagar e receber com vencimento futuro.

**Stack**
- App: React Native + Expo, só Android, distribuído como APK de instalação direta (sem Google Play). Pacote `br.com.lavajato.app`.
- Back-end: NestJS com DDD, Clean Architecture e monólito modular; Kysely como query builder (ADR-001). Toda escrita do celular passa pela API.
- Banco: Supabase (PostgreSQL, região sa-east-1), com acesso público fechado.
- Sincronização offline: PowerSync no plano gratuito, se a prova de conceito aprovar (ADR-002).
- Painel web de consulta: Next.js, depois do MVP.
- Monorepo pnpm + Turborepo (`apps/api`, `apps/mobile`, `packages/contratos`, `packages/dominio-compartilhado`, `infra`), CI no GitHub Actions.
- Restrição: só planos gratuitos, com backup próprio semanal fora do Supabase.

**Roadmap**
| Fase | Objetivo | Histórias | Pontos |
|---|---|---|---|
| M1 — Base e lançar no celular | Monorepo, banco, API, prova de conceito, API hospedada, lançamentos offline e saldo do dia em APK de teste | 38 | 118 |
| M2 — Ver e corrigir | Extrato, Resumo, detalhe, editar, excluir, histórico e lixeira | 21 | 60 |
| M3 — Gerenciar, blindar e entregar | Cadastros, sincronização à prova de falhas, segurança, backup, desempenho, APK final | 14 | 37 |
| Painel web (pós-MVP) | Consulta no computador, só leitura | 8 | 24 |
| v1.1 | Ajustes depois do uso real | 5 | 15 |
| v2 | Preparar para outros usuários e módulos | 2 | 3 |

**Situação atual (17/11/2026):** M1 em andamento, passos 1 a 4 concluídos (monorepo, app Expo, migrações, base da API, login, componentes base, acesso fechado, dados iniciais, identidade, domínio do lançamento e teclado de valor).

# Itens de ação

**M1-A — Base técnica (feito)**
- [x] Monorepo, app Expo e pacote de domínio compartilhado
- [x] Projeto Supabase e migrações versionadas
- [x] Esquema do banco (schemas `identidade` e `financas`)
- [x] Base da API NestJS (Clean Architecture, monólito modular)
- [x] Login com e-mail e senha (Supabase Auth)
- [x] Componentes base e preparo do APK
- [x] Acesso direto ao banco fechado e dados iniciais
- [x] Identidade e Acesso e domínio do lançamento
- [x] Teclado de valor estilo caixa registradora

**M1-A — Pendente**
- [ ] Concluir a prova de conceito do PowerSync com conta (testes offline → online e JWT) e fechar a ADR-002
- [ ] Decidir a hospedagem gratuita da API (ADR-003) e publicar com HTTPS
- [ ] Gerar APK assinado de teste e levar um lançamento do celular ao Postgres pela API

**M1-B — Lançar no celular**
- [ ] Lançar saídas, outras entradas e carros (com "Mais um igual" e "Repetir"), com e sem internet
- [ ] Cartão de Entrou / Saiu / Sobrou de hoje e do mês na tela Início

**M2 e M3**
- [ ] M2: Extrato, Resumo, detalhe, editar, excluir, histórico e lixeira
- [ ] M3: telas de cadastro, sincronização com tratamento de erros, segurança/LGPD, backup semanal, desempenho e APK final

**Decisões pendentes com o dono**
- [ ] Reembolso: devolução a funcionário, a cliente ou os dois?
- [ ] Como a mão de obra é paga (diária, semanal, por carro, mensal)?
- [ ] Categorias iguais para Pessoal e Empresa, ou listas separadas?
- [ ] Anexar foto de comprovante? Lançar gastos fixos mensais sozinho? Exportar para o contador?
- [ ] Confirmar a janela de 24 meses no celular quando o banco passar de ~250 MB

# Documentos

Todos no repositório, pasta `docs/`:

**Requisitos — Módulo 1 (Finanças)** — `docs/requisitos/modulo-01-financas/`
- `01-visao.md` — contexto, problema, metas, escopo e decisões do dono
- `02-design.md` — telas, fluxos e wireframes
- `03-arquitetura.md` — arquitetura, modelo de dados e sincronização
- `04-backlog.md` — 88 histórias em 10 épicos (257 pontos)
- `05-criterios-aceite.md` — critérios de aceite por história
- `06-roadmap.md` — marcos M1 → M2 → M3, painel web, v1.1 e v2

**Desenvolvimento** — `docs/dev/`
- `setup.md` — como preparar o ambiente e ligar o banco
- `apk.md` — como gerar e instalar o APK
- `adr-001-query-builder.md` — Kysely como query builder (aceita)
- `adr-002-sincronizacao.md` — PowerSync ou sincronização própria (rascunho)
- `adr-003-hospedagem-api.md` — hospedagem gratuita da API (rascunho)

**Outros**
- `docs/requisitos/modulo-01-estoque/` — módulo de Estoque, arquivado para o futuro
- `infra/powersync/prova-de-conceito.md` — roteiro e números da prova de conceito
- Protótipo em HTML: https://claude.ai/artifact/45rWcNZWpPyjXfEPiZ2WXC
- `Sistema_de_Gerenciamento_de_Lava_jato.pdf` — documento na raiz do projeto
