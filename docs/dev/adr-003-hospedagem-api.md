# ADR-003 · Hospedagem gratuita da API NestJS — RASCUNHO

- **Data:** 04/11/2026 · **Status:** **RASCUNHO — a decisão é do dono e do Orquestrador**
- **História:** FIN-US-09.9 (preparação sem conta) · CA-09.9.1 a CA-09.9.5
- Nada foi publicado e nenhuma conta foi criada.

## O que a hospedagem precisa ter

HTTPS; variáveis de ambiente para as credenciais (CA-09.9.2); **uso comercial permitido no
plano gratuito** (CA-09.9.5, 03-arquitetura §2.1); dormir sem uso é aceitável, porque o app
salva no celular e só a sincronização espera (CA-09.9.4); de preferência perto de São Paulo
(o Supabase está em sa-east-1).

## Comparação (páginas oficiais consultadas em 04/11/2026)

| | **Google Cloud Run** | **Render** (Free) | **Koyeb** (Free) | **Fly.io** |
|---|---|---|---|---|
| Plano gratuito | Sim: 2 milhões de pedidos/mês, 180.000 vCPU-s, 360.000 GB-s, 1 GB de saída da América do Norte/mês ([free features](https://docs.cloud.google.com/free/docs/free-cloud-features)) | 750 horas de instância/mês por workspace ([docs/free](https://render.com/docs/free)) | 1 instância (0,1 vCPU, 512 MB) por organização ([instances](https://www.koyeb.com/docs/reference/instances)) | **Não**: "New organizations don't have a free tier"; só teste de 2 h/7 dias ([pricing](https://docs.fly.io/about/pricing)) |
| Uso comercial / produção | Sem proibição no Free Tier ("no end date"; pode mudar com 30 dias de aviso) | **"Do not use them for production applications."** | **"should not be used for production applications"** | — |
| Dorme sem uso | escala até zero [não confirmado na página lida; padrão do serviço] | sim, após **15 min**; acorda em **~1 min** | sim, após **1 h** | — |
| Região perto de SP | **southamerica-east1 (São Paulo)** existe, mas é preço "Tier 2"; a página não diz se a cota grátis vale no Tier 2 ([locations](https://docs.cloud.google.com/run/docs/locations)) | **não**: Oregon, Ohio, Virgínia, Frankfurt, Singapura ([regions](https://render.com/docs/regions)) | **não**: Frankfurt ou Washington | — |
| Cartão de crédito | **sim** (conta de faturamento obrigatória) | não informado | não informado | sim, após o teste |
| HTTPS | sim (URL `*.run.app`) [não confirmado na página lida] | sim (certificado gerenciado) | — | — |

**Oracle Cloud Always Free** foi avaliada, mas a página oficial recusou o acesso automático
(HTTP 403). Fica **não verificada** (exigiria manter uma VM, mais trabalho de operação).

## Recomendação (rascunho)

**Google Cloud Run**, com a imagem `apps/api/Dockerfile`, `--min-instances 0` e `--max-instances 1`:

1. É a única das opções verificadas cujo plano gratuito **não proíbe produção**. Render e Koyeb dizem
   explicitamente para não usar o gratuito em produção, o que reprova o CA-09.9.5.
2. Tem região em **São Paulo**, junto do Supabase. **Pendente:** confirmar no console de
   faturamento se a cota grátis vale em `southamerica-east1` (Tier 2). Se não valer, usar
   `us-central1` (Tier 1, onde o gratuito é o padrão), com ~120 ms a mais por pedido, irrelevante
   para um app que sincroniza em segundo plano.
3. O volume do MVP fica muito abaixo da cota (algumas centenas de pedidos de sincronização por dia).

**Riscos:** exige conta de faturamento com cartão (o dono deve criar um **alerta de orçamento** de
R$ 1 para saber de qualquer cobrança); o primeiro pedido depois de um tempo parado demora alguns
segundos (aceito no CA-09.9.4); a Google pode mudar a cota com 30 dias de aviso.

## O que já está pronto (sem conta)

- `apps/api/Dockerfile` (multi-estágio, sem credenciais; **não testado**: não há Docker nesta máquina).
- `.dockerignore` na raiz (tira `.env`, certificados e dados locais do contexto da imagem).
- A API aceita a porta pela variável `PORT` do Cloud Run (ou `PORTA`).
- `.github/workflows/publicar-api.yml` (rascunho, só manual): testes → migrações no Supabase →
  imagem e Cloud Run → confere `/saude`. Se a migração falhar, a versão nova não entra (CA-09.9.3).

## O que depende do dono

1. Criar a conta Google Cloud com faturamento e o alerta de orçamento.
2. Conferir a cota grátis em `southamerica-east1` e escolher a região.
3. Configurar o acesso do GitHub ao Google Cloud (Workload Identity) e os segredos listados no
   workflow; colocar `DATABASE_URL` (papel `api_lavajato`) e `SUPABASE_URL` no serviço do Cloud Run.

## Decisão

_(preencher: hospedagem escolhida, região, data, quem decidiu)_
