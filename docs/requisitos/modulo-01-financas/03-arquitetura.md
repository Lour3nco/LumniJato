# Módulo 1 — Gestão de Finanças · Arquitetura

Projeto: Lavajato Sistema
Documento: 03-arquitetura.md · Autor: Agente Arquitetura · Versão: 2 (nova stack: NestJS + Next.js, ST-01 a ST-05) · Status: **rascunho para revisão**
Fonte da verdade: `01-visao.md` (versão 3). Em caso de conflito, a visão prevalece.

> Convenção: **[CONFIRMADO]** veio do dono (via 01-visao.md) · **[SUPOSIÇÃO]** decisão técnica ou premissa ainda não validada · **[DÚVIDA]** precisa de resposta do dono.
>
> Decisões já tomadas e não reabertas aqui: app de celular com dados locais e funcionamento sem internet; banco central Supabase (Postgres); back-end NestJS com DDD, Clean Architecture e monólito modular; painel web Next.js; só planos gratuitos; sincronização automática + botão "Sincronizar"; modelo usuário × unidade × papel com só o papel Dono no MVP; Pessoal/Empresa em todo lançamento; só o realizado (situação reservada); entrada de serviço carro por carro, sem tabela de preços.

---

## 1. Requisitos não funcionais

| ID | Tema | Requisito | Critério de aceite |
|---|---|---|---|
| RNF-01 | Uso no celular | O app roda em **Android** [CONFIRMADO F-03: só Android no MVP; iPhone/iOS fica para evolução, ver §8], em telas a partir de 5", com uso por uma só mão (botões principais na metade de baixo da tela). | Telas principais utilizáveis em 360 × 640 dp; áreas de toque ≥ 48 dp. |
| RNF-02 | Uso no celular | Versão mínima Android 8+ [SUPOSIÇÃO de versão; plataforma CONFIRMADA F-03]. Aparelhos de entrada (2 GB RAM) devem rodar o app sem travar. | Testes em um aparelho Android de entrada e no celular do dono (F-15: um celular); sem testes em iOS no MVP. |
| RNF-28 | Publicação | [CONFIRMADO F-04] Distribuição por **APK com instalação direta** no celular do dono, **sem Google Play**. O APK é gerado pelo EAS Build (perfil de produção com saída `apk`) e assinado sempre com a **mesma chave de assinatura** (keystore guardada pela equipe, com cópia de segurança fora do computador de build), senão o Android não aceita instalar a atualização por cima. Atualizações: mudanças só de código JavaScript/telas chegam pelo próprio app (EAS Update, baixadas ao abrir com internet); mudanças nativas (bibliotecas, permissões, versão do Expo) exigem novo APK. O `versionCode` sobe a cada APK. Publicação em loja fica como evolução (§8). | Instalação do APK no celular do dono e uma atualização de cada tipo (EAS Update e novo APK) feitas sem perder os dados locais nem as pendências. |
| RNF-03 | Sem internet | Todas as funções do dia a dia (lançar, editar, excluir, ver extrato, resumo e gráfico, gerenciar categorias e tipos de serviço) funcionam **sem internet**, usando o banco local. | Modo avião: fluxo completo de lançamento e consulta funciona. |
| RNF-04 | Sem internet | O primeiro acesso (login e download inicial dos dados) exige internet. Depois disso, a sessão permanece válida offline. | Após login, o app abre e funciona offline por pelo menos 30 dias [SUPOSIÇÃO]. |
| RNF-05 | Sincronização | Com internet, a sincronização é **automática**: ao salvar um lançamento, ao abrir o app, ao voltar a ter conexão e periodicamente (a cada ~5 min com o app aberto) [SUPOSIÇÃO]. | Lançamento feito online aparece no outro aparelho em ≤ 1 min com ambos abertos. |
| RNF-06 | Sincronização | Botão **"Sincronizar"** força envio e recebimento imediatos e mostra o resultado (sucesso, nada pendente ou erro). | Botão visível na tela inicial ou no menu, conforme 02-design.md. |
| RNF-07 | Sincronização | Indicador permanente de estado: **sincronizado** / **N pendentes** / **sem internet** / **erro**, com a hora da última sincronização. | Indicador sempre visível na tela inicial. |
| RNF-08 | Sincronização | Nenhum lançamento pode ser perdido por falha de rede, fechamento do app ou reinício do aparelho. | Teste: lançar offline, matar o app, reiniciar o aparelho, reconectar → lançamento chega ao servidor. |
| RNF-09 | Desempenho | Salvar um lançamento grava **só no banco local** e nunca espera a rede. | Tempo entre tocar "Salvar" e a confirmação na tela ≤ 300 ms. |
| RNF-10 | Desempenho | Abrir a tela de nova entrada/saída com teclado numérico já ativo. | ≤ 1 s a partir do toque em "+ Entrada"/"− Saída" (apoia OBJ-01: ≤ 15 s e ≤ 4 toques). |
| RNF-11 | Desempenho | Extrato, resumo e gráfico do mês calculados localmente. | ≤ 1 s com 10.000 lançamentos no aparelho [SUPOSIÇÃO de volume, ver §7]. |
| RNF-12 | Desempenho | Abertura do app (partida a frio) até a tela inicial. | ≤ 3 s em aparelho de entrada. |
| RNF-13 | Rastreabilidade | Todo lançamento guarda: unidade, usuário que criou, data/hora de criação, usuário que alterou por último, data/hora da última alteração e aparelho de origem. | 100% dos registros com esses campos (OBJ-05). |
| RNF-14 | Rastreabilidade | Toda alteração e exclusão gera uma linha no **histórico**, com valores antes e depois, quem, quando e de qual aparelho. O histórico é somente leitura para o app, e o dono **vê no app** o histórico de cada lançamento [CONFIRMADO F-09]. | Nenhuma rota permite editar ou apagar o histórico pelo app. |
| RNF-15 | Rastreabilidade | Exclusão é **lógica** (o registro fica marcado como excluído e some das telas e totais). Excluídos ficam numa **lixeira** por **90 dias**, de onde podem ser restaurados; depois somem da lixeira, mas continuam no servidor [CONFIRMADO F-09, regras na §4.4]. | Lançamento excluído não entra em saldo, mas continua no banco e no histórico. |
| RNF-16 | Backup | [CONFIRMADO F-03b] **Backup próprio semanal**: um agendador gratuito (ex.: GitHub Actions) roda `pg_dump` do banco do Supabase, **criptografa** o arquivo (dados financeiros e pessoais, LGPD) e o guarda **fora do Supabase** (ex.: armazenamento em nuvem do dono). Retenção de 3 meses (≈ 13 cópias) [SUPOSIÇÃO]. Não há backup diário do provedor (plano gratuito): no pior caso o servidor volta até 7 dias, e os lançamentos desse intervalo continuam no celular do dono, de onde podem ser reenviados. Falha do backup gera aviso por e-mail à equipe [SUPOSIÇÃO]. | Restauração de um backup num banco de teste feita pelo menos uma vez antes de entrar em produção. |
| RNF-17 | Backup | Dados ainda não sincronizados existem só no aparelho; o app avisa quando há pendências há mais de 24 h [SUPOSIÇÃO]. | Aviso exibido na tela inicial. |
| RNF-18 | Segurança | Toda chamada à API NestJS e ao PowerSync exige o token (JWT) do Supabase Auth, validado no servidor. **Toda escrita passa pelo NestJS** (ST-04); app e painel nunca gravam direto no Postgres. Credenciais do banco, chave de serviço (service_role) e chaves do PowerSync ficam **só no servidor**, nunca no app nem no painel. | Revisão de código e de configuração antes de publicar. |
| RNF-19 | Segurança | Um usuário só lê e grava dados das unidades às quais tem vínculo ativo em `usuario_unidade`, conforme o papel. Garantido em três pontos (§3.5): autorização nos casos de uso do NestJS (escrita vinda do app e, no pós-MVP, consultas do painel), sync rules do PowerSync / `pull` da API (dados que descem ao aparelho) e **RLS ligada em todas as tabelas**, sem acesso pela API pública do Supabase (defesa em profundidade). | Teste automatizado com dois usuários de unidades diferentes: nenhum enxerga nem altera dado do outro, pela API, pela sincronização ou pela API pública do Supabase. |
| RNF-20 | Segurança | As permissões são decididas pelo **papel** no vínculo usuário × unidade, nunca por regra fixa no app. No MVP só existe o papel `dono`; os papéis futuros entram como novos valores e novas políticas, sem mudar tabelas. | Adicionar um papel não exige migração de estrutura de lançamento. |
| RNF-21 | Segurança | Comunicação só por HTTPS/TLS. Senha mínima de 8 caracteres. | Configuração do Supabase Auth. |
| RNF-22 | LGPD | Dados financeiros pessoais do dono (lançamentos **Pessoal**) e dados de funcionários citados em descrições são dados pessoais. Base legal: execução de contrato / legítimo interesse do próprio titular [SUPOSIÇÃO, validar com jurídico/contador]. | Política de privacidade simples publicada com o app. |
| RNF-23 | LGPD | Banco central hospedado na região **São Paulo** do Supabase [SUPOSIÇÃO], com criptografia em repouso do provedor. | Projeto Supabase criado na região sa-east-1. |
| RNF-24 | LGPD | Minimização: o módulo não coleta CPF, telefone, placa ou nome de cliente. O campo descrição é livre; a interface orienta a não colocar dados sensíveis. | Nenhum campo de identificação pessoal no modelo de lançamento. |
| RNF-25 | LGPD | Proteção no aparelho: o app **não** tem PIN nem biometria próprios e abre direto; vale o bloqueio de tela do celular [CONFIRMADO F-10]. Recomenda-se ao dono manter o bloqueio de tela ativo. Ao sair da conta, os dados locais são apagados (com aviso se houver pendências). | Logout com pendências exige confirmação explícita. |
| RNF-26 | LGPD | Direito de exclusão: existe um procedimento administrativo (fora do app) para apagar definitivamente os dados de um titular a pedido. | Procedimento documentado antes da expansão para outros usuários. |
| RNF-27 | Manutenção | Evoluções do banco por **migrações versionadas** (SQL no repositório), tanto no Supabase quanto no banco local; sync rules do PowerSync também versionadas. | Nenhuma alteração manual de estrutura em produção. |
| RNF-29 | Painel web | Funciona em navegador de computador atualizado (Chrome, Edge, Firefox), tela a partir de 1280 px de largura [SUPOSIÇÃO]. Escopo [CONFIRMADO ST-06]: **só consulta** (Extrato, Resumo e demais leituras), sem lançar nem gerenciar cadastros; entra **depois do MVP do app** (fase pós-MVP). | Telas do painel utilizáveis em 1280 × 720. |
| RNF-30 | Painel web | **Sempre com internet**: não guarda dados no computador nem funciona offline. Sem conexão, mostra um aviso claro em vez de dados velhos. | Teste sem rede: aviso exibido, nenhuma tela com dados inconsistentes. |
| RNF-31 | Painel web | [CONFIRMADO ST-07] Usado **só pelo dono**, com a **mesma conta do app** (Supabase Auth, e-mail + senha) e as mesmas permissões por unidade. A conta é **criada pela equipe na implantação**; não há tela de cadastro ("criar conta") nem no app nem no painel, e o cadastro público do Supabase Auth fica desligado. Sessão encerrada após inatividade (ex.: 8 h) [SUPOSIÇÃO]. | O dono entra no app e no painel com a mesma senha; tentativa de criar conta pela API pública do Supabase Auth é recusada. |
| RNF-32 | Painel web | **Só lê**, e só pela API NestJS (endpoints de consulta, sem nenhum endpoint de escrita para o painel) [CONFIRMADO ST-06]; nenhuma regra de domínio no painel. Mostra os dados do servidor: lançamentos ainda pendentes no celular só aparecem depois da sincronização (o painel indica a hora da última sincronização de cada aparelho, a partir de `dispositivo.ultima_sincronizacao_em`) [SUPOSIÇÃO]. | Lançamento offline no celular aparece no painel após sincronizar. |
| RNF-33 | Painel web | Consultas do mês (extrato/resumo) respondem em ≤ 2 s com o volume da S-01 [SUPOSIÇÃO], descontada a primeira chamada após a hospedagem gratuita "dormir" (§2.1). | Medição com dados de teste do volume S-01. |

