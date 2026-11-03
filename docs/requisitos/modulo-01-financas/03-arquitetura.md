# Módulo 1 — Gestão de Finanças · Arquitetura

Projeto: Lavajato Sistema
Documento: 03-arquitetura.md · Autor: Agente Arquitetura · Versão: 1 · Status: **rascunho para revisão**
Fonte da verdade: `01-visao.md` (versão 3). Em caso de conflito, a visão prevalece.

> Convenção: **[CONFIRMADO]** veio do dono (via 01-visao.md) · **[SUPOSIÇÃO]** decisão técnica ou premissa ainda não validada · **[DÚVIDA]** precisa de resposta do dono.
>
> Decisões já tomadas e não reabertas aqui: app de celular com dados locais e funcionamento sem internet; banco central Supabase; sincronização automática + botão "Sincronizar"; modelo usuário × unidade × papel com só o papel Dono no MVP; Pessoal/Empresa em todo lançamento; só o realizado (situação reservada); entrada de serviço carro por carro, sem tabela de preços.

---

## 1. Requisitos não funcionais

| ID | Tema | Requisito | Critério de aceite |
|---|---|---|---|
| RNF-01 | Uso no celular | O app roda em Android e iOS, em telas a partir de 5", com uso por uma só mão (botões principais na metade de baixo da tela). | Telas principais utilizáveis em 360 × 640 dp; áreas de toque ≥ 48 dp. |
| RNF-02 | Uso no celular | Android 8+ e iOS 15+ [SUPOSIÇÃO]. Aparelhos de entrada (2 GB RAM) devem rodar o app sem travar. | Teste em um aparelho Android de entrada. |
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
| RNF-14 | Rastreabilidade | Toda alteração e exclusão gera uma linha no **histórico**, com valores antes e depois, quem, quando e de qual aparelho. O histórico é somente leitura para o app. | Nenhuma rota permite editar ou apagar o histórico pelo app. |
| RNF-15 | Rastreabilidade | Exclusão é **lógica** (o registro fica marcado como excluído e some das telas e totais). | Lançamento excluído não entra em saldo, mas continua no banco e no histórico. |
| RNF-16 | Backup | O banco central tem cópia de segurança automática **diária**, com retenção mínima de 7 dias [SUPOSIÇÃO], e cópia **semanal** guardada fora do Supabase, com retenção de 3 meses [SUPOSIÇÃO]. | Restauração testada pelo menos uma vez antes de entrar em produção. |
| RNF-17 | Backup | Dados ainda não sincronizados existem só no aparelho; o app avisa quando há pendências há mais de 24 h [SUPOSIÇÃO]. | Aviso exibido na tela inicial. |
| RNF-18 | Segurança | Todo acesso ao Supabase exige usuário autenticado; a chave de serviço (service_role) **nunca** vai no app. | Revisão de código e de configuração antes de publicar. |
| RNF-19 | Segurança | **Row Level Security (RLS) ligada em todas as tabelas.** Um usuário só lê e grava dados das unidades às quais tem vínculo ativo em `usuario_unidade`, conforme o papel. | Teste automatizado com dois usuários de unidades diferentes: nenhum enxerga dado do outro. |
| RNF-20 | Segurança | As permissões são decididas pelo **papel** no vínculo usuário × unidade, nunca por regra fixa no app. No MVP só existe o papel `dono`; os papéis futuros entram como novos valores e novas políticas, sem mudar tabelas. | Adicionar um papel não exige migração de estrutura de lançamento. |
| RNF-21 | Segurança | Comunicação só por HTTPS/TLS. Senha mínima de 8 caracteres. | Configuração do Supabase Auth. |
| RNF-22 | LGPD | Dados financeiros pessoais do dono (lançamentos **Pessoal**) e dados de funcionários citados em descrições são dados pessoais. Base legal: execução de contrato / legítimo interesse do próprio titular [SUPOSIÇÃO, validar com jurídico/contador]. | Política de privacidade simples publicada com o app. |
| RNF-23 | LGPD | Banco central hospedado na região **São Paulo** do Supabase [SUPOSIÇÃO], com criptografia em repouso do provedor. | Projeto Supabase criado na região sa-east-1. |
| RNF-24 | LGPD | Minimização: o módulo não coleta CPF, telefone, placa ou nome de cliente. O campo descrição é livre; a interface orienta a não colocar dados sensíveis. | Nenhum campo de identificação pessoal no modelo de lançamento. |
| RNF-25 | LGPD | Proteção no aparelho: bloqueio do app por PIN ou biometria ao abrir [SUPOSIÇÃO, ver dúvida]. Ao sair da conta, os dados locais são apagados (com aviso se houver pendências). | Logout com pendências exige confirmação explícita. |
| RNF-26 | LGPD | Direito de exclusão: existe um procedimento administrativo (fora do app) para apagar definitivamente os dados de um titular a pedido. | Procedimento documentado antes da expansão para outros usuários. |
| RNF-27 | Manutenção | Evoluções do banco por **migrações versionadas** (SQL no repositório), tanto no Supabase quanto no banco local. | Nenhuma alteração manual de estrutura em produção. |

