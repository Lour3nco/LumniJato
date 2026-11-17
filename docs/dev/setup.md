# Preparar o ambiente de desenvolvimento

Guia para rodar o Lavajato Sistema no computador e para ligar o banco na nuvem.
A estrutura do repositório segue o 03-arquitetura, §9.6.

```
apps/mobile                     app de celular (Expo / React Native) — Android, APK direto
apps/api                        API NestJS (monólito modular, DDD)
packages/dominio-compartilhado  regras puras usadas pelo app e pela API (ex.: normalizarNome, F-16)
packages/contratos              esquemas (zod) trocados entre app e API
infra/supabase                  configuração e migrações do banco (Supabase / Postgres)
infra/powersync                 regras de sincronização (a partir da FIN-US-07.11)
infra/backup                    rotina de backup (FIN-US-07.6)
```

## 1. O que instalar (uma vez)

| O quê | Para quê | Obrigatório? |
|---|---|---|
| **Node.js 24** (LTS) | rodar tudo | sim |
| **pnpm** | gerenciador de pacotes do monorepo | sim |
| **Git** | versionar o código | sim |
| **Docker Desktop** | subir o Supabase local (banco + autenticação) | só para usar o banco local |
| **Expo Go** no celular Android, ou Android Studio com emulador | ver o app rodando | só para abrir o app |

O pnpm vem junto com o Node, pelo *corepack*. Num terminal **aberto como administrador**, rode uma vez:

```bash
corepack enable
```

Depois disso, `pnpm --version` deve mostrar `10.34.9` (a versão fica fixada no `package.json`).

> Dica: o repositório está hoje dentro do OneDrive. A pasta `node_modules` tem milhares de
> arquivos e deixa a sincronização lenta. Se possível, mantenha o projeto numa pasta fora do
> OneDrive (por exemplo `C:\projetos\sistema_lavajato`); o código já fica guardado no GitHub.

## 2. Instalar as dependências

Na raiz do repositório:

```bash
pnpm install
```

## 3. Verificar se está tudo certo

```bash
pnpm verificar   # lint (inclusive fronteiras entre módulos), tipos e testes de todos os pacotes
pnpm build       # compila os pacotes e a API
```

Os mesmos comandos rodam no GitHub a cada push e pull request (`.github/workflows/ci.yml`).

Comandos por pacote (rodar dentro da pasta do pacote):

| Pasta | Comando | O que faz |
|---|---|---|
| `apps/mobile` | `pnpm start` | abre o Expo; leia o QR code com o Expo Go |
| `apps/mobile` | `pnpm android` | abre no emulador/celular ligado por USB |
| `apps/api` | `pnpm dev` | sobe a API em modo de desenvolvimento (porta do `.env`, padrão 3000) |
| `apps/api` | `pnpm lint:fronteiras` | só a regra de fronteiras entre módulos |
| qualquer um | `pnpm test` / `pnpm lint` / `pnpm typecheck` | testes, lint e tipos daquele pacote |

Para conferir se a API subiu: abra `http://localhost:3000/saude` — deve responder `{"status":"ok"}`.

## 4. Banco local (Supabase no Docker) — opcional

Com o Docker Desktop aberto, na raiz:

```bash
pnpm db:iniciar    # sobe Postgres, Auth e o painel local (Studio em http://localhost:54323)
pnpm db:resetar    # apaga o banco local e aplica de novo todas as migrações de infra/supabase/migrations
pnpm db:parar      # desliga
```

O `pnpm db:iniciar` mostra no terminal as chaves **locais** (servem só para o seu computador).
Mesmo assim, coloque-as apenas no `.env`, nunca no código.

Sem Docker, as migrações continuam testadas: `pnpm test` dentro de `infra/` aplica todas elas
num Postgres em memória.

### Criar uma migração nova

```bash
pnpm supabase migration new nome_da_mudanca
```

Isso cria `infra/supabase/migrations/<AAAAMMDDHHMMSS>_nome_da_mudanca.sql`. Escreva o SQL ali.
Migração já aplicada na nuvem **não se edita**: crie outra.

## 5. Banco na nuvem — passo a passo do dono

Estas etapas usam a **conta do dono** e só ele faz. Ninguém do time cria contas em nome dele.

1. Entre em <https://supabase.com> e crie uma conta (pode usar a do GitHub).
2. Clique em **New project**:
   - **Organization:** a sua (plano **Free**).
   - **Name:** `lavajato`.
   - **Database password:** gere uma senha forte e **guarde num gerenciador de senhas**.
     Ela não aparece de novo.
   - **Region:** **South America (São Paulo)** — é a `sa-east-1`.
3. Espere o projeto ficar pronto (1 a 2 minutos).
4. Anote o **Project ref** — o código que aparece na URL do painel,
   `https://supabase.com/dashboard/project/<project-ref>`.
5. No terminal, na raiz do repositório:

   ```bash
   pnpm supabase login                           # abre o navegador para autorizar
   pnpm supabase link --project-ref <project-ref> # pede a senha do banco do passo 2
   pnpm supabase db push                         # aplica as migrações na nuvem
   ```

6. Confira no painel do Supabase, em **Database → Schemas**, que existem `identidade` e `financas`.
7. **Desligue o autocadastro** (ST-07 / RNF-31): no painel, vá em
   **Authentication → Sign In / Providers** e **desmarque "Allow new users to sign up"**.
   Clique em **Save**. Assim ninguém cria conta sozinho pelo app; os usuários existentes
   continuam entrando normalmente. (No banco local isso já vem desligado pelo
   `infra/supabase/config.toml`, com `enable_signup = false`; o `db push` não muda essa
   opção na nuvem, por isso o passo é manual.)