---

## 2. Stack

> Stack definida pelo dono [CONFIRMADO ST-01 a ST-05, F-03b]. Esta seção explica como as peças se encaixam; a arquitetura interna do back-end está na §9.

### 2.1 Peças e responsabilidades

| Camada | Escolha | Papel | Observações |
|---|---|---|---|
| App de celular | **React Native com Expo** (TypeScript) [CONFIRMADO ST-01] | Uso diário do dono: lançar, consultar, gerenciar categorias e tipos. Funciona **sem internet**. | Só Android, APK com instalação direta (F-03, F-04, RNF-28). EAS Build/Update. |
| Banco local no aparelho | **SQLite** (via SDK do PowerSync; ou expo-sqlite na alternativa) | Cópia local dos dados das unidades do usuário + fila de envio. | Extrato, resumo e gráfico são calculados aqui (RNF-11). |
| Painel web | **Next.js** (TypeScript) [CONFIRMADO ST-01] | Uso no computador, **só pelo dono** [CONFIRMADO ST-07]. **Só consulta** (Extrato, Resumo e leituras), **pós-MVP** [CONFIRMADO ST-06]. | Sempre online; fala só com a API NestJS (RNF-29 a RNF-33). |
| Back-end | **NestJS** com DDD, Clean Architecture e monólito modular [CONFIRMADO ST-04] | **Dono das regras de domínio**: valida e grava toda alteração vinda do app (o painel não grava, ST-06); gera histórico e eventos de domínio; no pós-MVP, atende as consultas do painel. | Detalhe na §9. |
| Banco central | **Supabase (PostgreSQL)** [CONFIRMADO ST-03; MongoDB descartado] | Fonte da verdade. Restrições (FK, `check`, índices únicos) como última linha de defesa. | Só o NestJS e o serviço de sincronização acessam o banco; a API pública do Supabase fica fechada (§3.5). |
| Autenticação | **Supabase Auth** (e-mail + senha) [SUPOSIÇÃO: mantido por ser gratuito e já integrado ao PowerSync] | Emite o token (JWT) usado pelo app, pelo painel, pelo NestJS e pelo PowerSync — **um só login** para tudo [CONFIRMADO ST-07]. Conta do dono criada pela equipe na implantação; cadastro público desligado. | O NestJS **valida** o token e decide as permissões; não há segundo cadastro de senha. |
| Sincronização | **PowerSync** (plano gratuito) se a prova de conceito aprovar; senão **sincronização própria via API NestJS** [CONFIRMADO F-03b] | Leva os dados do Postgres para o aparelho e as alterações do aparelho para o NestJS. | §2.2 e §2.3. |
| Backup | **Backup próprio semanal** (`pg_dump`) guardado fora do Supabase [CONFIRMADO F-03b] | Cópia de segurança do banco central. | RNF-16. |
| Monorepo | pnpm workspaces + Turborepo [SUPOSIÇÃO] | App, painel, API e pacotes compartilhados num só repositório. | Estrutura na §9.6. |
| Bloqueio local | **Nenhum no MVP** [CONFIRMADO F-10] | O app abre direto; vale o bloqueio de tela do celular (RNF-25). | |

**Tudo em planos gratuitos** [CONFIRMADO F-03b]. Riscos conhecidos dos planos gratuitos, a verificar na prova de conceito [SUPOSIÇÃO]: projetos gratuitos do Supabase podem ser pausados após dias sem uso (o uso diário do dono evita); o plano gratuito do PowerSync tem limites e pode desativar instâncias inativas; hospedagens gratuitas de servidor Node costumam "dormir" sem uso, gerando alguns segundos de espera no primeiro acesso (aceitável para o app, que é offline-first; pior para o painel, que é pós-MVP); e alguns planos gratuitos de hospedagem de Next.js proíbem uso comercial — conferir os termos antes de escolher (se for o caso, servir o painel no mesmo host da API). A escolha dos provedores de hospedagem da API e do painel fica para a prova de conceito do M1 [DÚVIDA técnica, não do dono].

### 2.2 Como o celular sincroniza passando pelo NestJS

#### Opção principal — PowerSync + NestJS (se a prova de conceito aprovar)

```
                (download: replicação lógica)
 ┌──────────────┐   leitura   ┌────────────────┐  stream   ┌────────────────────┐
 │   Supabase   │────────────▶│ PowerSync      │──────────▶│ App Expo (SQLite)  │
 │  (Postgres)  │             │ (plano grátis) │           │ fila de envio      │
 └──────────────┘             └────────────────┘           └─────────┬──────────┘
        ▲                                                            │ upload
        │ grava (transação: dados + histórico)                       │ POST /sync/upload
        │                                                            ▼ (JWT do usuário)
 ┌──────┴───────────────────────────────────────────────────────────────────────┐
 │ NestJS · módulo Sincronização → casos de uso do módulo Finanças (regras)      │
 └──────────────────────────────────────────────────────────────────────────────┘
```

1. **Recebimento (descer dados):** o PowerSync lê as mudanças do Postgres (replicação lógica) e entrega a cada aparelho só o que o usuário pode ver, conforme as **regras de sincronização** (sync rules) — filtradas pelo `usuario_id` do token e pelos vínculos em `usuario_unidade`. As sync rules ficam versionadas no repositório (`infra/powersync/`).
2. **Envio (subir alterações):** o SDK do PowerSync guarda cada alteração local numa fila persistente. O "conector de envio" do app manda os lotes para o endpoint **`POST /sync/upload`** do NestJS, com o JWT do usuário. **O app nunca grava direto no Postgres.**
3. **No NestJS:** o módulo Sincronização autentica, transforma cada operação da fila (inserir/alterar/excluir numa tabela) no **caso de uso** certo do módulo dono da tabela (ex.: alteração de `lancamento` que preenche `excluido_em` → `ExcluirLancamento`; que limpa → `RestaurarLancamento`; demais → `EditarLancamento`) e aplica as regras de domínio. Dados + histórico são gravados na mesma transação.
4. **Resposta:** sucesso → a operação sai da fila; erro temporário → o app tenta de novo; recusa definitiva (regra de domínio ou permissão) → o app marca como erro (§4.6). Como os ids são gerados no aparelho, reenvios são idempotentes (§4.1).
5. A alteração aceita volta ao aparelho pelo recebimento (passo 1), já com `versao` e `recebido_servidor_em` do servidor.

**Prova de conceito no início do M1** [CONFIRMADO F-03b], com critérios de aprovação [SUPOSIÇÃO]: (a) o volume do MVP (S-01) cabe no plano gratuito com folga; (b) as regras de inatividade do plano gratuito não interrompem o uso diário; (c) o upload via NestJS funciona offline → online sem perda (RNF-08); (d) a autenticação por JWT do Supabase funciona no PowerSync e no NestJS. Se algum critério falhar, usa-se a alternativa abaixo.

#### Alternativa — sincronização própria via API NestJS

| Parte | Como funciona |
|---|---|
| Banco local | `expo-sqlite` puro + query builder leve (ex.: Drizzle); tabela local `fila_envio` (§3.2) |
| Envio | `POST /sync/push`: lote de operações da fila, em ordem, com id gerado no aparelho e a `versao` de base. Mesmo tratamento do passo 3 acima (casos de uso do domínio). Resposta por operação: aceita / recusada (com motivo). |
| Recebimento | `GET /sync/pull?cursor=<n>`: devolve tudo o que mudou nas tabelas sincronizadas depois do cursor, **inclusive excluídos logicamente**, filtrado pelos vínculos do usuário. Cada tabela sincronizada ganha a coluna `seq_servidor bigint` (preenchida por uma sequência global a cada gravação, §3.1); o cursor é o maior `seq_servidor` já recebido. |
| Gatilhos e indicador | Os mesmos das §4.2 e §4.5 (automático + botão "Sincronizar"). |

### 2.3 Comparação

| Critério | Principal (PowerSync + NestJS) | Alternativa (sincronização própria via NestJS) |
|---|---|---|
| Esforço inicial | Médio: configurar PowerSync, sync rules e o endpoint de upload | Médio a alto: escrever e testar fila, reenvio, `pull` incremental e cursor (~2 a 3 semanas a mais [SUPOSIÇÃO]) |
| Manutenção | Baixa na sincronização; cada tabela nova = nova sync rule + handler de upload | Alta: cada tabela nova entra no `pull`, no `push` e no código local |
| Custo | Gratuito enquanto couber no plano gratuito do PowerSync (verificar na prova de conceito) | Gratuito (só Supabase e hospedagem da API) |
| Regras de domínio no back-end (ST-04) | Atendido: toda escrita passa pelo NestJS | Atendido: toda escrita passa pelo NestJS |
| Risco técnico | Baixo na sincronização (solução madura) | Médio: erros sutis (duplicados, perdas, ordem) aparecem com uso real |
| Risco de fornecedor / plano | Médio: limites e regras do plano gratuito podem mudar; mitigável, pois o dado mestre está no Postgres e o banco local é SQLite comum (troca para a alternativa sem mudar o modelo) | Baixo |
| Dependência da API NestJS estar acordada | Só para **enviar**; o recebimento não depende dela | Para enviar e para receber |