---

## 2. Stack

### 2.1 Stack recomendada

| Camada | Escolha | Justificativa |
|---|---|---|
| Framework do app | **React Native com Expo** (TypeScript) | Um código só para Android e iOS; publicação e atualizações facilitadas (EAS Build/Update); grande base de exemplos com Supabase; equipe pequena consegue manter. |
| Banco local no aparelho | **SQLite** (via PowerSync SDK) | Banco relacional real no aparelho, rápido para extrato e somas do mês, sobrevive a reinício. |
| Sincronização | **PowerSync** (serviço de sincronização com integração oficial ao Supabase) | Resolve o que é mais difícil e arriscado de escrever à mão: fila de envio persistente, recebimento incremental, retomada após queda, estado de pendências. Os envios passam pelo próprio Supabase com o token do usuário, então a RLS continua valendo. |
| Banco central | **Supabase (Postgres)** [CONFIRMADO] | Já decidido. Gatilhos (triggers) no Postgres preenchem auditoria e histórico. |
| Autenticação | **Supabase Auth**, e-mail + senha | Gratuito, integrado à RLS (`auth.uid()`), sessão fica guardada no aparelho e funciona offline. Login por SMS foi descartado no MVP por custo. |
| Bloqueio local | expo-local-authentication (biometria/PIN do aparelho) | Protege os dados se o celular for perdido (RNF-25). |

### 2.2 Alternativa mais simples

| Camada | Escolha |
|---|---|
| Framework do app | React Native com Expo (igual) |
| Banco local | **expo-sqlite** puro (com uma camada leve de consultas, ex.: Drizzle) |
| Sincronização | **Código próprio**: tabela local `fila_envio` + chamadas diretas ao Supabase (`supabase-js`) para enviar; recebimento por "me dê tudo alterado desde o meu último marcador" |
| Autenticação | Supabase Auth (igual) |

É mais simples no sentido de **menos peças e nenhum serviço extra**: só o app e o Supabase.

### 2.3 Comparação

| Critério | Recomendada (Expo + PowerSync) | Mais simples (Expo + SQLite + sync próprio) |
|---|---|---|
| Esforço inicial | Médio: configurar o serviço PowerSync e as regras de sincronização | Médio a alto: escrever e testar fila, reenvio, recebimento incremental e conflitos (~2 a 3 semanas a mais [SUPOSIÇÃO]) |
| Esforço de manutenção | Baixo na sincronização; depende da evolução do fornecedor | Alto: cada tabela nova precisa entrar no código de sincronização |
| Custo | Supabase (gratuito no início) + PowerSync (há plano gratuito com limites; verificar preço e regras atuais, ex.: pausa por inatividade) [SUPOSIÇÃO] | Só o Supabase (gratuito no início) |
| Risco técnico | Baixo na sincronização (solução testada em produção por outros) | Médio: erros sutis de sincronização (duplicados, perdas, ordem) só aparecem com uso real |
| Risco de fornecedor | Médio: dependência de um segundo serviço; mitigável, pois o dado mestre fica no Supabase e o banco local é SQLite comum | Baixo |
| Crescimento (gerentes, funcionários, mais módulos) | Bom: regras de sincronização por unidade/usuário já previstas | Exige refazer partes da sincronização |