8. **Senha mínima de 8 caracteres** (RNF-21, CA-01.7.5): em **Authentication → Sign In /
   Providers → Email**, ponha **Minimum password length = 8** e salve. (No local já vem do
   `config.toml`.)
9. **API pública fechada — não exponha os schemas** (FIN-US-01.4): em **Project Settings →
   Data API → Exposed schemas**, deixe só os que já vêm (`public`, `graphql_public`). **Não
   acrescente `identidade` nem `financas`.** As migrações já ligam a RLS sem nenhuma política e
   tiram todo privilégio de `anon` e `authenticated` nesses schemas; não expor é a camada a mais.
10. **Chaves de assinatura do login (JWT)**: em **Project Settings → JWT Keys**, confira que o
   projeto usa as **chaves assimétricas** ("JWT Signing Keys", padrão dos projetos novos). A API
   valida o token pelas chaves públicas do projeto (`<URL>/auth/v1/.well-known/jwks.json`).
   Se aparecer só o "Legacy JWT secret", clique para migrar para as chaves novas.
11. **Senhas dos papéis da API e da replicação** (criados SEM senha pela migração de acesso).
   No **SQL Editor**, troque o texto entre aspas por uma senha forte gerada no gerenciador de
   senhas (uma diferente para cada) e rode — **não salve esse SQL em lugar nenhum**:

   ```sql
   alter role api_lavajato with password 'COLE-AQUI-UMA-SENHA-FORTE';
   alter role powersync_replicacao with password 'COLE-AQUI-OUTRA-SENHA-FORTE'; -- só se usar o PowerSync
   ```

12. **Criar a conta do dono** (não há tela de cadastro, ST-07): em **Authentication → Users →
   Add user → Create new user**, informe o e-mail e uma senha de 8+ caracteres e marque
   **Auto Confirm User**. Copie o **User UID** que aparece na lista.
13. **Implantação: organização, unidades e vínculo do dono + cadastros iniciais** (FIN-US-01.6,
   F-08). Copie `infra/implantacao/implantacao.exemplo.sql` para
   `infra/implantacao/implantacao.local.sql` (este nome não vai para o git), troque os valores
   fictícios pelos reais — **nome do lava-jato, nomes das unidades, User UID, nome e e-mail do
   dono** — e rode o conteúdo no SQL Editor. Pode rodar de novo sem duplicar nada; unidade nova
   na lista é acrescentada. Isso também carrega categorias, tipos de serviço, tipos de veículo e
   formas de pagamento.
14. **Não compartilhe senhas** do banco, dos papéis ou do dono em chat, e-mail ou mensagem. Se
   alguma foi mostrada a alguém, troque na hora (senha do banco: **Project Settings → Database →
   Reset database password**; papéis: rode de novo o passo 11).

### Onde colocar as chaves

As chaves e senhas ficam **só** em arquivos `.env`, que o `.gitignore` já impede de ir para o git.
Cada pacote que precisa de configuração tem um `.env.example` **sem valores** mostrando os nomes.

```bash
cp apps/api/.env.example apps/api/.env
```

Preencha `apps/api/.env`:

| Variável | Onde achar no painel do Supabase | Quando passa a ser usada |
|---|---|---|
| `PORTA` | não vem do Supabase; deixe `3000` | já |
| `SUPABASE_URL` | **Project Settings → API → Project URL** | obrigatória: a API não sobe sem ela (valida o login, FIN-US-01.13) |
| `DATABASE_URL` | **Connect → Session pooler** (o endereço direto do plano gratuito pode exigir IPv6). Troque o usuário por `api_lavajato.<project-ref>` e use a senha do passo 11: `postgresql://api_lavajato.<project-ref>:<senha>@<host-do-pooler>:5432/postgres`. Fora do computador local a API **só aceita** o usuário `api_lavajato` | obrigatória |

Para o app de celular, copie também `apps/mobile/.env.example` para `apps/mobile/.env`:

| Variável | Onde achar | Observação |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | **Project Settings → API → Project URL** | vai dentro do APK (é pública) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | **Project Settings → API Keys → anon / publishable** | pública; **nunca** a service_role |
| `EXPO_PUBLIC_API_URL` | endereço da API publicada ([adr-003-hospedagem-api.md](adr-003-hospedagem-api.md)) | o app busca as unidades em `/eu` até a sincronização existir |
| `EAS_PROJECT_ID` | criado no `eas init` ([apk.md](apk.md)) | liga as atualizações pelo app |

Regras:

- **Nunca** cole chave, senha ou token em código, em mensagem de commit ou em issue.
- A chave **service_role** do Supabase dá acesso total ao banco: não vai para o app de celular
  em hipótese nenhuma.
- Se uma chave vazar, gere outra no painel do Supabase na hora.
- No GitHub, quando o deploy automático existir, as chaves vão em
  **Settings → Secrets and variables → Actions**, nunca no `ci.yml`.

## 6. Outros guias

- [apk.md](apk.md): gerar, instalar e atualizar o APK; guardar a chave de assinatura.
- [adr-001-query-builder.md](adr-001-query-builder.md): por que a API usa o Kysely.
- [adr-002-sincronizacao.md](adr-002-sincronizacao.md): PowerSync × sincronização própria (rascunho).
- [adr-003-hospedagem-api.md](adr-003-hospedagem-api.md): hospedagem gratuita da API (rascunho).
- [../../infra/powersync/prova-de-conceito.md](../../infra/powersync/prova-de-conceito.md): roteiro da prova do PowerSync.