**Recomendação:** seguir a ordem já decidida pelo dono — prova de conceito do PowerSync no início do M1; se aprovada, usar a opção principal; se não, a alternativa. O modelo de dados (§3), as regras de sincronização (§4) e o back-end (§9) valem para as duas.

---

## 3. Modelo de dados

### 3.1 Convenções

- Chave primária: `id uuid`, **gerado no aparelho** (UUID v7, que é ordenável pelo tempo) — ver §4.1.
- Dinheiro: `bigint` em **centavos**, sempre positivo — ver §5.
- Datas/horas de sistema: `timestamptz` em UTC. Data do lançamento: `date` (sem hora) — ver §5.
- Exclusão lógica: `excluido_em timestamptz null` (nulo = ativo).
- Toda tabela sincronizada tem `criado_em`, `criado_por`, `alterado_em`, `alterado_por`, `versao`.
- Listas de valores fixos (enums) guardadas como `text` com restrição `check`, para facilitar evolução e o banco local.
- **Nome normalizado** [CONFIRMADO F-16]: `categoria`, `tipo_servico` e `tipo_veiculo` têm a coluna gerada `nome_chave text generated always as (lower(f_unaccent(btrim(nome)))) stored`, onde `f_unaccent` é uma função `immutable` que envolve a extensão `unaccent` do Postgres (necessário porque colunas geradas só aceitam funções imutáveis). Um **índice único parcial** sobre `nome_chave` (só entre os registros ativos) impede nomes repetidos que diferem só em maiúsculas, acentos ou espaços nas pontas ("água" = "Água" = "Agua" = " agua "). A mesma normalização existe no pacote compartilhado (`normalizarNome`, §9.6), usada pelo app para avisar **antes de salvar**, inclusive offline, e pelo domínio no NestJS ao criar e ao renomear. Espaços no meio do nome não são normalizados [SUPOSIÇÃO: F-16 cita só as pontas]. O app e o NestJS gravam o `nome` já sem espaços nas pontas.
- Para a **alternativa de sincronização** (§2.2), toda tabela sincronizada ganha `seq_servidor bigint`, preenchida pelo back-end a cada gravação a partir de uma sequência global; não é necessária com PowerSync.
- Cada módulo do back-end é dono das suas tabelas, organizadas num **schema Postgres por módulo** (`identidade`, `financas`; futuros: `estoque`, `atendimento`, `clientes`, `equipe`) [SUPOSIÇÃO, §9.2]. Os nomes de tabela deste documento ficam sem o prefixo do schema.

### 3.2 Entidades

#### organizacao [SUPOSIÇÃO]
Agrupa as unidades de um mesmo dono. Não foi pedida pelo dono; foi incluída para que categorias, tipos de serviço e formas de pagamento sejam "comuns a todas as unidades" (suposição da visão) sem ficarem soltas, e para o sistema poder atender outro lava-jato no futuro. No MVP existe uma só.

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK |
| nome | text | obrigatório |
| criado_em / alterado_em | timestamptz | automático |

#### unidade
[CONFIRMADO F-08] As unidades são cadastradas pela equipe na implantação (dados iniciais, por script de migração/seed). Não há tela de cadastro de unidade no MVP.

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK |
| organizacao_id | uuid | FK → organizacao |
| nome | text | obrigatório, único na organização |
| fuso_horario | text | padrão `America/Sao_Paulo` |
| ativa | boolean | padrão true |
| criado_em, criado_por, alterado_em, alterado_por | | auditoria |

#### usuario
Perfil do usuário; o login fica em `auth.users` do Supabase, com o mesmo `id`. [CONFIRMADO ST-07] A conta do dono (login no Supabase Auth + linha em `usuario` + vínculos em `usuario_unidade` com papel `dono`) é **criada pela equipe na implantação**, junto com os dados iniciais (F-08); não há autocadastro.

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK = `auth.users.id` |
| nome | text | obrigatório |
| email | text | cópia do login, para exibição |
| ativo | boolean | padrão true |
| criado_em, alterado_em | timestamptz | |

#### usuario_unidade (vínculo e papel)
| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK |
| usuario_id | uuid | FK → usuario |
| unidade_id | uuid | FK → unidade |
| papel | text | `dono` no MVP; reservados: `gerente`, `funcionario` |
| ativo | boolean | padrão true |
| criado_em, criado_por, alterado_em, alterado_por | | auditoria |
| | | único (usuario_id, unidade_id) |

#### categoria
| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK |
| organizacao_id | uuid | FK → organizacao |
| tipo | text | `entrada` \| `saida` |
| nome | text | obrigatório; único por (organização, tipo) entre as ativas, comparando `nome_chave` [CONFIRMADO F-16] |
| nome_chave | text | gerada: `lower(f_unaccent(btrim(nome)))` (§3.1) |
| icone | text | nome do ícone (catálogo definido em 02-design.md) |
| cor | text | hex `#RRGGBB` |
| aplica_a | text | `ambos` (padrão) \| `pessoal` \| `empresa` — **reservado** até a dúvida 13 da visão ser respondida |
| sistema | boolean | true para as **quatro** categorias fixas do sistema, usadas por código pelos outros módulos: "Serviços", "Produtos", "Mão de obra" e "Reembolso" [CONFIRMADO E2-02]. Podem ser renomeadas (nome, ícone e cor), mas **não podem ser desativadas** [CONFIRMADO F-06]; o app esconde a opção de desativar e o back-end recusa `ativa = false` quando `sistema = true` (regra do agregado `Categoria`, §9.3). O dono pode criar categorias novas, que nascem com `sistema = false` [CONFIRMADO E2-02] |
| codigo | text | identificador fixo das categorias de sistema: `servicos`, `produtos`, `mao_de_obra`, `reembolso`; nulo nas criadas pelo dono; único por organização. Usado pelas regras (ex.: "entrada de serviço" = categoria `servicos`), porque o nome pode ser renomeado [SUPOSIÇÃO] |
| ordem | int | posição na grade de ícones |
| ativa | boolean | desativar esconde da escolha, mas mantém os lançamentos antigos |
| auditoria + versao | | |

#### tipo_servico
| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK |
| organizacao_id | uuid | FK → organizacao |
| nome | text | obrigatório, único entre os ativos comparando `nome_chave` [CONFIRMADO F-16] [CONFIRMADO: só o nome, sem preço]. Iniciais [CONFIRMADO F-14]: Lavagem rápida · Lavagem completa · Polimento · Higienização interna · Cristalização |
| nome_chave | text | gerada: `lower(f_unaccent(btrim(nome)))` (§3.1) |
| ordem | int | |
| ativo | boolean | |
| auditoria + versao | | |

#### tipo_veiculo
Categoria do veículo atendido (01-visao.md, item 3b-1 [CONFIRMADO]). É só a categoria: placa, modelo e cliente ficam fora do escopo.

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK, gerado no aparelho (pode ser criado direto no lançamento, "+ Novo veículo" [SUPOSIÇÃO da visão]) |
| organizacao_id | uuid | FK → organizacao |
| nome | text | obrigatório, único entre os ativos comparando `nome_chave` [CONFIRMADO F-16]; lista editável pelo dono, só com o nome [SUPOSIÇÃO da visão]. Iniciais: Carro · Moto · SUV · Caminhonete/Picape · Van [CONFIRMADO E2-07] |
| nome_chave | text | gerada: `lower(f_unaccent(btrim(nome)))` (§3.1) |
| icone | text | nome do ícone do catálogo do 02-design.md; preenchido com ícone próprio nos tipos iniciais; nos criados pelo dono, valor padrão = ícone genérico [SUPOSIÇÃO] |
| ordem | int | |
| ativo | boolean | desativar esconde da escolha, mas mantém os lançamentos antigos |
| auditoria + versao | | |

[CONFIRMADO E2-05] A lista de tipos de veículo é a mesma em todas as unidades: por isso a tabela pertence à `organizacao`, não à unidade. Cada lançamento de serviço pertence a **uma única unidade** (`lancamento.unidade_id`, obrigatório), aparece só nessa unidade e é somado no total geral (consolidado da organização). A placa não é registrada no MVP. O modelo já atende sem mudanças.

#### forma_pagamento
[CONFIRMADO F-08] As formas de pagamento são cadastradas pela equipe na implantação (dados iniciais). Não há tela de cadastro de forma de pagamento no MVP.

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK |
| organizacao_id | uuid | FK → organizacao |
| nome | text | iniciais [CONFIRMADO F-12]: Dinheiro, Pix, Cartão de débito, Cartão de crédito (todas disponíveis). Pré-seleção no lançamento: ver `config_local` |
| ordem | int | |
| ativa | boolean | |
| auditoria + versao | | |