**Recomendação:** começar com a **stack recomendada (PowerSync)**, porque a sincronização confiável é o ponto mais arriscado do projeto e o RNF-08 ("nada se perde") é inegociável. Se o custo ou a dependência do PowerSync for um problema para o dono, a alternativa simples é viável **no MVP**, porque há um único usuário e poucas tabelas — mas com o compromisso de reavaliar na expansão para outros usuários. O modelo de dados (§3) e as regras de sincronização (§4) valem para as duas opções.

---

## 3. Modelo de dados

### 3.1 Convenções

- Chave primária: `id uuid`, **gerado no aparelho** (UUID v7, que é ordenável pelo tempo) — ver §4.1.
- Dinheiro: `bigint` em **centavos**, sempre positivo — ver §5.
- Datas/horas de sistema: `timestamptz` em UTC. Data do lançamento: `date` (sem hora) — ver §5.
- Exclusão lógica: `excluido_em timestamptz null` (nulo = ativo).
- Toda tabela sincronizada tem `criado_em`, `criado_por`, `alterado_em`, `alterado_por`, `versao`.
- Listas de valores fixos (enums) guardadas como `text` com restrição `check`, para facilitar evolução e o banco local.

### 3.2 Entidades

#### organizacao [SUPOSIÇÃO]
Agrupa as unidades de um mesmo dono. Não foi pedida pelo dono; foi incluída para que categorias, tipos de serviço e formas de pagamento sejam "comuns a todas as unidades" (suposição da visão) sem ficarem soltas, e para o sistema poder atender outro lava-jato no futuro. No MVP existe uma só.

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK |
| nome | text | obrigatório |
| criado_em / alterado_em | timestamptz | automático |

#### unidade
| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK |
| organizacao_id | uuid | FK → organizacao |
| nome | text | obrigatório, único na organização |
| fuso_horario | text | padrão `America/Sao_Paulo` |
| ativa | boolean | padrão true |
| criado_em, criado_por, alterado_em, alterado_por | | auditoria |

#### usuario
Perfil do usuário; o login fica em `auth.users` do Supabase, com o mesmo `id`.

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
| nome | text | obrigatório; único por (organização, tipo) entre as ativas |
| icone | text | nome do ícone (catálogo definido em 02-design.md) |
| cor | text | hex `#RRGGBB` |
| aplica_a | text | `ambos` (padrão) \| `pessoal` \| `empresa` — **reservado** até a dúvida 13 da visão ser respondida |
| sistema | boolean | true para as **quatro** categorias fixas do sistema, usadas por código pelos outros módulos: "Serviços", "Produtos", "Mão de obra" e "Reembolso" [CONFIRMADO E2-02]. Podem ser renomeadas, mas não desativadas [SUPOSIÇÃO, interpretação a confirmar]. O dono pode criar categorias novas, que nascem com `sistema = false` [CONFIRMADO E2-02] |
| codigo | text | identificador fixo das categorias de sistema: `servicos`, `produtos`, `mao_de_obra`, `reembolso`; nulo nas criadas pelo dono; único por organização. Usado pelas regras (ex.: "entrada de serviço" = categoria `servicos`), porque o nome pode ser renomeado [SUPOSIÇÃO] |
| ordem | int | posição na grade de ícones |
| ativa | boolean | desativar esconde da escolha, mas mantém os lançamentos antigos |
| auditoria + versao | | |

#### tipo_servico
| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK |
| organizacao_id | uuid | FK → organizacao |
| nome | text | obrigatório, único entre os ativos [CONFIRMADO: só o nome, sem preço] |
| ordem | int | |
| ativo | boolean | |
| auditoria + versao | | |

#### tipo_veiculo
Categoria do veículo atendido (01-visao.md, item 3b-1 [CONFIRMADO]). É só a categoria: placa, modelo e cliente ficam fora do escopo.

| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK, gerado no aparelho (pode ser criado direto no lançamento, "+ Novo veículo" [SUPOSIÇÃO da visão]) |
| organizacao_id | uuid | FK → organizacao |
| nome | text | obrigatório, único entre os ativos; lista editável pelo dono, só com o nome [SUPOSIÇÃO da visão]. Iniciais: Carro · Moto · SUV · Caminhonete/Picape · Van [CONFIRMADO E2-07] |
| icone | text | nome do ícone do catálogo do 02-design.md; preenchido com ícone próprio nos tipos iniciais; nos criados pelo dono, valor padrão = ícone genérico [SUPOSIÇÃO] |
| ordem | int | |
| ativo | boolean | desativar esconde da escolha, mas mantém os lançamentos antigos |
| auditoria + versao | | |

[CONFIRMADO E2-05] A lista de tipos de veículo é a mesma em todas as unidades: por isso a tabela pertence à `organizacao`, não à unidade. Cada lançamento de serviço pertence a **uma única unidade** (`lancamento.unidade_id`, obrigatório), aparece só nessa unidade e é somado no total geral (consolidado da organização). A placa não é registrada no MVP. O modelo já atende sem mudanças.

#### forma_pagamento
| Campo | Tipo | Regra |
|---|---|---|
| id | uuid | PK |
| organizacao_id | uuid | FK → organizacao |
| nome | text | iniciais [SUPOSIÇÃO]: Dinheiro, Pix, Cartão de débito, Cartão de crédito |
| ordem | int | |
| ativa | boolean | |
| auditoria + versao | | |

#### lancamento
| Campo | Tipo | Obrig. | Regra |
|---|---|---|---|
| id | uuid | sim | PK, gerado no aparelho |
| unidade_id | uuid | sim | FK → unidade. [DÚVIDA 12 da visão: lançamento Pessoal pertence a uma unidade?] Até a resposta, obrigatório. |
| tipo | text | sim | `entrada` \| `saida` |
| natureza | text | sim | `empresa` \| `pessoal`; o app preenche com `preferencia_usuario.natureza_padrao` (SUP-D11 do 02-design.md: "Empresa", trocável em Ajustes) |
| valor_centavos | bigint | sim | > 0; o sinal vem do `tipo` |
| data_lancamento | date | sim | dia em que o dinheiro entrou/saiu; padrão = hoje no fuso da unidade |
| categoria_id | uuid | sim | FK → categoria; `categoria.tipo` deve ser igual a `lancamento.tipo` |
| tipo_servico_id | uuid | não | FK → tipo_servico. **Opcional nas entradas da categoria "Serviços"**; nulo em saídas e nas demais entradas [CONFIRMADO E2-04 a)]. Entrada de serviço sem tipo de serviço aparece como "Sem tipo de serviço" no Resumo e no filtro do Extrato [SUPOSIÇÃO] |
| tipo_veiculo_id | uuid | condicional | FK → tipo_veiculo. **Obrigatório nas entradas da categoria "Serviços"**; nulo em saídas e nas demais entradas [CONFIRMADO E2-04 a)]. "Entrada de serviço" = lançamento com `tipo = entrada` e categoria de `codigo = servicos` (não depende de o tipo de serviço estar preenchido). Validação: no app antes de salvar e no servidor por gatilho de inserção/alteração (uma restrição `check` não consegue consultar a categoria) [SUPOSIÇÃO de implementação] |
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

Índices: (unidade_id, data_lancamento), (unidade_id, categoria_id, data_lancamento), (unidade_id, tipo_veiculo_id, data_lancamento) para o resumo por tipo de veículo [SUPOSIÇÃO da visão], (origem_ref_tabela, origem_ref_id).

#### lancamento_historico
Escrito **só pelo servidor** (gatilho no Postgres) a cada inserção, alteração, exclusão e restauração aceita. Somente leitura para o app.

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
- **config_local**: unidade atual, último tipo de serviço, tipo de veículo e forma de pagamento usados (atalho "repetir último serviço" [SUPOSIÇÃO]; o último veículo usado vem pré-selecionado [CONFIRMADO E2-06]), período escolhido no Extrato/Resumo, que vale junto para as duas telas [CONFIRMADO E2-10], marcador da última sincronização. O padrão Pessoal/Empresa **não** fica aqui: está em `preferencia_usuario`, que é sincronizada.

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
}

