# Prova de conceito do PowerSync no plano gratuito (FIN-US-07.10)

Roteiro e registro da prova pedida no 03-arquitetura §2.2. Critérios (a) a (d) e
CA-07.10.1 a CA-07.10.6. **Situação em 04/11/2026: parte sem conta feita; parte com conta
pendente do dono.** A decisão em rascunho está em [docs/dev/adr-002-sincronizacao.md](../../docs/dev/adr-002-sincronizacao.md).

## O que já está pronto (sem conta)

| Peça | Onde | Situação |
|---|---|---|
| Papel de replicação só leitura | migração `20261104000200_acesso_fechado.sql` (`powersync_replicacao`) | pronto e testado (CA-01.4.4) |
| Publicação das tabelas sincronizadas | [`publicacao.sql`](publicacao.sql) | rascunho, roda no SQL Editor na prova |
| Regras do que desce (Sync Streams) | [`sync-streams.yaml`](sync-streams.yaml) | rascunho; sintaxe a validar no painel |
| Conector de envio → `POST /sync/upload` | `apps/mobile/src/sincronizacao/conector-envio.ts` | pronto e testado com fila falsa (50 operações sem internet → todas chegam uma vez) |
| Contrato do lote e da resposta por operação | `packages/contratos` | pronto (proposta; final na FIN-US-07.11) |
| Validação do JWT do Supabase no NestJS | módulo Identidade e Acesso (FIN-US-01.13) | pronto e testado |

Falta para a prova: `POST /sync/upload` no NestJS (é a FIN-US-07.11, depende dos casos de
uso da FIN-US-01.15) — para a prova basta um endpoint que grave o lote numa tabela de teste.

## Limites dos planos gratuitos (fontes consultadas em 04/11/2026)

| Serviço | Limite | Fonte |
|---|---|---|
| PowerSync Free | até **2 GB** de dados sincronizados/mês | <https://powersync.com/pricing> |
| PowerSync Free | até **500 MB** hospedados no serviço (cópia dos dados + histórico de operações dos buckets + parâmetros) | pricing + <https://docs.powersync.com/resources/usage-and-billing/usage-and-billing-faq> |
| PowerSync Free | até **50** clientes simultâneos (acima disso, conexões novas recebem 429; as abertas continuam) | pricing + FAQ |
| PowerSync Free | até 2 instâncias; 1 conexão com o banco por instância | pricing |
| PowerSync Free | **desativado por inatividade**: a página diz "1 semana" na tabela e "mais de 2 semanas sem atividade no painel ou chamada de API" na nota — **a própria página se contradiz**; reativação manual | pricing |
| Supabase Free | banco de **500 MB**; 5 GB de saída/mês; 2 projetos ativos | <https://supabase.com/pricing> |
| Supabase Free | **pausa após 1 semana sem atividade**; projetos pagos não pausam | pricing |
| Supabase Free | **sem backup automático** (por isso o backup próprio semanal, RNF-16) | pricing |

"Dados sincronizados" contam cada envio para cada aparelho (1 MB para 100 aparelhos = 100 MB).

## (a) Volume do MVP × limites — estimativa (CA-07.10.2)

Premissas [SUPOSIÇÃO, a medir na prova]: linha de `lancamento` ≈ 0,7 KB sincronizada;
histórico ≈ 1,2 linha por lançamento × 1,5 KB (guarda antes/depois em JSON) ≈ 1,8 KB;
total ≈ **2,5 KB por lançamento**. Um aparelho (F-15).

| Cenário | Lançamentos/mês | Sincronizado/mês | Hospedado após 12 meses | Hospedado após 24 meses |
|---|---|---|---|---|
| Teto da S-01 (5 unidades, ~60 carros/dia) | ~9.000 | ~23 MB (1% de 2 GB) | ~270 MB (54% de 500 MB) | ~540 MB (**acima** de 500 MB) |
| Dono hoje [SUPOSIÇÃO: 1–2 unidades, ~30 carros/dia] | ~1.500 | ~4 MB | ~45 MB (9%) | ~90 MB (18%) |

Leitura: o **tráfego** fica muito abaixo do limite em qualquer cenário. O **dado hospedado**
passa da folga de 50% (CA-07.10.2) no teto da S-01 por volta do **mês 9** e estoura o limite
por volta do mês 22. O mesmo vale para o banco do Supabase (500 MB), que guarda as mesmas
linhas. No volume atual estimado do dono, a folga dura vários anos.

Mitigações possíveis (decisão da Arquitetura): sincronizar para o aparelho só os últimos N
meses (S-01 já prevê 24) e enxugar o histórico enviado; ou plano pago quando o volume chegar perto.

## (b) Inatividade (CA-07.10.3)

- O uso diário do dono gera atividade nos dois serviços: não pausa no dia a dia.
- **Risco:** férias ou parada de mais de 1 semana pausa o Supabase e (1 a 2 semanas) o PowerSync.
  O app continua **lançando sem internet** (RNF-03); a sincronização volta depois que o
  serviço for **reativado à mão no painel**. Nada se perde (a fila fica no celular).
- Mitigação a testar: o backup semanal (RNF-16, GitHub Actions) conta como atividade no
  Supabase? E uma chamada semanal à API do PowerSync? [A CONFERIR na prova]

## Roteiro com conta (depende do dono)

Pré-requisitos do dono: conta PowerSync (plano Free), projeto Supabase com as migrações
aplicadas, hospedagem gratuita da API (ou a API rodando num computador com túnel HTTPS só
para a prova), APK de teste instalado.

1. No SQL Editor do Supabase: definir a senha de `powersync_replicacao` e rodar `publicacao.sql`.
2. No painel do PowerSync: criar a instância (região mais próxima), ligar ao Supabase com o
   papel `powersync_replicacao` (conexão direta ou pooler em modo sessão), ativar a
   autenticação pelo Supabase Auth (JWKS do projeto) e colar `sync-streams.yaml` — anotar
   qualquer erro de sintaxe e corrigir.
3. **(d) Mesmo JWT (CA-07.10.5):** entrar no app de teste; conferir no Sync Diagnostics que o
   PowerSync aceitou o token; chamar `GET /eu` na API com o mesmo token (200). Repetir com um
   token vencido: os dois recusam.
4. **(c) Sem internet → com internet (CA-07.10.4):** em modo avião, criar 50 lançamentos; matar o
   app; reiniciar o celular; voltar a internet. Conferir no Postgres que os 50 chegaram por
   `POST /sync/upload`, sem perda nem duplicado (contar por id).
5. **(a) Medir:** no painel do PowerSync, anotar "data synced" e "data hosted" depois de carregar
   1 mês simulado (9.000 lançamentos) e comparar com a estimativa acima.
6. **(b)** Deixar 8 dias sem uso numa conta de teste e anotar o que pausa e como reativa.

## Registro das medições (preencher na prova)

| Critério | Resultado | Medição | Data | Quem |
|---|---|---|---|---|
| (a) volume × limites | | | | |
| (b) inatividade | | | | |
| (c) offline → online, 50 lançamentos | | | | |
| (d) mesmo JWT no PowerSync e no NestJS | | | | |

Se **qualquer** critério reprovar, a decisão é "sincronização própria" (CA-07.10.6): a
FIN-US-07.12 substitui a 07.1.