#### lancamento
| Campo | Tipo | Obrig. | Regra |
|---|---|---|---|
| id | uuid | sim | PK, gerado no aparelho |
| unidade_id | uuid | sim | FK → unidade. Obrigatório em todo lançamento, **inclusive Pessoal** [CONFIRMADO F-05] |
| tipo | text | sim | `entrada` \| `saida` |
| natureza | text | sim | `empresa` \| `pessoal`; o app preenche com `preferencia_usuario.natureza_padrao` (SUP-D11 do 02-design.md: "Empresa", trocável em Ajustes) |
| valor_centavos | bigint | sim | > 0; o sinal vem do `tipo` |
| data_lancamento | date | sim | dia em que o dinheiro entrou/saiu; padrão = hoje no fuso da unidade |
| categoria_id | uuid | sim | FK → categoria; `categoria.tipo` deve ser igual a `lancamento.tipo`. Na edição, não pode trocar entre a categoria "Serviços" (`codigo = servicos`) e outra categoria [CONFIRMADO F-13] |
| tipo_servico_id | uuid | não | FK → tipo_servico. **Opcional nas entradas da categoria "Serviços"**; nulo em saídas e nas demais entradas [CONFIRMADO E2-04 a)]. Entrada de serviço sem tipo de serviço aparece como "Sem tipo de serviço" no Resumo e no filtro do Extrato [SUPOSIÇÃO] |
| tipo_veiculo_id | uuid | condicional | FK → tipo_veiculo. **Obrigatório nas entradas da categoria "Serviços"**; nulo em saídas e nas demais entradas [CONFIRMADO E2-04 a)]. "Entrada de serviço" = lançamento com `tipo = entrada` e categoria de `codigo = servicos` (não depende de o tipo de serviço estar preenchido). Validação: no app antes de salvar e no back-end, no agregado `Lancamento` (§9.3), que é a regra que vale [CONFIRMADO ST-04] |
| forma_pagamento_id | uuid | sim [SUPOSIÇÃO] | FK → forma_pagamento |
| descricao | text | não | até 200 caracteres [SUPOSIÇÃO] |
| situacao | text | sim | `realizado` (único valor usado no MVP) \| `previsto` — **reservado** para contas futuras (PIF-06) |
| origem | text | sim | `manual` (MVP) \| reservados: `atendimento`, `estoque`, `equipe`, `contas` |
| origem_ref_tabela | text | não | nome da entidade de origem (ex.: `atendimento`) |
| origem_ref_id | uuid | não | id do registro de origem |
| dispositivo_id | uuid | sim | aparelho que criou |
| criado_em | timestamptz | sim | hora do aparelho no momento da criação |
| criado_por | uuid | sim | FK → usuario |
| alterado_em | timestamptz | sim | hora do aparelho na última alteração |
| alterado_por | uuid | sim | FK → usuario |
| recebido_servidor_em | timestamptz | não | preenchido pelo servidor ao receber |
| versao | int | sim | começa em 1; +1 a cada alteração aceita pelo servidor |
| excluido_em | timestamptz | não | exclusão lógica |
| excluido_por | uuid | não | FK → usuario |

**Edição não troca o tipo** [CONFIRMADO F-13]: numa alteração, `tipo` (entrada/saída) não muda, e uma entrada de serviço (categoria `servicos`) não vira outra entrada nem o contrário. Para mudar, o dono exclui e lança de novo. Validação em dois pontos: o app não oferece essas trocas na tela de edição, e o back-end recusa a alteração no agregado `Lancamento` (compara o estado atual com o pedido: `tipo` diferente, ou categoria antiga e nova com "é `servicos`" diferente → erro). Uma recusa dessas cai em "Recusado (dados)" da §4.6. Trocar entre outras categorias do mesmo tipo continua permitido.

Índices: (unidade_id, data_lancamento), (unidade_id, categoria_id, data_lancamento), (unidade_id, tipo_veiculo_id, data_lancamento) para o resumo por tipo de veículo [SUPOSIÇÃO da visão], (origem_ref_tabela, origem_ref_id).

#### lancamento_historico
Escrito **só pelo back-end NestJS**, na **mesma transação** da alteração, a partir dos eventos de domínio do agregado `Lancamento` (§9.4), a cada criação, alteração, exclusão e restauração aceita. Somente leitura para o app e o painel.

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK (gerado no servidor) |
| lancamento_id | uuid | FK → lancamento |
| acao | text | `criacao` \| `alteracao` \| `exclusao` \| `restauracao` |
| dados_antes | jsonb | nulo na criação |
| dados_depois | jsonb | |
| campos_alterados | text[] | |
| alterado_por | uuid | FK → usuario |
| alterado_em | timestamptz | hora do aparelho |
| dispositivo_id | uuid | |
| recebido_servidor_em | timestamptz | hora do servidor |
| conflito | boolean | true quando a alteração foi feita sobre uma versão desatualizada (ver §4.3) |

[SUPOSIÇÃO] O mesmo padrão de histórico pode ser aplicado depois a categoria, tipo_servico e forma_pagamento; no MVP, essas tabelas têm só os campos de auditoria.

#### dispositivo
| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK, gerado na instalação |
| usuario_id | uuid | FK → usuario |
| nome | text | ex.: "Moto G do dono" |
| ultima_sincronizacao_em | timestamptz | |
| criado_em | timestamptz | |

#### preferencia_usuario
Preferências do usuário que valem em todos os aparelhos dele. Usada pela opção "Padrão Pessoal/Empresa" da TELA-09 (Mais / Ajustes) do 02-design.md.

[SUPOSIÇÃO] A preferência é **sincronizada** (não fica só em `config_local`): o dono pode usar mais de um aparelho e, se trocar o padrão em um, espera o mesmo comportamento no outro; deixar só no aparelho faria um celular lançar como "Empresa" e outro como "Pessoal" sem o dono perceber, o que contamina o saldo da empresa. A preferência é por usuário (não por unidade), porque a visão não diferencia o padrão por unidade.

| Campo | Tipo | Regra |
|---|---|---|
| usuario_id | uuid | PK e FK → usuario (uma linha por usuário) |
| natureza_padrao | text | `empresa` (padrão, SUP-D11) \| `pessoal` |
| alterado_em | timestamptz | hora do aparelho |
| versao | int | conflito entre aparelhos: vale a última alteração que chega ao servidor (mesma regra da §4.3) |

Novas preferências sincronizadas entram como novas colunas nesta tabela.

#### Tabelas só no aparelho (não sincronizadas)
- **fila_envio** (somente na alternativa simples; no PowerSync é interna): id, tabela, registro_id, operacao, dados, criado_em, tentativas, ultimo_erro, estado (`pendente` \| `enviando` \| `erro`).
- **config_local**: unidade atual; última forma de pagamento usada, que vem pré-selecionada no próximo lançamento — quando ainda não há nenhuma (primeiro lançamento), o app marca **Pix** [CONFIRMADO F-12]; último tipo de serviço e tipo de veículo usados (atalho "repetir último serviço" [SUPOSIÇÃO]; o último veículo usado vem pré-selecionado [CONFIRMADO E2-06]), período escolhido no Extrato/Resumo, que vale junto para as duas telas [CONFIRMADO E2-10], marcador da última sincronização. O padrão Pessoal/Empresa **não** fica aqui: está em `preferencia_usuario`, que é sincronizada.

### 3.3 Relacionamentos

- organizacao 1—N unidade, categoria, tipo_servico, tipo_veiculo, forma_pagamento.
- usuario N—N unidade, por meio de usuario_unidade (com papel).
- unidade 1—N lancamento.
- categoria 1—N lancamento; tipo_servico 1—N lancamento (opcional); tipo_veiculo 1—N lancamento (só entradas de serviço); forma_pagamento 1—N lancamento.
- lancamento 1—N lancamento_historico.
- usuario 1—N dispositivo; dispositivo 1—N lancamento.
- usuario 1—1 preferencia_usuario.

### 3.4 Diagrama (formato dbdiagram.io)

```dbml
Table organizacao {
  id uuid [pk]
  nome text [not null]
  criado_em timestamptz
  alterado_em timestamptz
}

Table unidade {
  id uuid [pk]
  organizacao_id uuid [not null, ref: > organizacao.id]
  nome text [not null]
  fuso_horario text [not null, default: 'America/Sao_Paulo']
  ativa boolean [not null, default: true]
  criado_em timestamptz
  criado_por uuid [ref: > usuario.id]
  alterado_em timestamptz
  alterado_por uuid [ref: > usuario.id]
}

Table usuario {
  id uuid [pk, note: 'igual a auth.users.id']
  nome text [not null]
  email text
  ativo boolean [not null, default: true]
  criado_em timestamptz
  alterado_em timestamptz
}

Table usuario_unidade {
  id uuid [pk]
  usuario_id uuid [not null, ref: > usuario.id]
  unidade_id uuid [not null, ref: > unidade.id]
  papel text [not null, note: 'dono | gerente | funcionario']
  ativo boolean [not null, default: true]
  criado_em timestamptz
  criado_por uuid
  alterado_em timestamptz
  alterado_por uuid
  indexes { (usuario_id, unidade_id) [unique] }
}

Table categoria {
  id uuid [pk]
  organizacao_id uuid [not null, ref: > organizacao.id]
  tipo text [not null, note: 'entrada | saida']
  nome text [not null]
  nome_chave text [note: 'gerada: lower(f_unaccent(btrim(nome)))']
  icone text
  cor text
  aplica_a text [not null, default: 'ambos', note: 'reservado: ambos | pessoal | empresa']
  sistema boolean [not null, default: false]
  codigo text [note: 'servicos | produtos | mao_de_obra | reembolso; nulo nas criadas pelo dono']
  ordem int
  ativa boolean [not null, default: true]
  versao int [not null, default: 1]
  criado_em timestamptz
  criado_por uuid
  alterado_em timestamptz
  alterado_por uuid
  indexes {
    (organizacao_id, tipo, nome_chave) [unique, note: 'parcial: where ativa (F-16)']
    (organizacao_id, codigo) [unique, note: 'parcial: where codigo is not null']
  }
}

Table tipo_servico {
  id uuid [pk]
  organizacao_id uuid [not null, ref: > organizacao.id]
  nome text [not null]
  nome_chave text [note: 'gerada: lower(f_unaccent(btrim(nome)))']
  ordem int
  ativo boolean [not null, default: true]
  versao int [not null, default: 1]
  criado_em timestamptz
  criado_por uuid
  alterado_em timestamptz
  alterado_por uuid
  indexes {
    (organizacao_id, nome_chave) [unique, note: 'parcial: where ativo (F-16)']
  }
}

Table tipo_veiculo {
  id uuid [pk]
  organizacao_id uuid [not null, ref: > organizacao.id]
  nome text [not null]
  nome_chave text [note: 'gerada: lower(f_unaccent(btrim(nome)))']
  icone text [not null, note: 'catálogo do 02-design.md; padrão = ícone genérico nos criados pelo dono']
  ordem int
  ativo boolean [not null, default: true]
  versao int [not null, default: 1]
  criado_em timestamptz
  criado_por uuid
  alterado_em timestamptz
  alterado_por uuid
  indexes {
    (organizacao_id, nome_chave) [unique, note: 'parcial: where ativo (F-16)']
  }
}

Table forma_pagamento {
  id uuid [pk]
  organizacao_id uuid [not null, ref: > organizacao.id]
  nome text [not null]
  ordem int
  ativa boolean [not null, default: true]
  versao int [not null, default: 1]
  criado_em timestamptz
  criado_por uuid
  alterado_em timestamptz
  alterado_por uuid
}

Table dispositivo {
  id uuid [pk]
  usuario_id uuid [not null, ref: > usuario.id]
  nome text
  ultima_sincronizacao_em timestamptz
  criado_em timestamptz
}

Table preferencia_usuario {
  usuario_id uuid [pk, ref: - usuario.id]
  natureza_padrao text [not null, default: 'empresa', note: 'empresa | pessoal']
  alterado_em timestamptz
  versao int [not null, default: 1]
}

Table lancamento {
  id uuid [pk, note: 'UUID v7 gerado no aparelho']
  unidade_id uuid [not null, ref: > unidade.id]
  tipo text [not null, note: 'entrada | saida']
  natureza text [not null, default: 'empresa', note: 'empresa | pessoal']
  valor_centavos bigint [not null, note: '> 0']
  data_lancamento date [not null]
  categoria_id uuid [not null, ref: > categoria.id]
  tipo_servico_id uuid [ref: > tipo_servico.id, note: 'opcional em entradas da categoria servicos; nulo nas demais']
  tipo_veiculo_id uuid [ref: > tipo_veiculo.id, note: 'obrigatório em entradas da categoria servicos; nulo nas demais']
  forma_pagamento_id uuid [not null, ref: > forma_pagamento.id]
  descricao text
  situacao text [not null, default: 'realizado', note: 'realizado | previsto (reservado)']
  origem text [not null, default: 'manual']
  origem_ref_tabela text
  origem_ref_id uuid
  dispositivo_id uuid [not null, ref: > dispositivo.id]
  criado_em timestamptz [not null]
  criado_por uuid [not null, ref: > usuario.id]
  alterado_em timestamptz [not null]
  alterado_por uuid [not null, ref: > usuario.id]
  recebido_servidor_em timestamptz
  versao int [not null, default: 1]
  excluido_em timestamptz
  excluido_por uuid [ref: > usuario.id]
  indexes {
    (unidade_id, data_lancamento)
    (unidade_id, categoria_id, data_lancamento)
    (unidade_id, tipo_veiculo_id, data_lancamento)
    (origem_ref_tabela, origem_ref_id)
  }
}

Table lancamento_historico {
  id uuid [pk]
  lancamento_id uuid [not null, ref: > lancamento.id]
  acao text [not null, note: 'criacao | alteracao | exclusao | restauracao']
  dados_antes jsonb
  dados_depois jsonb
  campos_alterados "text[]"
  alterado_por uuid [ref: > usuario.id]
  alterado_em timestamptz
  dispositivo_id uuid
  recebido_servidor_em timestamptz
  conflito boolean [not null, default: false]
}
```