Table tipo_servico {
  id uuid [pk]
  organizacao_id uuid [not null, ref: > organizacao.id]
  nome text [not null]
  ordem int
  ativo boolean [not null, default: true]
  versao int [not null, default: 1]
  criado_em timestamptz
  criado_por uuid
  alterado_em timestamptz
  alterado_por uuid
}

Table tipo_veiculo {
  id uuid [pk]
  organizacao_id uuid [not null, ref: > organizacao.id]
  nome text [not null]
  icone text [not null, note: 'catálogo do 02-design.md; padrão = ícone genérico nos criados pelo dono']
  ordem int
  ativo boolean [not null, default: true]
  versao int [not null, default: 1]
  criado_em timestamptz
  criado_por uuid
  alterado_em timestamptz
  alterado_por uuid
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

### 3.5 Segurança no banco (RLS)

Esboço das políticas (todas as tabelas com RLS ligada):

- Função auxiliar `tem_papel(unidade_id, papeis[])`: verdadeiro se existe `usuario_unidade` ativo com `usuario_id = auth.uid()`, a unidade informada e papel na lista.
- **lancamento**: ler/inserir/alterar se `tem_papel(unidade_id, {dono})`. Na expansão, `gerente` entra na lista para sua unidade. **Nenhuma política de DELETE físico** para o app (só exclusão lógica). Na inserção, o servidor exige `criado_por = auth.uid()`.
- **categoria, tipo_servico, tipo_veiculo, forma_pagamento**: ler se o usuário tem vínculo com alguma unidade da organização; inserir e alterar só papel `dono` (no MVP o dono cria tipo de veículo também direto no lançamento). Sem DELETE físico: só desativar.
- **lancamento.tipo_veiculo_id**: o servidor recusa tipo de veículo de outra organização (verificação na política de inserção/alteração de lançamento ou por gatilho).
- **unidade, usuario_unidade**: ler as próprias; alterar só `dono` (telas de gestão de usuários ficam para a expansão).
- **preferencia_usuario**: cada usuário lê e altera só a própria linha (`usuario_id = auth.uid()`).
- **lancamento_historico**: só leitura; escrita apenas pelo gatilho do servidor (`security definer`).
- [DÚVIDA 11 da visão] Quando houver gerentes, lançamentos `pessoal` poderão ter política extra (ex.: só o criador ou o dono veem). O campo `natureza` já permite isso sem mudar tabelas.

---

## 4. Sincronização

### 4.1 Geração de IDs no aparelho
- Todo registro criado no celular recebe um **UUID v7** gerado ali mesmo. Não há chance prática de colisão entre aparelhos e o servidor aceita o id como chave.
- Como o id existe desde a criação, reenviar o mesmo lançamento (por queda de rede no meio do envio) **não duplica**: o servidor faz "inserir ou ignorar se já existe" (idempotência).
- Cada instalação do app gera um `dispositivo_id` e o registra na primeira sincronização.

### 4.2 Fila de envio
1. Ao salvar, o app grava o lançamento no SQLite **e** uma operação na fila de envio, na mesma transação (ou tudo ou nada).
2. O envio processa a fila **em ordem**, uma operação por vez (ou em lotes pequenos), usando o token do usuário — a RLS vale para cada operação.
3. Operação confirmada pelo servidor sai da fila. Falha temporária (sem rede, tempo esgotado, servidor fora) mantém a operação e tenta de novo com espera crescente (5 s, 15 s, 1 min, 5 min… até 30 min) [SUPOSIÇÃO].
4. Recebimento: o app pede ao servidor tudo o que mudou desde o último marcador (inclusive registros excluídos logicamente), aplica no SQLite e avança o marcador. Alterações locais ainda pendentes **não** são sobrescritas pelo recebimento até serem enviadas.
5. Gatilhos: salvar lançamento, abrir o app, voltar a ter conexão, a cada ~5 min com o app aberto e o botão "Sincronizar" (RNF-05, RNF-06).

### 4.3 Mesmo lançamento editado em dois aparelhos offline
Regra proposta [SUPOSIÇÃO, ver dúvida]: **vale a alteração que chegar por último ao servidor, registro inteiro** ("última gravação vence"), **sem perder nada**:
- Cada alteração enviada leva a `versao` em que o aparelho se baseou.
- Se o servidor está numa versão mais nova (o outro aparelho já enviou), a alteração é aplicada mesmo assim, mas o histórico marca `conflito = true` e guarda os dois estados (antes e depois).
- O app mostra um aviso discreto no lançamento: "Este lançamento foi alterado em outro aparelho. Ver histórico." O dono pode, pelo histórico, voltar aos valores anteriores com um toque [SUPOSIÇÃO].
- Por que não mesclar campo a campo: no MVP há um só usuário e o caso é raro; a regra simples é previsível e o histórico garante que nada se perde.
- Comparar pela hora do aparelho foi descartado porque os relógios dos celulares podem estar errados.

### 4.4 Exclusões
- Excluir = preencher `excluido_em` e `excluido_por` (exclusão lógica); é sincronizada como uma alteração comum.
- **Excluir vence editar** [SUPOSIÇÃO]: se um aparelho exclui e outro edita offline, o lançamento continua excluído; a edição fica registrada no histórico com `conflito = true`.
- Restaurar um lançamento excluído é possível pelo histórico/lixeira [SUPOSIÇÃO, ver dúvida], gerando ação `restauracao`.
- Lançamentos excluídos não entram em extrato, saldo, resumo nem gráfico.
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
| Recusado (permissão) | RLS bloqueou (ex.: vínculo com a unidade foi removido) | Marca como erro, mostra ao dono, mantém o dado no aparelho; nunca descarta sozinho |
| Recusado (dados) | Categoria inexistente no servidor, valor inválido | Marca como erro com a mensagem; o dono pode corrigir e reenviar ou descartar (descartar pede confirmação) |
| Defeito do app | Erro inesperado | Registra em log local para suporte; a fila continua com os demais itens |

Uma operação com erro definitivo não trava as outras, exceto as que dependem dela (ex.: alteração de um lançamento cuja criação falhou).

---

## 5. Regras de valores e datas

### 5.1 Dinheiro
- Armazenado como **inteiro em centavos** (`bigint`), nunca como número com vírgula (ponto flutuante), para evitar erros de arredondamento nas somas. Ex.: R$ 35,50 → `3550`.
- `valor_centavos` é **sempre positivo**; se é entrada ou saída vem do campo `tipo`. Saldo = soma das entradas − soma das saídas.
- Moeda única: real (BRL) [SUPOSIÇÃO da visão]. Não há campo de moeda no MVP.
- Digitação: a forma de digitar o valor é decisão de interface, definida no 02-design.md (dúvida **DU-03**, pendente com o dono). Qualquer que seja a escolha, o valor digitado é convertido para **centavos inteiros sem arredondamento** (a interface não aceita mais de duas casas decimais) antes de ser gravado.
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
| `categoria` (com `sistema = true` para "Serviços", "Produtos", "Mão de obra", "Reembolso") | Categorias usadas pelos módulos que geram lançamentos automaticamente |
| `forma_pagamento` | Mesma lista no atendimento e em contas a pagar |
| `lancamento` com `origem` + `origem_ref_tabela` + `origem_ref_id` | Outros módulos **criam** lançamentos apontando para o registro que os originou, sem mudar o modelo |
| `lancamento.situacao` | Contas a pagar/receber usam `previsto` → `realizado` (PIF-06) |

### 6.2 Eventos
O módulo registra, no servidor, os eventos abaixo (via gatilhos do Postgres; a forma de entrega — tabela de eventos, Supabase Realtime ou funções — será decidida quando o primeiro consumidor existir):

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
| PIF-05 | Usuários e permissões | Novos papéis em `usuario_unidade.papel` + novas políticas RLS. |
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
| S-06 | Conflito de edição: vale a última alteração que chega ao servidor; excluir vence editar; tudo fica no histórico. |
| S-07 | Login por e-mail e senha (sem SMS). |
| S-08 | Plano gratuito do Supabase no início; a cópia de segurança diária exigida em RNF-16 pode exigir plano pago ou uma rotina própria de exportação semanal (ex.: `pg_dump` agendado gratuito). Verificar regras e preços atuais do Supabase e do PowerSync antes de decidir. |
| S-09 | Android e iOS; se o dono só usa Android, iOS pode ficar para depois sem mudar a stack. |
| S-10 | Tipo de veículo: lista comum a todas as unidades [CONFIRMADO E2-05]; "entrada de serviço" = entrada da categoria de sistema "Serviços" (`codigo = servicos`); nela o tipo de veículo é obrigatório e o tipo de serviço é opcional; nas demais entradas e nas saídas, os dois ficam nulos [CONFIRMADO E2-04 a)]. O campo `categoria.codigo` que identifica "Serviços" é [SUPOSIÇÃO]. |

