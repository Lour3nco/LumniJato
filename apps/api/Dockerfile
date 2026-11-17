# API NestJS do Lavajato — imagem para a hospedagem (FIN-US-09.9, ADR-003 em RASCUNHO).
# Construir na RAIZ do repositório (o monorepo inteiro é o contexto):
#   docker build -f apps/api/Dockerfile -t lavajato-api .
# [NÃO TESTADO nesta máquina: não há Docker instalado. Conferir no primeiro build.]
#
# Nenhuma credencial entra na imagem: DATABASE_URL e SUPABASE_URL vêm das variáveis de
# ambiente da hospedagem (CA-09.9.2). A porta vem de PORT (Cloud Run) ou PORTA.

FROM node:24-slim AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo

# Instala e compila só a API e os pacotes de que ela depende.
FROM base AS construcao
COPY . .
RUN pnpm install --frozen-lockfile --filter "@lavajato/api..."
RUN pnpm --filter "@lavajato/api..." run build
# Copia a API com só as dependências de produção (sem testes, PGlite, lint…).
RUN pnpm --filter @lavajato/api deploy --prod --legacy /saida

FROM node:24-slim AS execucao
ENV NODE_ENV=production
WORKDIR /app
COPY --from=construcao /saida ./
USER node
EXPOSE 8080
CMD ["node", "dist/main.js"]