### 3.5 Segurança e permissões

#### Onde fica cada coisa

| Assunto | Onde fica | Como |
|---|---|---|
| **Autenticação** (quem é você) | **Supabase Auth** emite o JWT; **NestJS** e **PowerSync** o validam | App e painel fazem login por e-mail + senha no Supabase Auth e recebem o token. O NestJS valida assinatura e validade do token em toda chamada (guard global) e carrega o `usuario` e seus vínculos ativos. O PowerSync valida o mesmo token (integração com Supabase Auth). Não existe login próprio no NestJS. **Sem autocadastro** [CONFIRMADO ST-07]: o cadastro público do Supabase Auth fica desligado e a conta é criada pela equipe na implantação; app e painel só têm a tela de entrar. |
| **Autorização** (o que você pode fazer) | **NestJS**, camada de aplicação | Antes de cada caso de uso, a política de acesso do módulo Identidade e Acesso (§9.2) confere `tem_papel(usuario, unidade, papeis)` a partir de `usuario_unidade`. No MVP só existe `dono`; novos papéis entram como novas regras nessa política, sem mudar tabelas (RNF-20). |
| **Regras de domínio** (o que é válido) | **NestJS**, camada de domínio (agregados, §9.3) [CONFIRMADO ST-04] | Valor > 0, data não futura, coerência categoria × tipo, regra serviço × veículo (E2-04), edição não troca o tipo (F-13), categoria de sistema não desativa (F-06), nome único normalizado (F-16), lixeira de 90 dias (F-09). O app repete as mesmas validações (pacote compartilhado) só para avisar o dono antes de salvar, inclusive offline; **a decisão que vale é a do back-end**. |
| **O que desce para o aparelho** | **Sync rules do PowerSync** (ou `GET /sync/pull` na alternativa) | Filtradas pelo `usuario_id` do token: unidades com vínculo ativo, lançamentos e histórico dessas unidades, cadastros da organização, a própria `preferencia_usuario`. |
| **RLS** | **Postgres (Supabase)**, como defesa em profundidade | **RLS ligada em todas as tabelas, sem nenhuma política para os papéis `anon` e `authenticated`**: quem tentar usar a API pública do Supabase (PostgREST) com a chave anônima não lê nem grava nada. O NestJS conecta com um papel próprio do Postgres (ex.: `api_lavajato`, com `BYPASSRLS` e permissões só nos schemas dos módulos), usado só no servidor; o PowerSync conecta com um papel só de leitura para replicação. |
| **Restrições no banco** | **Postgres** | FK, `check` (enums, `valor_centavos > 0`), `not null` e índices únicos (inclusive `nome_chave`, F-16) continuam no banco como última barreira, mesmo que o domínio já tenha validado. |

#### Regras de autorização do MVP (implementadas no NestJS e refletidas nas sync rules)

- `tem_papel(unidade_id, papeis[])`: verdadeiro se existe `usuario_unidade` ativo com o usuário do token, a unidade informada e papel na lista.
- **lancamento**: ler/criar/editar/excluir/restaurar se `tem_papel(unidade_id, {dono})`. Na expansão, `gerente` entra na lista para sua unidade. **Nenhum caso de uso de exclusão física** (só exclusão lógica). Na criação, `criado_por` é sempre o usuário do token (o valor vindo do aparelho é conferido).
- **categoria, tipo_servico, tipo_veiculo, forma_pagamento**: ler se o usuário tem vínculo com alguma unidade da organização; criar e alterar só papel `dono` (no MVP o dono cria tipo de veículo também direto no lançamento). Sem exclusão física: só desativar. No MVP, formas de pagamento vêm dos dados iniciais [CONFIRMADO F-08].
- **lancamento.tipo_veiculo_id / tipo_servico_id / categoria_id / forma_pagamento_id**: o back-end recusa referências de outra organização.
- **unidade, usuario_unidade**: ler as próprias; alterar só `dono` (telas de gestão ficam para a expansão). No MVP, unidades entram pelos dados iniciais da implantação [CONFIRMADO F-08].
- **preferencia_usuario**: cada usuário lê e altera só a própria linha.
- **lancamento_historico**: leitura se o usuário tem papel `dono` na unidade do lançamento [CONFIRMADO F-09: o dono vê o histórico no app]. Nenhum caso de uso grava ou apaga histórico por pedido do cliente; só o próprio back-end, junto com a alteração.
- [DÚVIDA 11 da visão] Quando houver gerentes, lançamentos `pessoal` poderão ter regra extra (ex.: só o criador ou o dono veem). O campo `natureza` já permite isso sem mudar tabelas.

---

## 4. Sincronização

### 4.1 Geração de IDs no aparelho
- Todo registro criado no celular recebe um **UUID v7** gerado ali mesmo. Não há chance prática de colisão entre aparelhos e o servidor aceita o id como chave.
- Como o id existe desde a criação, reenviar o mesmo lançamento (por queda de rede no meio do envio) **não duplica**: o servidor faz "inserir ou ignorar se já existe" (idempotência).
- Cada instalação do app gera um `dispositivo_id` e o registra na primeira sincronização.

### 4.2 Fila de envio
1. Ao salvar, o app grava o lançamento no SQLite **e** uma operação na fila de envio, na mesma transação (ou tudo ou nada).
2. O envio processa a fila **em ordem**, em lotes pequenos, para a API NestJS (`POST /sync/upload` com PowerSync, ou `POST /sync/push` na alternativa — §2.2), com o token do usuário. O NestJS autoriza e aplica as regras de domínio a cada operação.
3. Operação confirmada pelo servidor sai da fila. Falha temporária (sem rede, tempo esgotado, servidor fora) mantém a operação e tenta de novo com espera crescente (5 s, 15 s, 1 min, 5 min… até 30 min) [SUPOSIÇÃO].
4. Recebimento (pelo PowerSync, ou por `GET /sync/pull` na alternativa): o app recebe tudo o que mudou desde o último marcador (inclusive registros excluídos logicamente), aplica no SQLite e avança o marcador. Alterações locais ainda pendentes **não** são sobrescritas pelo recebimento até serem enviadas.
5. Gatilhos: salvar lançamento, abrir o app, voltar a ter conexão, a cada ~5 min com o app aberto e o botão "Sincronizar" (RNF-05, RNF-06).

### 4.3 Mesmo lançamento editado em dois aparelhos offline
**No MVP há um só aparelho** [CONFIRMADO F-15]: o dono usa um celular, então não há edição concorrente e a tela/aviso de conflito (FIN-US-07.7) sai do MVP e vai para a **v1.1**. Continuam no MVP, no servidor, a `versao` de cada registro e o `lancamento_historico` (com o campo `conflito`), para proteger uma troca futura de aparelho e para a v1.1 entrar sem mudar o modelo.

Regra para a evolução (v1.1), quando houver mais de um aparelho [SUPOSIÇÃO]: **vale a alteração que chegar por último ao servidor, registro inteiro** ("última gravação vence"), **sem perder nada**:
- Cada alteração enviada leva a `versao` em que o aparelho se baseou.
- Se o servidor está numa versão mais nova (o outro aparelho já enviou), a alteração é aplicada mesmo assim, mas o histórico marca `conflito = true` e guarda os dois estados (antes e depois).
- O app mostra um aviso discreto no lançamento: "Este lançamento foi alterado em outro aparelho. Ver histórico." O dono pode, pelo histórico, voltar aos valores anteriores com um toque [SUPOSIÇÃO].
- Por que não mesclar campo a campo: no MVP há um só usuário e o caso é raro; a regra simples é previsível e o histórico garante que nada se perde.
- Comparar pela hora do aparelho foi descartado porque os relógios dos celulares podem estar errados.

### 4.4 Exclusões
- Excluir = preencher `excluido_em` e `excluido_por` (exclusão lógica); é sincronizada como uma alteração comum.
- **Excluir vence editar** [SUPOSIÇÃO]: se um aparelho exclui e outro edita offline, o lançamento continua excluído; a edição fica registrada no histórico com `conflito = true`.
- Lançamentos excluídos não entram em extrato, saldo, resumo nem gráfico.
- **Lixeira** [CONFIRMADO F-09]:
  - Lista os lançamentos com `excluido_em` preenchido **nos últimos 90 dias** (`excluido_em >= agora − 90 dias`), do mais recente para o mais antigo, a partir do banco local (funciona offline, porque o recebimento já traz os excluídos).
  - **Restaurar** = limpar `excluido_em` e `excluido_por` e gravar `alterado_em`/`alterado_por`; sincroniza como uma alteração comum. O back-end recebe a operação, reconhece a passagem de "excluído" para "ativo", executa o caso de uso `RestaurarLancamento` e grava `acao = restauracao` no histórico. O lançamento volta com os mesmos dados e o mesmo `id`.
  - Depois de 90 dias o item **some da lixeira** (não pode mais ser restaurado pelo app), mas o registro e o histórico **continuam no servidor** (exclusão lógica). O servidor também recusa restauração de item excluído há mais de 90 dias [SUPOSIÇÃO], pela hora do servidor.
  - Não há "esvaziar lixeira" nem exclusão definitiva pelo app [SUPOSIÇÃO].