### 7.2 Dúvidas para o dono
1. **Conflito entre aparelhos:** se o mesmo lançamento for editado em dois celulares sem internet, aceita a regra "vale a última alteração enviada, com aviso e histórico para desfazer"?
2. **Excluir:** quer uma "lixeira" para recuperar lançamentos excluídos (por quanto tempo?), ou excluir some de vez da tela sem opção de recuperar pelo app?
3. **Proteção do app:** quer que o app peça PIN/biometria ao abrir (há dados pessoais e financeiros no celular), ou prefere abrir direto para ganhar tempo?
4. **Backup e custo:** aceita pagar um plano do Supabase (com cópia diária automática) e, se necessário, do PowerSync, ou prefere ficar no gratuito com cópia semanal automática feita por nós?
5. **Datas:** pode lançar com data futura (ex.: já registrar o aluguel do mês que vem)? A proposta é bloquear, seguindo D-01.
6. Quais celulares serão usados (só Android, ou também iPhone)?
7. ~~**Tipo de serviço** também é obrigatório em toda entrada da categoria "Serviços" (como o tipo de veículo), ou pode haver entrada de serviço sem tipo?~~ Respondida [CONFIRMADO E2-04 a)]: tipo de veículo obrigatório, tipo de serviço opcional; entradas sem tipo de serviço aparecem como "Sem tipo de serviço".
8. ~~Os **tipos de veículo** são os mesmos em todas as unidades, ou cada unidade tem a sua lista?~~ Respondida em E2-05 [CONFIRMADO]: a mesma lista em todas as unidades.
9. ~~O resumo deve **cruzar** tipo de serviço com tipo de veículo, ou basta ver cada um separado?~~ Respondida em E2-08 [CONFIRMADO]: separados no MVP; o cruzamento fica para depois (ver §8).