- **Histórico no app** [CONFIRMADO F-09]: `lancamento_historico` é baixado para o aparelho como tabela **somente leitura** [SUPOSIÇÃO], para o dono ver o histórico de cada lançamento mesmo offline. Alterações feitas no aparelho e ainda não enviadas aparecem como "pendente de envio" até o servidor gravar a linha do histórico.
- Apagar de verdade (físico) só por procedimento administrativo (LGPD, RNF-26).

### 4.5 Indicador de pendências
| Estado | Quando | O que o dono vê |
|---|---|---|
| Sincronizado | Fila vazia e último recebimento ok | ícone de nuvem com ✓ e "Atualizado às 14:32" |
| Pendente | Fila com itens e há internet | "Enviando 3…" |
| Sem internet | Fila com itens e sem conexão | "3 lançamentos guardados no celular — serão enviados quando houver internet" |
| Erro | Alguma operação recusada de forma definitiva | ícone de alerta e "1 lançamento não pôde ser enviado — toque para ver" |

Cada lançamento ainda não enviado tem uma marca discreta na lista do extrato. A aparência final fica a cargo de 02-design.md.

### 4.6 Tratamento de erro
| Tipo de erro | Exemplo | Ação |
|---|---|---|
| Temporário | Sem rede, tempo esgotado, servidor indisponível | Fica na fila, nova tentativa automática com espera crescente |
| Sessão expirada | Token vencido | Renova o token sozinho; se não der, pede login **sem apagar** a fila |
| Recusado (permissão) | O back-end negou (HTTP 403; ex.: vínculo com a unidade foi removido) | Marca como erro, mostra ao dono, mantém o dado no aparelho; nunca descarta sozinho |
| Recusado (dados) | Regra de domínio violada no back-end (HTTP 422; ex.: categoria inexistente, nome repetido F-16, troca de tipo F-13) | Marca como erro com a mensagem; o dono pode corrigir e reenviar ou descartar (descartar pede confirmação) |
| Defeito do app | Erro inesperado | Registra em log local para suporte; a fila continua com os demais itens |

Uma operação com erro definitivo não trava as outras, exceto as que dependem dela (ex.: alteração de um lançamento cuja criação falhou).

---

## 5. Regras de valores e datas

### 5.1 Dinheiro
- Armazenado como **inteiro em centavos** (`bigint`), nunca como número com vírgula (ponto flutuante), para evitar erros de arredondamento nas somas. Ex.: R$ 35,50 → `3550`.
- `valor_centavos` é **sempre positivo**; se é entrada ou saída vem do campo `tipo`. Saldo = soma das entradas − soma das saídas.
- Moeda única: real (BRL) [SUPOSIÇÃO da visão]. Não há campo de moeda no MVP.
- Digitação [CONFIRMADO DU-03, E2-03; detalhe em 02-design.md §5.4]: estilo **caixa registradora** — os dígitos entram pela direita, nos centavos (digitar `2` e `5` mostra `R$ 0,25`), e segurar a tecla apagar (⌫) zera o valor. Assim o valor já nasce em **centavos inteiros, sem arredondamento**, e é gravado direto em `valor_centavos`.
- Valor mínimo: R$ 0,01. Valor máximo por lançamento: R$ 999.999,99 [SUPOSIÇÃO], como proteção contra erro de digitação; acima de R$ 10.000,00 o app pede confirmação [SUPOSIÇÃO].
- Arredondamento só existe em cálculos derivados (ex.: percentual por categoria no gráfico, média por carro): calcular em centavos e arredondar só para exibir, meia unidade para cima. Totais exibidos são sempre somas exatas dos centavos.
- Exibição sempre no formato brasileiro: `R$ 1.234,56`.

### 5.2 Datas e fuso horário
| Campo | O que significa | Tipo | Quem define |
|---|---|---|---|
| `data_lancamento` | **Dia em que o dinheiro entrou ou saiu.** É a data usada no extrato, nos totais do dia/mês e nos gráficos. | `date` (sem hora) | O dono; padrão = hoje |
| `criado_em` | Momento em que o registro foi feito no app | `timestamptz` (UTC) | Relógio do aparelho |
| `alterado_em` | Momento da última alteração | `timestamptz` (UTC) | Relógio do aparelho |
| `recebido_servidor_em` | Momento em que o servidor recebeu | `timestamptz` (UTC) | Relógio do servidor (confiável) |

- "Hoje" é calculado no **fuso horário da unidade** (`unidade.fuso_horario`, padrão `America/Sao_Paulo`), não no do aparelho. Isso evita que um lançamento feito às 23h30 caia no dia seguinte por causa de UTC.
- `data_lancamento` não tem hora, então nunca muda de dia por causa de fuso.
- Lançar em **data passada** é permitido (ex.: gasto de ontem esquecido). Limite para trás: sem limite no MVP [SUPOSIÇÃO].
- Lançar em **data futura** é bloqueado, porque o módulo só registra o realizado (D-01) [SUPOSIÇÃO de regra derivada]. Quando `situacao = previsto` for ativada (PIF-06), essa regra muda só para esse tipo.
- Atalho "Semana" = semana atual, de **segunda-feira até hoje** [CONFIRMADO E2-09]; mês = mês civil.
- Horas de sistema (UTC) são exibidas convertidas para o horário local.

---

## 6. Pontos de integração futura

Resumo do que este módulo **expõe**; o detalhe será definido em cada módulo futuro.

### 6.1 Entidades expostas
| Entidade | Uso pelos módulos futuros |
|---|---|
| `unidade`, `usuario`, `usuario_unidade` | Cadastro comum de unidades, usuários e papéis do sistema todo (PIF-05) |
| `tipo_servico` | Passa a ser o catálogo de serviços do atendimento/fila (PIF-01) |
| `tipo_veiculo` | Passa a ser a referência de categoria de veículo dos módulos de atendimento e clientes (PIF-01, PIF-04): o veículo do cliente, com placa e modelo, terá um `tipo_veiculo_id` apontando para esta lista |
| `categoria` (com `sistema = true` para "Serviços", "Produtos", "Mão de obra", "Reembolso") | Categorias usadas pelos módulos que geram lançamentos automaticamente; os módulos as localizam pelo `codigo`, pois podem ser renomeadas, mas nunca desativadas [CONFIRMADO F-06] |
| `forma_pagamento` | Mesma lista no atendimento e em contas a pagar |
| `lancamento` com `origem` + `origem_ref_tabela` + `origem_ref_id` | Outros módulos **criam** lançamentos apontando para o registro que os originou, sem mudar o modelo |
| `lancamento.situacao` | Contas a pagar/receber usam `previsto` → `realizado` (PIF-06) |

### 6.2 Eventos
O módulo publica, no back-end, os **eventos de domínio** abaixo, emitidos pelos agregados do módulo Finanças (§9.4). Dentro do monólito modular, os outros módulos os recebem pelo barramento de eventos interno do NestJS; nenhum módulo lê as tabelas de outro.

| Evento | Quem pode se interessar |
|---|---|
| `lancamento.criado` | Painéis, relatórios, futuros alertas |
| `lancamento.alterado` | Módulo de origem (ex.: atendimento saber que o valor foi corrigido) |
| `lancamento.excluido` / `lancamento.restaurado` | Módulo de origem, para manter consistência |
| `tipo_servico.alterado` | Atendimento/fila |
| `tipo_veiculo.alterado` | Atendimento/fila, Clientes |
| `categoria.alterada` | Relatórios |

### 6.3 Como cada módulo futuro se liga
| ID | Módulo | Ligação prevista |
|---|---|---|
| PIF-01 | Atendimento/fila | Serviço pago gera `lancamento` (entrada, categoria "Serviços", `tipo_veiculo_id` copiado do veículo atendido — obrigatório —, `tipo_servico_id` quando houver, `origem = atendimento`, `origem_ref_id` = atendimento). O lançamento manual carro por carro continua possível. |
| PIF-02 | Estoque | Compra de produto gera `lancamento` (saída, categoria "Produtos", `origem = estoque`). |
| PIF-03 | Equipe | Pagamento de mão de obra/reembolso gera `lancamento` com `origem = equipe`; o vínculo com o funcionário fica no módulo de equipe (referência de origem), não no lançamento. |
| PIF-04 | Clientes | Cliente fica ligado ao atendimento; o lançamento chega ao cliente pela referência de origem. Nenhum campo de cliente é adicionado ao lançamento. O cadastro de veículo do cliente (placa, modelo) usa `tipo_veiculo` como categoria; placa e modelo não entram no lançamento. |
| PIF-05 | Usuários e permissões | Novos papéis em `usuario_unidade.papel` + novas regras na política de acesso do módulo Identidade e Acesso (§9.2) e nas sync rules. |
| PIF-06 | Contas a pagar/receber | Usa `situacao = previsto` e, provavelmente, um campo de vencimento a ser adicionado nessa evolução. |

Regra: **lançamento gerado por outro módulo** (`origem ≠ manual`) só pode ser alterado/excluído pelo módulo de origem ou com aviso ao dono [SUPOSIÇÃO, decidir quando o primeiro módulo existir].

---

## 7. Suposições e dúvidas

### 7.1 Suposições técnicas
| # | Suposição |
|---|---|
| S-01 | Volume: até 5 unidades, até ~60 carros/dia por unidade → até ~9.000 lançamentos/mês no total. O aparelho guarda todo o histórico; se ficar pesado, passa a guardar só os últimos 24 meses (o resto continua no servidor). |
| S-02 | Existe uma entidade `organizacao` acima das unidades, com uma única linha no MVP. |
| S-03 | Categorias, tipos de serviço e formas de pagamento são comuns a todas as unidades (já suposto na visão). |
| S-04 | Forma de pagamento é obrigatória em entradas e saídas. |
| S-05 | Data futura bloqueada no MVP; data passada sem limite. |
| S-06 | Conflito de edição (para a v1.1; no MVP há um só aparelho [CONFIRMADO F-15]): vale a última alteração que chega ao servidor; excluir vence editar; tudo fica no histórico. |
| S-07 | Login por e-mail e senha (sem SMS), no Supabase Auth, o mesmo para app e painel. |
| S-08 | ~~Plano pago para backup diário~~ → [CONFIRMADO F-03b] só planos gratuitos; backup próprio semanal com `pg_dump` fora do Supabase (RNF-16). Limites dos planos gratuitos verificados na prova de conceito do M1 (§2.2). |
| S-09 | ~~Android e iOS~~ → [CONFIRMADO F-03] só Android no MVP; iOS fica para evolução sem mudar a stack. |
| S-10 | Tipo de veículo: lista comum a todas as unidades [CONFIRMADO E2-05]; "entrada de serviço" = entrada da categoria de sistema "Serviços" (`codigo = servicos`); nela o tipo de veículo é obrigatório e o tipo de serviço é opcional; nas demais entradas e nas saídas, os dois ficam nulos [CONFIRMADO E2-04 a)]. O campo `categoria.codigo` que identifica "Serviços" é [SUPOSIÇÃO]. |

### 7.2 Dúvidas para o dono
1. ~~**Conflito entre aparelhos:** se o mesmo lançamento for editado em dois celulares sem internet, aceita a regra "vale a última alteração enviada, com aviso e histórico para desfazer"?~~ Respondida em F-15 [CONFIRMADO]: um celular no MVP; o tratamento de conflito vai para a v1.1 (a regra será validada com o dono nessa evolução).
2. ~~**Excluir:** quer uma "lixeira" para recuperar lançamentos excluídos (por quanto tempo?), ou excluir some de vez da tela sem opção de recuperar pelo app?~~ Respondida em F-09 [CONFIRMADO]: lixeira por 90 dias e histórico visível no app.
3. ~~**Proteção do app:** quer que o app peça PIN/biometria ao abrir, ou prefere abrir direto para ganhar tempo?~~ Respondida em F-10 [CONFIRMADO]: abre direto, sem PIN nem biometria.
4. ~~**Backup e custo:** aceita pagar um plano do Supabase e, se necessário, do PowerSync, ou prefere ficar no gratuito com cópia semanal automática feita por nós?~~ Respondida em F-03b [CONFIRMADO]: só gratuito; PowerSync se o gratuito atender; backup próprio semanal.
10. ~~**Painel web (ST-01):** o que o painel faz (consultar Extrato e Resumo? gerenciar cadastros? lançar?) e se entra no MVP ou depois?~~ Respondida em ST-06 e ST-07 [CONFIRMADO]: só consulta, pós-MVP, usado só pelo dono com a mesma conta do app (criada na implantação).
5. **Datas:** pode lançar com data futura (ex.: já registrar o aluguel do mês que vem)? A proposta é bloquear, seguindo D-01.
6. ~~Quais celulares serão usados (só Android, ou também iPhone)?~~ Respondida em F-03 [CONFIRMADO]: só Android.
7. ~~**Tipo de serviço** também é obrigatório em toda entrada da categoria "Serviços" (como o tipo de veículo), ou pode haver entrada de serviço sem tipo?~~ Respondida [CONFIRMADO E2-04 a)]: tipo de veículo obrigatório, tipo de serviço opcional; entradas sem tipo de serviço aparecem como "Sem tipo de serviço".
8. ~~Os **tipos de veículo** são os mesmos em todas as unidades, ou cada unidade tem a sua lista?~~ Respondida em E2-05 [CONFIRMADO]: a mesma lista em todas as unidades.
9. ~~O resumo deve **cruzar** tipo de serviço com tipo de veículo, ou basta ver cada um separado?~~ Respondida em E2-08 [CONFIRMADO]: separados no MVP; o cruzamento fica para depois (ver §8).

Da visão, a dúvida ~~**12** (lançamento Pessoal pertence a uma unidade?)~~ foi respondida em F-05 [CONFIRMADO]: sim, unidade obrigatória. Continuam abertas as que afetam o modelo: **13** (categorias separadas para Pessoal e Empresa? — campo `aplica_a` já reservado) e **6** (foto do comprovante — exigiria Supabase Storage e mais espaço no aparelho).

---

## 8. Fora do escopo / módulos futuros

- **Foto do comprovante** (dúvida 6 da visão): exigiria armazenamento de arquivos (Supabase Storage), envio separado de imagens e regras de espaço no aparelho. Não modelado no MVP; entraria como tabela `lancamento_anexo`.
- **Lançamentos recorrentes** (dúvida 7 da visão): aluguel, internet etc. Ligado a contas a pagar (PIF-06).
- **Exportação para o contador** (dúvida 8 da visão): CSV/PDF por período; pode ser feita a partir do banco local ou do servidor.
- **Publicação em loja (Google Play)** [CONFIRMADO F-04: fora do MVP, que usa APK com instalação direta].
- **Telas de cadastro de unidades e formas de pagamento** [CONFIRMADO F-08: no MVP vêm dos dados iniciais da implantação].
- **PIN/biometria no app**: descartado [CONFIRMADO F-10]; só volta se o dono pedir (ex.: na expansão para outros usuários).
- **Gestão de usuários e convites**, papéis gerente/funcionário e fluxo de pedido de reembolso com aprovação (D-02, PIF-05).
- **Versão para iPhone (iOS)** [CONFIRMADO F-03: fora do MVP]: a stack (Expo) já permite gerar, mas exige testes em iOS, conta de desenvolvedor Apple e publicação na App Store.
- **Painel web (Next.js)** [CONFIRMADO ST-01, ST-06, ST-07]: **pós-MVP**, só consulta (Extrato, Resumo e leituras), só para o dono. Requisitos não funcionais: RNF-29 a RNF-33. Lançar ou gerenciar cadastros pelo painel não está previsto; se um dia for pedido, entra como novos endpoints de escrita que reutilizam os mesmos casos de uso do app.
- **Ligação de lançamento com funcionário, cliente, veículo ou produto**: pertence aos módulos de equipe, clientes, atendimento e estoque, via `origem_ref_*`.
- **Notificações** (ex.: resumo do dia) e alertas de gasto acima do normal.
- **Resumo cruzando tipo de serviço × tipo de veículo** (E2-08): fica para depois; o índice por tipo de veículo já permite.
- **Histórico de alterações das tabelas de cadastro** (categoria, tipo de serviço, forma de pagamento), além dos campos de auditoria.

---

## 9. Arquitetura do back-end (NestJS · DDD · Clean Architecture · monólito modular)

[CONFIRMADO ST-04] Um único serviço NestJS (um deploy, um banco), dividido em **módulos isolados**, um por área do negócio. Cada módulo segue a Clean Architecture por dentro e modela seu domínio com DDD. As regras de domínio ficam aqui.

### 9.1 Princípios

- **Monólito modular:** um processo só (simples e gratuito de hospedar), mas com fronteiras rígidas entre módulos, para que um módulo possa virar serviço separado no futuro sem reescrever o domínio.
- **Isolamento entre módulos:** um módulo **nunca** importa o domínio nem lê as tabelas de outro. Conversa só por (a) a **interface pública** do outro módulo (serviços de aplicação exportados, ex.: `AcessoPublico.temPapel(...)`) ou (b) **eventos de domínio**. Regra verificada automaticamente por lint de dependências (ex.: `eslint-plugin-boundaries` ou `dependency-cruiser`) [SUPOSIÇÃO].
- **Dependências apontam para dentro:** interface → aplicação → domínio; infraestrutura implementa as portas (interfaces) declaradas no domínio/aplicação. O domínio não conhece NestJS, banco, HTTP nem PowerSync.
- **Um schema Postgres por módulo** [SUPOSIÇÃO]; cada módulo é dono das suas tabelas e migrações.
- **Escrita por casos de uso; leitura por consultas:** comandos passam pelos agregados (regras) e, no MVP, chegam só pela sincronização do app; consultas do painel (extrato, resumo; pós-MVP, ST-06) usam SQL direto e otimizado, sem carregar agregados (CQRS leve) [SUPOSIÇÃO].

### 9.2 Módulos

| Módulo | Fase | Responsabilidade | Tabelas (schema) |
|---|---|---|---|
| **Identidade e Acesso** | MVP | Organização, unidades, usuários, vínculo usuário × unidade × papel, política de acesso (`temPapel`), validação do JWT do Supabase Auth. Base comum do sistema (PIF-05). | `identidade`: organizacao, unidade, usuario, usuario_unidade, dispositivo |
| **Finanças** | **MVP** | Lançamentos, lixeira, histórico, categorias, tipos de serviço, tipos de veículo, formas de pagamento, preferência Pessoal/Empresa, consultas de extrato e resumo. | `financas`: lancamento, lancamento_historico, categoria, tipo_servico, tipo_veiculo, forma_pagamento, preferencia_usuario |
| **Sincronização** | MVP | Endpoints `/sync/*`: recebe os lotes do app, traduz cada operação no caso de uso do módulo dono da tabela (registro de "manipuladores por tabela"), devolve o resultado por operação. Não tem regra de negócio própria. Na alternativa, também o `pull` incremental. | — (lê `seq_servidor` só na alternativa) |
| Estoque | Futuro | Produtos, entradas de mercadoria (PIF-02) | `estoque` |
| Atendimento | Futuro | Fila, ordem de serviço, serviço pago (PIF-01); passa a usar `tipo_servico` como catálogo | `atendimento` |
| Clientes | Futuro | Clientes e veículos com placa e modelo (PIF-04); veículo referencia `tipo_veiculo` | `clientes` |
| Equipe | Futuro | Funcionários, pagamentos de mão de obra e reembolsos (PIF-03) | `equipe` |
| Contas a pagar/receber | Futuro (evolução de Finanças) | Contas previstas → realizadas (PIF-06); pode nascer como submódulo de Finanças | `financas` |

**Kernel compartilhado** (`compartilhado/`): só tipos genéricos e sem regra de negócio — `Id` (UUID v7), `Dinheiro` (centavos), `DataLocal`, classe base `EventoDeDominio`, `Resultado`/erros de domínio, unidade de trabalho (transação), barramento de eventos.

### 9.3 Camadas do módulo Finanças