Continuam abertas, da visão, as dúvidas que afetam o modelo: **12** (lançamento Pessoal pertence a uma unidade?), **13** (categorias separadas para Pessoal e Empresa? — campo `aplica_a` já reservado) e **6** (foto do comprovante — exigiria Supabase Storage e mais espaço no aparelho).

---

## 8. Fora do escopo / módulos futuros

- **Foto do comprovante** (dúvida 6 da visão): exigiria armazenamento de arquivos (Supabase Storage), envio separado de imagens e regras de espaço no aparelho. Não modelado no MVP; entraria como tabela `lancamento_anexo`.
- **Lançamentos recorrentes** (dúvida 7 da visão): aluguel, internet etc. Ligado a contas a pagar (PIF-06).
- **Exportação para o contador** (dúvida 8 da visão): CSV/PDF por período; pode ser feita a partir do banco local ou do servidor.
- **Gestão de usuários e convites**, papéis gerente/funcionário e fluxo de pedido de reembolso com aprovação (D-02, PIF-05).
- **Painel web** para o dono ver os números no computador: o Supabase permite, mas não foi pedido.
- **Ligação de lançamento com funcionário, cliente, veículo ou produto**: pertence aos módulos de equipe, clientes, atendimento e estoque, via `origem_ref_*`.
- **Notificações** (ex.: resumo do dia) e alertas de gasto acima do normal.
- **Resumo cruzando tipo de serviço × tipo de veículo** (E2-08): fica para depois; o índice por tipo de veículo já permite.
- **Histórico de alterações das tabelas de cadastro** (categoria, tipo de serviço, forma de pagamento), além dos campos de auditoria.