| Camada | Conteúdo | Exemplos |
|---|---|---|
| **Domínio** | Agregados, entidades, objetos de valor, eventos de domínio, regras (invariantes), interfaces de repositório. TypeScript puro. | `Lancamento`, `Categoria`, `Dinheiro`, `NomeNormalizado`, `LancamentoExcluido`, `LancamentoRepositorio` (interface) |
| **Aplicação** | Casos de uso (orquestram: carregar agregado → chamar regra → salvar → publicar eventos), autorização via módulo Identidade e Acesso, consultas, portas para serviços externos. | `RegistrarLancamento`, `EditarLancamento`, `ExcluirLancamento`, `RestaurarLancamento`, `CriarCategoria`, `RenomearCategoria`, `DesativarCategoria`, `CriarTipoVeiculo`, `DefinirNaturezaPadrao`; consultas `ConsultarExtrato`, `ConsultarResumo`, `ListarLixeira`, `ConsultarHistorico` |
| **Infraestrutura** | Implementações das portas: repositórios Postgres (query builder tipado, ex.: Drizzle ou Kysely [SUPOSIÇÃO]), gravação do histórico, publicador de eventos, relógio, gerador de UUID v7. | `LancamentoRepositorioPostgres`, `HistoricoGravadorPostgres` |
| **Interface** | Controladores HTTP (REST) **só de consulta** para o painel (pós-MVP, ST-06), manipuladores de operações de sincronização registrados no módulo Sincronização, DTOs e validação de entrada (ex.: zod), mapeamento de erros de domínio para HTTP (422/403/409). | `ExtratoController` (`GET /financas/extrato`), `ResumoController` (`GET /financas/resumo`), `LancamentoSyncHandler` |

#### Agregados e entidades do domínio de Finanças

| Agregado (raiz) | Objetos de valor / entidades internas | Invariantes principais (onde a regra vale) |
|---|---|---|
| **Lancamento** | `Dinheiro` (centavos > 0), `TipoLancamento` (entrada/saída), `Natureza` (empresa/pessoal), `DataLancamento` (data local da unidade), `Situacao` (realizado/previsto — só realizado no MVP), `Origem` + `ReferenciaOrigem`, `ClassificacaoServico` (tipo de veículo obrigatório e tipo de serviço opcional quando a categoria é `servicos`), `Auditoria`, `Exclusao` | Valor > 0 e ≤ máximo (§5.1); data não futura no fuso da unidade (§5.2); categoria do mesmo tipo do lançamento e ativa na criação; regra serviço × veículo (E2-04); **edição não troca o tipo nem entra/sai de "Serviços"** (F-13); lançamento excluído não pode ser editado [SUPOSIÇÃO]; restaurar só até 90 dias após `excluido_em` (F-09); `versao` +1 a cada alteração aceita. Emite os eventos da §9.4; o histórico é gravado a partir deles. |
| **Categoria** | `NomeNormalizado` (F-16), `Icone`, `Cor`, `CodigoSistema` | Categoria de sistema (`sistema = true`) pode ser renomeada (nome, ícone, cor) mas **não desativada** (F-06); `tipo` não muda depois de criada [SUPOSIÇÃO]; nome único normalizado por organização e tipo (verificado pelo caso de uso via repositório + índice único no banco). |
| **TipoServico** | `NomeNormalizado` | Nome único normalizado (F-16); desativar mantém os lançamentos antigos. |
| **TipoVeiculo** | `NomeNormalizado`, `Icone` (padrão: genérico) | Nome único normalizado (F-16); desativar mantém os lançamentos antigos. |
| **FormaPagamento** | `NomeNormalizado` | Dados iniciais no MVP (F-08). |
| **PreferenciaUsuario** | `Natureza` | Uma por usuário; padrão `empresa` (SUP-D11). |

`LancamentoHistorico` não é agregado: é um **registro de auditoria** (somente acréscimo), gravado pela infraestrutura na mesma transação, a partir dos eventos do `Lancamento`.

### 9.4 Eventos de domínio

Publicados pelos agregados e despachados **depois do commit** pelo barramento interno do NestJS (ex.: `@nestjs/cqrs` ou `@nestjs/event-emitter`) [SUPOSIÇÃO]. No MVP há um só consumidor interno (o gravador de histórico, que roda na mesma transação). Quando surgir o primeiro módulo consumidor, adota-se uma **tabela de saída (outbox)** no Postgres para garantir a entrega mesmo se o processo cair entre o commit e o despacho [SUPOSIÇÃO].

**Eventos emitidos por Finanças** (correspondem aos da §6.2):

| Evento de domínio | Nome na §6.2 | Dados principais | Consumidores |
|---|---|---|---|
| `LancamentoRegistrado` | `lancamento.criado` | id, unidade, tipo, natureza, valor, data, categoria (+código), tipo de serviço/veículo, origem e referência | Histórico (MVP); painéis/alertas; módulo de origem (PIF-01 a 03) para confirmar o vínculo |
| `LancamentoAlterado` | `lancamento.alterado` | id, campos alterados, antes/depois, versão | Histórico (MVP); módulo de origem (ex.: Atendimento saber que o valor foi corrigido) |
| `LancamentoExcluido` / `LancamentoRestaurado` | `lancamento.excluido` / `lancamento.restaurado` | id, quem, quando | Histórico (MVP); módulo de origem, para manter consistência |
| `TipoServicoAlterado` | `tipo_servico.alterado` | id, nome, ativo | Atendimento (PIF-01) |
| `TipoVeiculoAlterado` | `tipo_veiculo.alterado` | id, nome, ícone, ativo | Atendimento, Clientes (PIF-01, PIF-04) |
| `CategoriaAlterada` | `categoria.alterada` | id, código, nome, ativa | Relatórios |

**Eventos que Finanças vai consumir dos módulos futuros** (cada um vira um caso de uso `RegistrarLancamento` com `origem ≠ manual`):

| PIF | Evento do módulo de origem (nome provisório) | Ação em Finanças |
|---|---|---|
| PIF-01 | `AtendimentoPago` (Atendimento) | Entrada na categoria `servicos`, com tipo de veículo (obrigatório) e tipo de serviço, `origem = atendimento` |
| PIF-02 | `CompraDeMercadoriaRegistrada` (Estoque) | Saída na categoria `produtos`, `origem = estoque` |
| PIF-03 | `PagamentoEquipeRegistrado` / `ReembolsoPago` (Equipe) | Saída em `mao_de_obra` ou `reembolso`, `origem = equipe` |
| PIF-04 | — (Clientes não gera lançamento; liga-se pelo Atendimento) | Nenhuma; Clientes consome `TipoVeiculoAlterado` |
| PIF-05 | `VinculoUsuarioUnidadeAlterado` (Identidade e Acesso) | Nenhuma escrita; a política de acesso e as sync rules passam a refletir o novo papel |
| PIF-06 | `ContaPaga` (Contas a pagar/receber) | Lançamento `previsto` → `realizado` |

Na direção contrária, quando um lançamento com `origem ≠ manual` é alterado ou excluído, o módulo de origem é avisado pelos eventos `LancamentoAlterado`/`LancamentoExcluido` (regra da §6.3, ainda [SUPOSIÇÃO]).

### 9.5 Fluxo de uma operação vinda do celular (exemplo)

1. O app grava offline um lançamento de serviço no SQLite (validado pelo pacote compartilhado).
2. Com internet, o lote chega a `POST /sync/upload`; o guard valida o JWT.
3. O módulo Sincronização encontra o manipulador de `lancamento` (Finanças), que chama `RegistrarLancamento`.
4. O caso de uso pergunta ao Identidade e Acesso se o usuário tem papel `dono` na unidade; cria o agregado `Lancamento` (regras E2-04, §5); abre a transação; salva; o gravador de histórico registra `criacao`; commit.
5. Depois do commit, `LancamentoRegistrado` é despachado. A resposta da operação é "aceita"; a linha volta ao aparelho pelo recebimento, já com `versao` e `recebido_servidor_em`.
6. Se o id já existir com o mesmo conteúdo, a operação é tratada como repetição e aceita sem duplicar (§4.1).

### 9.6 Estrutura de pastas sugerida (monorepo) [SUPOSIÇÃO]

```
lavajato/
├─ apps/
│  ├─ mobile/                      # Expo / React Native (Android, APK)
│  │  └─ src/ (telas, componentes, banco local, conector de sincronização)
│  ├─ painel/                      # Next.js (painel web: só consulta, pós-MVP — ST-06)
│  └─ api/                         # NestJS
│     └─ src/
│        ├─ main.ts
│        ├─ app.module.ts
│        ├─ compartilhado/         # kernel: Id, Dinheiro, EventoDeDominio, transação, auth guard
│        └─ modulos/
│           ├─ identidade-acesso/
│           │  ├─ dominio/  ├─ aplicacao/  ├─ infraestrutura/  ├─ interface/
│           │  └─ identidade-acesso.module.ts   # exporta só a interface pública
│           ├─ financas/
│           │  ├─ dominio/
│           │  │  ├─ lancamento/        # agregado, objetos de valor, eventos, repositório (interface)
│           │  │  ├─ cadastros/         # categoria, tipo-servico, tipo-veiculo, forma-pagamento
│           │  │  └─ preferencias/
│           │  ├─ aplicacao/
│           │  │  ├─ casos-de-uso/      # registrar, editar, excluir, restaurar, criar/renomear/desativar…
│           │  │  └─ consultas/         # extrato, resumo, lixeira, histórico
│           │  ├─ infraestrutura/
│           │  │  ├─ persistencia/      # repositórios Postgres, gravador de histórico
│           │  │  └─ eventos/
│           │  ├─ interface/
│           │  │  ├─ http/              # controladores REST de consulta do painel (pós-MVP)
│           │  │  └─ sync/              # manipuladores por tabela para o módulo Sincronização
│           │  └─ financas.module.ts
│           ├─ sincronizacao/           # /sync/upload (ou /sync/push e /sync/pull)
│           └─ (estoque/ atendimento/ clientes/ equipe/ — futuros, mesmo formato)
├─ packages/
│  ├─ dominio-compartilhado/       # TS puro: normalizarNome (F-16), Dinheiro, regras de validação
│  │                               # repetidas no app para aviso offline (a decisão final é da API)
│  └─ contratos/                   # tipos e esquemas (ex.: zod) das APIs e das operações de sync
├─ infra/
│  ├─ supabase/migrations/         # SQL versionado por schema (RNF-27) + dados iniciais (F-08, F-14)
│  ├─ powersync/                   # sync rules versionadas
│  └─ backup/                      # rotina semanal de pg_dump criptografado (RNF-16)
└─ docs/
```

O pacote `dominio-compartilhado` contém apenas funções puras e sem estado; ele **não substitui** o domínio do back-end, só evita que o app e a API calculem a normalização de nomes ou os centavos de jeitos diferentes.
