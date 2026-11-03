# Módulo 1 — Gestão de Finanças · Critérios de aceite e plano de qualidade

Projeto: Lavajato Sistema
Documento: 05-criterios-aceite.md · Autor: Agente QA · Versão: 10 · Status: **rascunho para revisão** (v2: critérios da nova FIN-US-04.7, filtro por tipo de serviço; D-QA-03 resolvida e D-QA-01 respondida pelo 04-backlog v2 · v3: critérios da FIN-US-02.12 com a regra do dono para E2-04/D-BL-01 — opção a), veículo obrigatório e tipo de serviço opcional · v4: D-QA-13 e D-QA-14 respondidas pelo Orquestrador; opção "Sem tipo de serviço" no filtro do Extrato e abertura da linha correspondente do Resumo · v5: decisões finais do dono (01-visao §9c): F-06 categorias de sistema, F-12 formas de pagamento e Pix no primeiro lançamento, F-13 edição sem troca de tipo, F-15 um celular — FIN-US-07.7 vai para a v1.1 · v6: F-02 MVP completo (M1 → M2 → M3, sem efeito nos critérios), F-03 só Android, F-05 unidade obrigatória também no Pessoal · v7: F-04 APK sem loja, F-08 unidades e formas na implantação, F-09 histórico e lixeira de 90 dias no MVP (FIN-US-06.4 e 06.5), F-10 sem PIN/biometria · v8: histórico, lixeira e exclusão conferidos com o 02-design v7 (TELA-07, TELA-09, TELA-15, TELA-16) · v9: D-QA-15 a D-QA-18 respondidas — histórico só leitura e sempre visível, aparelho/conflito para a v1.1, Desfazer pós-salvar fora da Lixeira · v10: D-QA-04 respondida pelo dono — nomes iguais sem diferença de maiúsculas, acentos e espaços nas pontas)
Fontes: `04-backlog.md` (v2), `03-arquitetura.md` (v1), `02-design.md` (v7), `01-visao.md` (v3, com as seções 9b e 9c). Em caso de conflito, vale a visão.

> Convenção: **[CONFIRMADO]** veio do dono · **[SUPOSIÇÃO]** não validado (entre parênteses, a dúvida que pode mudar o critério) · **[DÚVIDA]** precisa de resposta antes de virar regra.
> IDs: o critério **CA-02.3.1** pertence à história **FIN-US-02.3**. Casos de borda usam **CB-x.n** (x = letra do item 2 do pedido). Dúvidas novas levantadas por este documento usam **D-QA-nn**.
> Tela de referência: 360 × 640 dp. "Aparelho de entrada" = Android com 2 GB de RAM (RNF-02).

---

## 1. Visão geral

Este documento define **como saber que cada história MVP do 04-backlog está pronta**. Com a decisão **F-15** (o dono usa um só celular), a FIN-US-07.7 (conflito entre aparelhos) saiu do MVP e foi para a **v1.1**: com a **F-09**, a FIN-US-06.4 (histórico) e a FIN-US-06.5 (lixeira) entraram no MVP; o MVP passa a ter **62 histórias**, e **todas as 62** têm critérios no formato **Dado / Quando / Então** (**280 critérios** no total), cobrindo o caminho feliz e as validações principais. Os critérios da FIN-US-07.7 continuam neste documento, marcados como v1.1 e fora da contagem do MVP. A FIN-US-02.12 deixou de estar bloqueada: o dono respondeu a D-BL-01 (E2-04, opção a): **veículo obrigatório, tipo de serviço opcional**), conforme o 02-design v4 §JOR-b.

Depois vêm os **casos de borda** que atravessam várias histórias (valor, centavos, datas, duplicados, conflito, sincronização, cadastros, unidade, Pessoal/Empresa, período e segurança), os **riscos de qualidade**, a **estratégia de testes** (o que automatizar, o que testar à mão e o checklist no celular), as **suposições e dúvidas** e o que fica **fora do escopo**.

Regras de leitura:

- Um critério só é "aceito" se o comportamento for observado **com e sem internet**, salvo quando o critério diz o contrário (RNF-03).
- "Salvar" sempre significa **gravar no banco local**; a chegada ao servidor é verificada separadamente (RNF-09).
- Quando um critério depende de uma dúvida aberta (D-BL-01 a D-BL-10 do 04-backlog §6.2), ele usa a suposição atual, marcada [SUPOSIÇÃO], e indica qual dúvida pode mudá-lo. Este documento **não escolhe** a resposta.
- Totais (Entrou, Saiu, Sobrou) são sempre **somas exatas em centavos**; arredondamento só em percentuais exibidos (03-arquitetura §5.1).

---

## 2. Critérios de aceite por história

### FIN-EP-01 — Fundação

**FIN-US-01.1 — Projeto do app e navegação**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-01.1.1 | o app instalado e uma sessão ativa | o dono abre o app | aparece a Início (TELA-01) com a barra inferior Início · Extrato · Resumo · Mais, com Início marcada |
| CA-01.1.2 | qualquer tela principal aberta | o dono toca um item da barra inferior | abre a tela correspondente (TELA-01, 05, 06 ou 09) e o item fica marcado |
| CA-01.1.3 | um aparelho com tela de 360 × 640 dp | qualquer tela principal é exibida | não há rolagem horizontal, a barra inferior fica visível e toda área de toque tem pelo menos 48 dp (RNF-01) |
| CA-01.1.4 | um aparelho de entrada com o app fechado | o dono abre o app (partida a frio) | a Início aparece em até 3 s (RNF-12; medição formal em FIN-US-09.5) |

**FIN-US-01.2 — Projeto Supabase e migrações**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-01.2.1 | o projeto Supabase criado | a equipe consulta a configuração do projeto | a região é São Paulo (sa-east-1) (RNF-23) |
| CA-01.2.2 | um banco Postgres vazio | as migrações do repositório são aplicadas em ordem | o esquema resultante é idêntico ao de produção, sem nenhum passo manual |
| CA-01.2.3 | uma mudança de estrutura necessária | a equipe a aplica | ela existe como nova migração versionada no repositório; a comparação entre o esquema de produção e o gerado pelas migrações não mostra diferença (RNF-27) |

**FIN-US-01.3 — Esquema do banco**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-01.3.1 | as migrações aplicadas | a equipe lista as tabelas | existem as 12 tabelas da 03-arquitetura §3.2 com os campos, tipos, chaves e índices descritos |
| CA-01.3.2 | a tabela `lancamento` | alguém tenta gravar `valor_centavos` igual a 0, negativo ou com casas decimais | o banco recusa a gravação |
| CA-01.3.3 | a tabela `lancamento` | alguém tenta gravar `tipo`, `natureza`, `situacao` ou `origem` fora da lista permitida | o banco recusa (restrição `check`) |
| CA-01.3.4 | uma categoria do tipo `saida` | alguém tenta gravar um lançamento `entrada` com essa categoria | o banco recusa |
| CA-01.3.5 | um lançamento sem `unidade_id` | alguém tenta gravá-lo | o banco recusa, também quando o lançamento é Pessoal [CONFIRMADO F-05: todo lançamento pertence a uma unidade] |
| CA-01.3.6 | uma categoria ativa "Água" do tipo `saida` | alguém tenta criar outra categoria ativa "Água" do tipo `saida` na mesma organização | o banco recusa; com tipo `entrada`, ou se a primeira estiver desativada, aceita |
| CA-01.3.7 | a tabela `lancamento` | a equipe confere a estrutura | não existe campo de CPF, telefone, placa, modelo ou nome de cliente (RNF-24), e **não** existe restrição entre `tipo_servico_id` e `tipo_veiculo_id` (fica para FIN-US-02.12) |
| CA-01.3.8 | um lançamento novo gravado sem informar os campos reservados | a equipe consulta o registro | `situacao = realizado`, `origem = manual`, `versao = 1`, `excluido_em` nulo |

**FIN-US-01.4 — RLS**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-01.4.1 | as migrações aplicadas | a equipe consulta o catálogo do Postgres | **todas** as tabelas do esquema público têm RLS ligada |
| CA-01.4.2 | o usuário A com vínculo ativo de `dono` só na unidade U1, e lançamentos em U1 e U2 | A consulta `lancamento` | recebe só os lançamentos de U1 |
| CA-01.4.3 | o mesmo usuário A | A tenta inserir ou alterar um lançamento em U2 | o servidor recusa |
| CA-01.4.4 | um usuário dono com vínculo na unidade | ele tenta apagar fisicamente (DELETE) um lançamento ou um cadastro | o servidor recusa; só a exclusão lógica é possível |
| CA-01.4.5 | um usuário autenticado | ele tenta inserir um lançamento com `criado_por` diferente do seu próprio id | o servidor recusa |
| CA-01.4.6 | um vínculo `usuario_unidade` com `ativo = false` | o usuário consulta ou grava dados daquela unidade | não lê nem grava nada dela |
| CA-01.4.7 | uma chamada sem login (só com a chave pública) | ela consulta qualquer tabela | não recebe nenhuma linha |
| CA-01.4.8 | dois usuários, cada um em uma organização | um consulta categorias, tipos de serviço, tipos de veículo e formas de pagamento | vê só os da própria organização |
| CA-01.4.9 | qualquer usuário do app | ele tenta inserir, alterar ou apagar `lancamento_historico`, ou ler/alterar a `preferencia_usuario` de outro usuário | o servidor recusa |
| CA-01.4.10 | o pipeline de testes | um teste automatizado com dois usuários de unidades diferentes roda | o teste passa e roda a cada mudança de migração (RNF-19) |

**FIN-US-01.5 — Gatilhos de auditoria e histórico**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-01.5.1 | um lançamento novo enviado pelo app | o servidor o recebe | `recebido_servidor_em` é preenchido com a hora do servidor (mesmo que o app envie outro valor), `versao = 1` e o histórico ganha uma linha `criacao` com `dados_antes` nulo |
| CA-01.5.2 | um lançamento na versão N | uma alteração é aceita | `versao` passa a N+1 e o histórico ganha uma linha `alteracao` com antes, depois, `campos_alterados`, quem, quando e aparelho |
| CA-01.5.3 | um lançamento ativo | `excluido_em` é preenchido | o histórico ganha uma linha `exclusao` |
| CA-01.5.4 | um lançamento excluído | `excluido_em` volta a nulo | o histórico ganha uma linha `restauracao` |
| CA-01.5.5 | o app com token de usuário | ele tenta gravar no histórico diretamente | o servidor recusa; o histórico só é escrito pelo gatilho (RNF-14) |

**FIN-US-01.6 — Dados iniciais**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-01.6.1 | um banco recém-migrado | os dados iniciais são carregados | existem 1 organização, as unidades do dono (fuso `America/Sao_Paulo`) e um vínculo `dono` ativo para cada unidade; unidades e formas de pagamento são cadastradas pela equipe na implantação, sem tela para isso no app [CONFIRMADO F-08] |
| CA-01.6.2 | os dados iniciais carregados | a equipe consulta as categorias | as 4 de sistema (Serviços, Produtos, Mão de obra, Reembolso) existem com `sistema = true`, e as demais categorias iniciais com `sistema = false`; "Serviços" é do tipo `entrada`, e "Produtos", "Mão de obra" e "Reembolso" são do tipo `saida`; existe também a categoria de entrada "Venda de produtos" (`sistema = false`) [CONFIRMADO S-BL-09 para Produtos e Venda de produtos] |
| CA-01.6.3 | os dados iniciais carregados | a equipe consulta os cadastros | existem os tipos de veículo Carro, Moto, SUV, Caminhonete/Picape e Van, cada um com ícone próprio [CONFIRMADO E2-07]; as formas Dinheiro, Pix, Cartão de débito e Cartão de crédito, todas ativas [CONFIRMADO F-12]; e os tipos de serviço iniciais (lista depende da dúvida 5a da visão) |
| CA-01.6.4 | os dados iniciais já carregados | a carga é executada de novo | nenhum registro é duplicado [SUPOSIÇÃO] |
| CA-01.6.5 | o primeiro acesso do dono | ele abre "− Saiu", "+ Entrou" e "+ Carro" | consegue salvar uma saída, uma entrada e um serviço sem criar nenhum cadastro antes |

**FIN-US-01.7 — Entrar com e-mail e senha**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-01.7.1 | um usuário cadastrado, com internet, na TELA-13 | ele informa e-mail e senha corretos e toca Entrar | entra no app |
| CA-01.7.2 | a TELA-13 | ele informa senha ou e-mail errado | vê uma mensagem de erro em linguagem simples e continua na TELA-13 |
| CA-01.7.3 | o primeiro acesso, sem internet | ele toca Entrar | vê uma mensagem dizendo que o primeiro acesso precisa de internet; nada trava |
| CA-01.7.4 | o dono já entrou uma vez | fecha o app, liga o modo avião e o abre de novo | o app abre direto na Início, sem pedir login, por pelo menos 30 dias [SUPOSIÇÃO de prazo, RNF-04] |
| CA-01.7.5 | a configuração do Supabase Auth | alguém cria ou troca senha com menos de 8 caracteres | é recusada (RNF-21) |

**FIN-US-01.8 — Primeiro uso**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-01.8.1 | o primeiro login neste aparelho | o login termina | aparece a tela curta "Lance o que entra e o que sai. A gente soma tudo para você." com a escolha da unidade inicial; "Começar" fica desabilitado até escolher uma unidade [SUPOSIÇÃO] |
| CA-01.8.2 | a unidade inicial escolhida | o dono toca "Começar" | os dados (unidades, cadastros e lançamentos existentes) são baixados e a Início abre na unidade escolhida |
| CA-01.8.3 | o download inicial concluído | o dono liga o modo avião | consegue lançar, ver o extrato, o resumo e os cadastros |
| CA-01.8.4 | o download inicial em andamento | a internet cai | o app avisa e oferece "Tentar de novo"; não abre a Início com dados pela metade [SUPOSIÇÃO] |
| CA-01.8.5 | o primeiro uso já concluído | o dono abre o app de novo | a tela de boas-vindas não aparece |

**FIN-US-01.9 — Componentes base e formatação**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-01.9.1 | os valores 123456, 5, 0 e 99999999 centavos | são exibidos | aparecem como "R$ 1.234,56", "R$ 0,05", "R$ 0,00" e "R$ 999.999,99", formatados a partir do inteiro, sem conversão para número com vírgula |
| CA-01.9.2 | um saldo de −2550 centavos | é exibido | aparece "−R$ 25,50" em vermelho |
| CA-01.9.3 | lançamentos de hoje, de ontem e de 03/11 (no fuso da unidade) | aparecem em listas | os rótulos de data são "Hoje", "Ontem" e "03/11" |
| CA-01.9.4 | o leitor de tela do aparelho ligado | o foco passa pelos botões principais | cada um é lido com rótulo próprio (ex.: "Adicionar carro", "Registrar saída") |
| CA-01.9.5 | a fonte do sistema no maior tamanho | as telas principais são exibidas | nenhum texto é cortado a ponto de esconder valor ou botão |

### FIN-EP-02 — Lançamentos

**FIN-US-02.1 — Valor estilo caixa registradora**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-02.1.1 | a Início | o dono toca "+ Carro", "+ Entrou" ou "− Saiu" | o formulário abre em até 1 s com o foco no valor, o teclado numérico aberto e "R$ 0,00" em cinza (RNF-10) |
| CA-02.1.2 | o campo de valor zerado | o dono digita `2` `5` / `2` `5` `0` `0` / `1` `2` `4` `0` `0` `0` | o campo mostra R$ 0,25 / R$ 25,00 / R$ 1.240,00 [CONFIRMADO DU-03] |
| CA-02.1.3 | o valor R$ 25,00 | o dono toca ⌫ | o valor passa a R$ 2,50 |
| CA-02.1.4 | qualquer valor | o dono segura ⌫ | o valor volta a R$ 0,00 [CONFIRMADO E2-03] |
| CA-02.1.5 | o valor R$ 0,00 | o dono olha o botão Salvar | Salvar está desabilitado |
| CA-02.1.6 | o valor R$ 999.999,99 | o dono digita mais um dígito | o valor não muda [SUPOSIÇÃO: limite e comportamento — D-QA-10] |
| CA-02.1.7 | um valor de R$ 12.000,00 e os demais campos válidos | o dono toca Salvar | aparece "Confere? R$ 12.000,00"; confirmar salva, cancelar volta ao formulário com o valor intacto [SUPOSIÇÃO: limite de R$ 10.000,00] |
| CA-02.1.8 | o valor R$ 35,50 salvo | a equipe consulta o banco local e o servidor | `valor_centavos = 3550` |

**FIN-US-02.2 — Campos comuns pré-preenchidos**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-02.2.1 | a preferência Pessoal/Empresa em "Empresa" | o dono abre qualquer formulário de lançamento | o dropdown mostra "Empresa"; se a preferência for "Pessoal", mostra "Pessoal" [CONFIRMADO DU-02] |
| CA-02.2.2 | a unidade atual com fuso `America/Sao_Paulo` | o dono abre um formulário | a data vem com o dia de hoje nesse fuso |
| CA-02.2.3 | o seletor de data aberto | o dono olha os dias depois de hoje | estão apagados e não respondem ao toque; dias passados podem ser escolhidos [SUPOSIÇÃO S-05] |
| CA-02.2.4 | uma unidade específica selecionada no topo | o dono abre um formulário | o campo Unidade vem com essa unidade e pode ser trocado |
| CA-02.2.5 | "Todas as unidades" selecionado no topo | o dono abre um formulário | o campo Unidade aparece no topo, destacado e vazio, e Salvar fica desabilitado até escolher [SUPOSIÇÃO SUP-D05] |
| CA-02.2.6 | uma saída anterior paga com "Pix" e uma entrada anterior com "Dinheiro" | o dono abre "− Saiu" e depois "+ Entrou" | a forma vem "Pix" na saída e "Dinheiro" na entrada [CONFIRMADO F-12: nos seguintes, a última usada; SUPOSIÇÃO SUP-D02: a última usada é contada por tipo de lançamento] |
| CA-02.2.7 | o formulário aberto | o dono olha a descrição | ela vem recolhida; ao abrir, aceita até 200 caracteres e não aceita o 201º [SUPOSIÇÃO de limite] |
| CA-02.2.8 | nenhum lançamento anterior daquele tipo neste usuário (primeiro lançamento) | o dono abre "− Saiu", "+ Entrou" ou "+ Carro" | a forma de pagamento vem marcada em **Pix**, e as quatro formas (Dinheiro, Pix, Cartão de débito, Cartão de crédito) estão disponíveis para troca [CONFIRMADO F-12] |

**FIN-US-02.3 — Lançar saída**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-02.3.1 | categorias de saída ativas | o dono abre "− Saiu" | a grade mostra as 7 primeiras categorias de saída **ativas**, pela ordem, mais "Outros/•••", que lista todas as ativas |
| CA-02.3.2 | um valor digitado e nenhuma categoria escolhida | o dono olha o formulário | Salvar está desabilitado e aparece "Escolha a categoria" junto à grade (nunca em janela) |
| CA-02.3.3 | valor e categoria escolhidos, com ou sem internet | o dono toca Salvar | a confirmação aparece em até 300 ms e o lançamento fica no banco local com `tipo = saida`, unidade, `criado_por`, `dispositivo_id`, `criado_em`, `situacao = realizado` e `origem = manual` (RNF-09, RNF-13) |
| CA-02.3.4 | a saída salva | a equipe confere o lançamento | `tipo_servico_id` e `tipo_veiculo_id` são nulos |

**FIN-US-02.4 — Lançar outra entrada**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-02.4.1 | categorias de entrada ativas | o dono abre "+ Entrou" | a tela usa a cor verde e a grade mostra as categorias de entrada ativas **sem** "Serviços"; a venda de produto ao cliente é lançada em "Venda de produtos", e a categoria de sistema "Produtos" (de saída) não aparece [S-BL-09] |
| CA-02.4.2 | valor e categoria escolhidos | o dono toca Salvar | o lançamento é gravado com `tipo = entrada`, sem tipo de serviço nem de veículo |
| CA-02.4.3 | valor zerado ou categoria não escolhida | o dono olha o formulário | Salvar está desabilitado, como na saída |

**FIN-US-02.5 — Entrada de serviço carro por carro**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-02.5.1 | a Início | o dono toca "+ Carro" | abre a TELA-02 na ordem Serviço → Veículo → Valor → Pagou com, com o teclado aberto no valor e nenhum preço sugerido |
| CA-02.5.2 | um serviço anterior lançado com "SUV" | o dono abre a TELA-02 | "SUV" vem marcado, com fundo verde e nome visível [CONFIRMADO E2-06] |
| CA-02.5.3 | nenhum serviço lançado antes neste usuário | o dono abre a TELA-02 | nenhum veículo vem marcado [SUPOSIÇÃO SUP-D16] |
| CA-02.5.4 | tipo de serviço, veículo, valor e forma escolhidos | o dono toca Salvar | o lançamento é gravado como entrada da categoria "Serviços" (escolhida pelo app, identificada pela marca de sistema, não pelo nome), com `tipo_veiculo_id` preenchido e `tipo_servico_id` preenchido quando o dono escolheu um serviço (sem serviço, fica nulo — FIN-US-02.12) |
| CA-02.5.5 | um serviço salvo com "Moto" | o dono abre a TELA-02 de novo | "Moto" passa a ser o veículo marcado |

A regra de obrigatoriedade de serviço e veículo está na FIN-US-02.12.

**FIN-US-02.6 — "+ Novo serviço" no lançamento**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-02.6.1 | a TELA-02 aberta | o dono toca "+ Novo serviço", digita "Lavagem de motor" e salva | a folha fecha, o serviço novo fica selecionado, entra no fim da ordem e o restante do formulário não se perde |
| CA-02.6.2 | um serviço ativo "Lavagem simples" | o dono tenta criar "Lavagem simples" | aparece "Já existe um serviço com esse nome." e nada é criado [CONFIRMADO D-QA-04: a comparação ignora maiúsculas, acentos e espaços nas pontas; "lavagem simples" também é recusado] |
| CA-02.6.3 | um serviço desativado "Lavagem de motor" | o dono tenta criar "Lavagem de motor" | aparece "'Lavagem de motor' está desativado. [Reativar e usar]"; ao tocar, ele é reativado e selecionado, sem criar outro [SUPOSIÇÃO SUP-D14] |
| CA-02.6.4 | a folha de novo serviço com o nome vazio ou só com espaços | o dono olha o botão Salvar da folha | está desabilitado |

**FIN-US-02.7 — "+ Novo veículo" no lançamento**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-02.7.1 | a TELA-02 aberta | o dono toca "+ Novo veículo" (fim da fileira), digita "Ônibus" e salva | o veículo é criado com ícone genérico, fica selecionado e entra no fim da fileira [SUPOSIÇÃO visão 3b-1] |
| CA-02.7.2 | um veículo ativo "Moto" | o dono tenta criar "Moto" | aparece "Já existe um veículo com esse nome." e nada é criado |
| CA-02.7.3 | um veículo desativado "Ônibus" | o dono tenta criar "Ônibus" | aparece "'Ônibus' está desativado. [Reativar e usar]" e o veículo é reativado e selecionado |
| CA-02.7.4 | um veículo criado na unidade A | o dono abre a TELA-02 na unidade B | o veículo aparece também (lista comum) [CONFIRMADO E2-05] |

**FIN-US-02.8 — Voltar à Início com aviso e Desfazer**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-02.8.1 | uma saída de R$ 25,00 pronta | o dono toca Salvar | volta à Início com o saldo já atualizado e o aviso "Saída de R$ 25,00 salva · Desfazer" por cerca de 5 s, sem bloquear a tela |
| CA-02.8.2 | um serviço "Lavagem completa · SUV · R$ 60,00" pronto | o dono toca Salvar | o aviso mostra serviço, veículo e valor, com "Desfazer" e "Mais um igual" |
| CA-02.8.3 | o aviso visível | o dono toca "Desfazer" | o lançamento some da Início, do extrato e dos totais e **não** aparece na Lixeira (é correção imediata de engano); no banco fica com `excluido_em` preenchido (exclusão lógica) e com o histórico [SUPOSIÇÃO, D-QA-18] |
| CA-02.8.4 | o aviso exibido há mais de ~5 s | o dono olha a tela | o aviso sumiu e o lançamento continua salvo |

**FIN-US-02.9 — "Mais um igual" e "Repetir"**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-02.9.1 | o aviso de um serviço "Lavagem rápida · Carro · Dinheiro" | o dono toca "Mais um igual" | abre a TELA-02 com serviço, veículo e forma iguais, **valor vazio** e teclado aberto [SUPOSIÇÃO visão 3c] |
| CA-02.9.2 | um serviço lançado hoje na unidade atual | o dono olha a Início | aparece "Repetir: serviço · veículo · forma" do último serviço de hoje nessa unidade; ao tocar, abre como em CA-02.9.1 [SUPOSIÇÃO SUP-D04] |
| CA-02.9.3 | nenhum serviço hoje na unidade atual | o dono olha a Início | o botão "Repetir" não aparece |
| CA-02.9.4 | o último serviço de hoje foi desfeito ou excluído | o dono olha a Início | "Repetir" usa o serviço anterior a ele, ou some se não houver outro [SUPOSIÇÃO] |

**FIN-US-02.10 — Descartar lançamento**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-02.10.1 | um formulário em que o dono digitou valor ou mudou algum campo | ele toca ✕ ou o botão voltar do Android | aparece "Descartar este lançamento?" com [Continuar lançando] e [Descartar] |
| CA-02.10.2 | a pergunta exibida | ele toca "Continuar lançando" | volta ao formulário com tudo como estava |
| CA-02.10.3 | a pergunta exibida | ele toca "Descartar" | o formulário fecha e nada é gravado |
| CA-02.10.4 | um formulário aberto sem nenhuma mudança além dos valores pré-preenchidos | ele toca ✕ | o formulário fecha sem perguntar [SUPOSIÇÃO] |

**FIN-US-02.11 — Botões de lançamento na Início**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-02.11.1 | a Início em tela de 360 × 640 dp | ela é exibida, com ou sem rolagem da lista | os botões "+ Carro", "+ Entrou" e "− Saiu" ficam fixos na parte de baixo, com ~72 dp de altura |
| CA-02.11.2 | a Início | o dono toca cada botão | abre a TELA-02, TELA-04 e TELA-03, respectivamente, com 1 toque |

**FIN-US-02.12 — Regra serviço × veículo**

Regra do dono [CONFIRMADO, E2-04 opção a)]: **numa entrada de serviço, o tipo de veículo é obrigatório e o tipo de serviço é opcional.** Valem a apresentação e os textos do 02-design v4 (JOR-b e §5.6). "Entrada de serviço" passa a ser a entrada da categoria de sistema "Serviços", e não mais "entrada com `tipo_servico_id` preenchido", como dizem a 03-arquitetura §3.2 e a S-10 [CONFIRMADO pelo Orquestrador, D-QA-13 respondida].

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-02.12.1 | a TELA-02 com veículo "SUV" marcado, valor R$ 60,00 e **nenhum** tipo de serviço | o dono olha o botão Salvar e toca nele | Salvar está habilitado; o lançamento é gravado como entrada da categoria "Serviços" com `tipo_veiculo_id` = SUV e `tipo_servico_id` nulo |
| CA-02.12.2 | a TELA-02 com valor digitado e **nenhum** veículo marcado (primeiro uso, ou o último veículo usado foi desativado) | o dono olha o formulário | Salvar está desabilitado e aparece "Escolha o veículo" junto à fileira de veículos, nunca em janela; ao tocar um veículo, Salvar habilita |
| CA-02.12.3 | a TELA-02 sem tipo de serviço escolhido | o dono olha a grade de serviços | não há aviso nem destaque de erro na grade; o título é "Qual serviço? (opcional)" [SUPOSIÇÃO de texto] |
| CA-02.12.4 | o tipo "Lavagem completa" marcado | o dono toca de novo em "Lavagem completa" | o tipo é desmarcado e o Salvar continua habilitado se houver veículo e valor [SUPOSIÇÃO] |
| CA-02.12.5 | um serviço salvo sem tipo de serviço, em SUV, pago com Pix | ele aparece no aviso pós-salvar, no Extrato, nos últimos 5 da Início e no detalhe | é mostrado como "Serviço · SUV · Pix" (com o valor), no lugar do nome do tipo de serviço [SUPOSIÇÃO de texto, 02-design] |
| CA-02.12.6 | um serviço salvo sem tipo de serviço | o dono toca "Mais um igual" ou "Repetir" | a TELA-02 abre com o mesmo veículo e a mesma forma, **sem** tipo de serviço marcado e com o valor vazio |
| CA-02.12.7 | a edição de um serviço com tipo de serviço e veículo | o dono desmarca o tipo de serviço / tenta deixar sem veículo | "Salvar alterações" continua habilitado / fica desabilitado com "Escolha o veículo" |
| CA-02.12.8 | o servidor | chega uma entrada da categoria "Serviços" **sem** `tipo_veiculo_id` (app antigo ou chamada direta) | o servidor recusa; no app, o item vira erro de dado na TELA-12, com opção de corrigir (FIN-US-07.6) |
| CA-02.12.9 | o servidor | chega uma entrada da categoria "Serviços" com `tipo_veiculo_id` e sem `tipo_servico_id` | o servidor aceita |
| CA-02.12.10 | o servidor | chega uma saída, ou uma entrada de outra categoria, com `tipo_veiculo_id` ou `tipo_servico_id` preenchido | o servidor recusa [SUPOSIÇÃO: a 03-arquitetura diz que o veículo deve ser nulo fora das entradas de serviço; aqui vale o mesmo para o tipo de serviço] |
| CA-02.12.11 | serviços com e sem tipo de serviço no período | o dono abre Resumo › Serviços em "Por serviço" e em "Por veículo" | em "Por serviço", os sem tipo aparecem numa linha "Sem tipo de serviço"; em "Por veículo", entram normalmente no seu veículo (ver CA-05.4.4 e CA-05.5.2) [SUPOSIÇÃO de texto, 02-design] |

### FIN-EP-03 — Cadastros

**FIN-US-03.1 — Categorias**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-03.1.1 | a TELA-10 | o dono a abre | vê abas Saídas/Entradas, cada uma com a lista de categorias (ícone, cor, chave Ativa) e "+ Nova" |
| CA-03.1.2 | a aba Saídas | o dono cria "Lanche" com ícone e cor | a categoria aparece na grade da "− Saiu" (respeitando a ordem) com `sistema = false` |
| CA-03.1.3 | uma categoria de saída ativa "Água" | o dono tenta criar ou renomear outra de saída para "Água", "água" ou "Agua" | o app recusa com mensagem junto ao campo [texto SUPOSIÇÃO: "Já existe uma categoria com esse nome."]; com o mesmo nome em Entradas, aceita [CONFIRMADO D-QA-04] |
| CA-03.1.4 | lançamentos antigos na categoria "Luz" | o dono a renomeia para "Energia" | o extrato e o resumo passam a mostrar "Energia" também nos antigos |
| CA-03.1.5 | lançamentos antigos na categoria "Luz" | o dono desliga a chave Ativa | "Luz" some da grade de lançamento, mas os lançamentos antigos continuam no extrato e somados no resumo |
| CA-03.1.6 | qualquer categoria | o dono procura uma opção de excluir | não existe; só desativar |

**FIN-US-03.2 — Categorias de sistema**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-03.2.1 | a TELA-10 | o dono olha Serviços, Produtos, Mão de obra e Reembolso | cada uma tem a chave Ativa ligada e travada, com cadeado e o texto "Categoria usada pelo sistema. Pode mudar o nome, mas não pode ser desativada." |
| CA-03.2.2 | uma categoria de sistema | o dono toca a chave travada | nada muda |
| CA-03.2.3 | a categoria "Mão de obra" | o dono a renomeia para "Diárias" | o novo nome é aceito (ícone e cor também podem ser trocados) e os lançamentos e o comportamento ligados a ela continuam iguais [CONFIRMADO F-06] |
| CA-03.2.4 | uma categoria com `sistema = true` | alguém tenta gravar `ativa = false` direto no servidor | o servidor recusa [CONFIRMADO F-06: não pode ser desativada; a recusa no servidor é a proteção técnica dessa regra] |

**FIN-US-03.3 — Tipos de serviço**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-03.3.1 | a TELA-11 | o dono cria "Polimento" (só o nome) | o tipo aparece no fim da grade da TELA-02 |
| CA-03.3.2 | um tipo ativo "Polimento" | o dono tenta criar ou renomear outro para "Polimento" | é recusado com "Já existe um serviço com esse nome." |
| CA-03.3.3 | um tipo desativado "Cera" | o dono tenta criar "Cera" | o app oferece reativar [SUPOSIÇÃO] |
| CA-03.3.4 | lançamentos antigos de "Cera" | o dono desativa "Cera" | ela some da grade da TELA-02, mas os lançamentos antigos continuam no extrato e no Resumo › Serviços com o nome "Cera" |

**FIN-US-03.4 — Tipos de veículo**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-03.4.1 | a TELA-14 | o dono cria "Caminhão" | ele aparece na fileira da TELA-02, em todas as unidades, com ícone genérico |
| CA-03.4.2 | um veículo ativo ou desativado com o mesmo nome | o dono tenta criar o repetido | valem as mesmas regras de CA-02.7.2 e CA-02.7.3 |
| CA-03.4.3 | "Van" é o último veículo usado | o dono desativa "Van" e abre a TELA-02 | nenhum veículo vem marcado |
| CA-03.4.4 | lançamentos antigos de "Van" | o dono desativa "Van" | os antigos continuam no extrato e no Resumo › Por veículo |

**FIN-US-03.5 — Reordenar**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-03.5.1 | a TELA-10, 11 ou 14 | o dono arrasta um item para o primeiro lugar | a nova ordem é gravada e aparece na grade/fileira do formulário correspondente |
| CA-03.5.2 | uma categoria de saída arrastada da 9ª para a 2ª posição | o dono abre "− Saiu" | ela aparece entre as 7 da grade |
| CA-03.5.3 | uma ordem mudada no aparelho A | a sincronização termina | o aparelho B mostra a mesma ordem |

### FIN-EP-04 — Extrato e filtros

**FIN-US-04.1 — Extrato**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-04.1.1 | lançamentos em vários dias | o dono abre o Extrato | a lista vem agrupada por dia, do mais recente para o mais antigo |
| CA-04.1.2 | um serviço, uma saída pessoal e uma entrada | aparecem no Extrato | cada item mostra ícone, categoria ou serviço, veículo (só nos serviços), unidade, forma, valor com sinal e cor (entrada "+", saída "−") e o rótulo "Pessoal" só no pessoal |
| CA-04.1.3 | um lançamento ainda não enviado | aparece no Extrato | tem a marca de pendente (relógio); depois de enviado, a marca some |
| CA-04.1.4 | o filtro atual | o dono olha o topo | Entrou, Saiu e Sobrou são a soma exata dos itens listados |
| CA-04.1.5 | um lançamento excluído ou desfeito | o dono abre o Extrato | ele não aparece e não entra nos totais |

**FIN-US-04.2 — Período (atalhos e calendário)**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-04.2.1 | a folha de período aberta | o dono toca Hoje, Semana, Mês ou Mês passado | o filtro é aplicado na hora, a folha fecha e o chip mostra o nome do atalho |
| CA-04.2.2 | hoje é quinta, 06/11 | o dono toca "Mês" / "Mês passado" | o período é de 01/11 a 06/11 / de 01/10 a 31/10 |
| CA-04.2.3 | o calendário | o dono toca 29/10 e Aplicar | o chip mostra "29/10" e a lista e os totais são só daquele dia |
| CA-04.2.4 | o calendário | o dono toca 02/11, depois 27/10, e Aplicar | o intervalo é invertido para 27/10 a 02/11, a linha mostra "De 27/10 a 02/11 · 7 dias" e o chip "27/10 a 02/11" |
| CA-04.2.5 | um intervalo marcado | o dono toca um terceiro dia | a escolha recomeça a partir desse dia |
| CA-04.2.6 | o calendário aberto | o dono tenta tocar um dia depois de hoje | o dia está apagado e não responde |
| CA-04.2.7 | nenhum dia marcado / o calendário com uma escolha não aplicada | o dono olha Aplicar / fecha a folha | Aplicar está desabilitado / o filtro anterior continua |
| CA-04.2.8 | um intervalo de 15/12/2025 a 10/01/2026 | é aplicado | o chip mostra "15/12/25 a 10/01/26" |
| CA-04.2.9 | um período em uso | o dono reabre a folha | o período em uso aparece marcado |

**FIN-US-04.3 — Filtros de unidade e Pessoal/Empresa**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-04.3.1 | lançamentos em duas unidades | o dono filtra "Unidade Centro" / "Todas" | vê só os da Centro / os das duas |
| CA-04.3.2 | lançamentos Empresa e Pessoal | o dono escolhe Empresa, Pessoal ou Tudo | a lista e os totais mostram só o que corresponde (ver CB-i) |
| CA-04.3.3 | um filtro ativo | o dono olha os chips | o chip ativo aparece preenchido com "×"; tocar "×" limpa só aquele filtro |
| CA-04.3.4 | algum filtro ativo | o dono toca "Limpar filtros" | todos os filtros voltam ao padrão [o período padrão depende da D-BL-02] |
| CA-04.3.5 | filtros que não retornam nada | o dono olha a lista | aparece "Nenhum lançamento com esses filtros." e o botão "Limpar filtros" |

**FIN-US-04.4 — Filtro por categoria**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-04.4.1 | lançamentos em várias categorias | o dono marca "Água" e "Luz" | a lista e os totais mostram só essas duas |
| CA-04.4.2 | uma categoria desativada com lançamentos no período | o dono abre o filtro de categoria | ela aparece como opção [SUPOSIÇÃO] |

**FIN-US-04.5 — Filtro por tipo de veículo**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-04.5.1 | serviços de Moto e SUV, saídas e outras entradas | o dono marca "Moto" e "SUV" | a lista mostra só as entradas de serviço desses veículos e o chip Categoria passa a "Serviços" [SUPOSIÇÃO 02-design JOR-f 4b] |
| CA-04.5.2 | o filtro de veículo ativo | o dono olha os totais | Saiu é R$ 0,00 e Entrou é a soma exata dos serviços listados |
| CA-04.5.3 | o filtro de veículo ativo | o dono limpa o filtro de veículo | o chip Categoria volta ao estado anterior [SUPOSIÇÃO] |

**FIN-US-04.7 — Filtro por tipo de serviço**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-04.7.1 | serviços "Lavagem simples" e "Completa", serviços sem tipo de serviço, saídas e outras entradas | o dono marca "Lavagem simples" e "Completa" | a lista mostra só as entradas de serviço desses tipos e o chip Categoria passa a "Serviços" [SUPOSIÇÃO, mesmo padrão do filtro por veículo]; as entradas de serviço **sem** tipo de serviço só aparecem se a opção "Sem tipo de serviço" também estiver marcada (CA-04.7.7) |
| CA-04.7.2 | o filtro de tipo de serviço ativo | o dono olha os totais | Saiu é R$ 0,00 e Entrou é a soma exata dos serviços listados |
| CA-04.7.3 | serviços "Lavagem simples" em Carro e em SUV, e "Completa" em SUV | o dono marca o serviço "Lavagem simples" e o veículo "SUV" | aparece só "Lavagem simples" em SUV: entre os dois filtros vale "e"; dentro de cada filtro, os itens marcados valem "ou" [SUPOSIÇÃO] |
| CA-04.7.4 | os filtros de serviço e de veículo ativos | o dono limpa só o filtro de serviço | continua valendo o filtro de veículo e o chip Categoria continua "Serviços"; ao limpar também o de veículo, o chip Categoria volta ao estado anterior [SUPOSIÇÃO] |
| CA-04.7.5 | um tipo de serviço desativado com lançamentos no período | o dono abre o filtro de tipo de serviço | ele aparece como opção [SUPOSIÇÃO, igual a CA-04.4.2] |
| CA-04.7.6 | a linha "Lavagem simples" no Resumo › Serviços › Por serviço | o dono a toca (FIN-US-05.6) | o Extrato abre com o chip de serviço em "Lavagem simples", no mesmo período, unidade e Pessoal/Empresa, e o Entrou é igual ao valor da linha tocada |
| CA-04.7.7 | 2 serviços sem tipo de serviço (R$ 30,00 em Carro e R$ 50,00 em SUV), outros serviços, saídas e outras entradas | o dono abre o filtro de tipo de serviço e marca "Sem tipo de serviço" | a opção aparece no fim da lista de tipos [SUPOSIÇÃO de posição]; a lista mostra só os 2 serviços sem tipo, o chip Categoria passa a "Serviços", Saiu é R$ 0,00 e Entrou é R$ 80,00 [SUPOSIÇÃO, D-QA-14] |
| CA-04.7.8 | os dados de CA-04.7.7 e um serviço "Lavagem simples" | o dono marca "Sem tipo de serviço" e "Lavagem simples" e depois o veículo "SUV" | primeiro aparecem os sem tipo e os de "Lavagem simples" ("ou" dentro do filtro); com SUV, só os desses dois grupos que são de SUV ("e" entre filtros), como em CA-04.7.3 [SUPOSIÇÃO] |

**FIN-US-04.6 — Últimos 5 na Início**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-04.6.1 | mais de 5 lançamentos na unidade atual | o dono olha a Início | vê os 5 mais recentes, com o veículo nos serviços [SUPOSIÇÃO: "recentes" pela hora de criação — D-QA-11] |
| CA-04.6.2 | a lista da Início | o dono toca "Ver tudo ›" | abre o Extrato |
| CA-04.6.3 | nenhum lançamento hoje | o dono olha a Início | aparece "Nada lançado hoje ainda. Lavou um carro? Toque em + Carro." |
| CA-04.6.4 | um item da lista | o dono o toca | abre o detalhe (TELA-07) |

### FIN-EP-05 — Resumo

**FIN-US-05.1 — Cartão de saldo na Início**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-05.1.1 | entradas de R$ 300,00 e saídas de R$ 120,50 hoje | o dono olha o cartão na aba Hoje | Entrou R$ 300,00, Saiu R$ 120,50, Sobrou R$ 179,50 |
| CA-05.1.2 | o cartão | o dono troca entre Hoje e Mês | os valores passam a ser do dia / do mês civil até hoje [aba inicial: SUPOSIÇÃO, D-BL-10] |
| CA-05.1.3 | o filtro em "Tudo" | o dono olha o cartão | aparecem o total e as linhas "Empresa: R$ …" e "Pessoal: R$ …", cuja soma é igual ao total |
| CA-05.1.4 | saídas maiores que entradas | o dono olha o cartão | Sobrou aparece em vermelho com "−" |
| CA-05.1.5 | o app sem internet | o dono salva ou desfaz um lançamento | o cartão é atualizado na hora |

**FIN-US-05.2 — Consolidado de todas as unidades**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-05.2.1 | duas unidades com movimento | o dono escolhe "Todas as unidades" | o cartão mostra o consolidado e uma linha "Sobrou" por unidade |
| CA-05.2.2 | o consolidado exibido | o dono soma as linhas | a soma dos "Sobrou" das unidades é exatamente o "Sobrou" consolidado |
| CA-05.2.3 | uma unidade sem movimento no período | o dono olha as linhas | ela aparece com R$ 0,00 [SUPOSIÇÃO] |

**FIN-US-05.3 — Gastos por categoria**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-05.3.1 | saídas em várias categorias no período | o dono abre Resumo › Gastos | vê barras horizontais da maior para a menor, com valor e percentual |
| CA-05.3.2 | 3 categorias de R$ 1,00 cada | o dono olha os percentuais | cada uma mostra 33% (arredondado só na tela, meia unidade para cima) e o total de R$ 3,00 é exato |
| CA-05.3.3 | período, unidade e Pessoal/Empresa escolhidos no Extrato | o dono abre o Resumo | os mesmos chips e o mesmo período estão aplicados |
| CA-05.3.4 | "Todas as unidades" | o dono abre Gastos | aparece a visão "Por unidade" |
| CA-05.3.5 | nenhum gasto no período | o dono abre Gastos | aparece "Sem gastos neste período." |

**FIN-US-05.4 — Serviços por tipo de serviço**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-05.4.1 | 3 "Lavagem simples" (R$ 40,00 cada) e 1 "Completa" (R$ 80,00) no período | o dono abre Resumo › Serviços | vê "Lavagem simples · 3 · R$ 120,00" e "Completa · 1 · R$ 80,00" |
| CA-05.4.2 | a aba Serviços | o dono escolhe Dia / Mês | é aplicado o atalho Hoje / Mês do chip de período compartilhado [SUPOSIÇÃO] |
| CA-05.4.3 | nenhum serviço no período | o dono abre a aba | aparece "Nenhum carro lançado neste período." com o botão "+ Carro" |
| CA-05.4.4 | 2 serviços sem tipo de serviço (R$ 30,00 e R$ 50,00) no período | o dono abre Resumo › Serviços › Por serviço | aparece a linha "Sem tipo de serviço · 2 · R$ 80,00", e a soma de todas as linhas é igual ao total de entradas de serviço do período [CONFIRMADO E2-04 a); texto da linha SUPOSIÇÃO] |
| CA-05.4.5 | nenhum serviço sem tipo de serviço no período | o dono abre Resumo › Serviços › Por serviço | a linha "Sem tipo de serviço" não aparece; quando aparece, fica por último, depois dos tipos de serviço [SUPOSIÇÃO de posição] |

**FIN-US-05.5 — Serviços por tipo de veículo**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-05.5.1 | serviços de Carro, Moto e SUV no período | o dono toca "Por veículo" | vê quantidade e valor por tipo de veículo [seletor: SUPOSIÇÃO] |
| CA-05.5.2 | as duas visões | o dono compara os totais | o valor e a quantidade totais "Por veículo" são iguais aos de "Por serviço" (contando a linha "Sem tipo de serviço"), porque toda entrada de serviço tem veículo [CONFIRMADO E2-04 a)] |

**FIN-US-05.6 — Do Resumo para o Extrato**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-05.6.1 | a barra "Água" no Resumo, em "Semana" | o dono a toca | abre o Extrato filtrado por "Água", no mesmo período, unidade e Pessoal/Empresa, com o mesmo total |
| CA-05.6.2 | a linha "SUV" em "Por veículo" | o dono a toca | abre o Extrato com o filtro de veículo (FIN-US-04.5) em SUV, no mesmo período, unidade e Pessoal/Empresa, com o mesmo total |
| CA-05.6.3 | a linha "Lavagem simples" em "Por serviço" | o dono a toca | abre o Extrato com o filtro de tipo de serviço (FIN-US-04.7) em "Lavagem simples", no mesmo período, unidade e Pessoal/Empresa, com o mesmo total; os serviços sem tipo não aparecem (ver CA-04.7.1 e CA-04.7.6) |
| CA-05.6.4 | a linha "Sem tipo de serviço · 2 · R$ 80,00" em "Por serviço" | o dono a toca | abre o Extrato com o filtro de tipo de serviço só na opção "Sem tipo de serviço" (CA-04.7.7), no mesmo período, unidade e Pessoal/Empresa, mostrando os 2 lançamentos e Entrou = R$ 80,00 [SUPOSIÇÃO, D-QA-14] |

### FIN-EP-06 — Correção e histórico

**FIN-US-06.1 — Detalhe**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-06.1.1 | um lançamento no Extrato ou na Início | o dono o toca | abre a TELA-07 com todos os campos (valor, tipo, categoria ou serviço, veículo nos serviços, forma, data, unidade, Pessoal/Empresa, descrição) |
| CA-06.1.2 | um lançamento criado e alterado | o dono abre o detalhe | vê "Criado por Dono em 03/11 14:32 · Alterado em 03/11 15:10", em horário local |
| CA-06.1.3 | um lançamento pendente / enviado / com erro | o dono abre o detalhe | vê a situação de sincronização correspondente |

**FIN-US-06.2 — Editar**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-06.2.1 | o detalhe de uma saída de R$ 25,00 | o dono toca Editar | abre a TELA-03 preenchida com R$ 25,00 completo; ⌫ apaga a partir dos centavos (R$ 2,50) |
| CA-06.2.2 | o formulário de edição | o dono tenta escolher uma data depois de hoje | não consegue (mesma regra de CA-02.2.3) |
| CA-06.2.3 | o formulário de edição | o dono zera o valor ou remove um campo obrigatório | "Salvar alterações" fica desabilitado, como na criação |
| CA-06.2.4 | um campo alterado | o dono toca "Salvar alterações" | o lançamento atualiza no extrato e nos totais, `alterado_por`/`alterado_em` mudam, o detalhe mostra "Alterado" e, depois da sincronização, o servidor tem `versao` + 1 e uma linha de histórico |
| CA-06.2.5 | o formulário de edição com mudanças | o dono sai sem salvar e descarta | o lançamento continua como antes |
| CA-06.2.6 | o detalhe de uma saída, de uma outra entrada ou de um serviço | o dono toca Editar e procura mudar o tipo (saída ↔ entrada, outra entrada ↔ serviço) | não há como: o formulário de edição é o do tipo original (TELA-03, TELA-04 ou TELA-02), sem opção de trocar o tipo; a categoria "Serviços" não aparece na edição de outra entrada, e a edição de serviço não oferece outras categorias. Para trocar, o dono exclui e lança de novo [CONFIRMADO F-13] |
| CA-06.2.7 | um lançamento já gravado no servidor | chega uma alteração que muda o `tipo` ou que troca a categoria entre "Serviços" e outra (app antigo ou chamada direta) | o servidor recusa; no app, o item vira erro de dado na TELA-12 (FIN-US-07.6) [CONFIRMADO F-13; recusa no servidor: SUPOSIÇÃO de proteção técnica] |

**FIN-US-06.3 — Excluir**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-06.3.1 | o detalhe de uma saída de R$ 25,00, Alimentação, hoje | o dono toca Excluir | aparece "Excluir esta saída de R$ 25,00 (Alimentação, hoje)? Ela fica na Lixeira por 90 dias e pode ser recuperada.", com "Cancelar" à esquerda e "Excluir" em vermelho [CONFIRMADO F-09; texto SUPOSIÇÃO, 02-design JOR-h] |
| CA-06.3.2 | a confirmação | o dono toca Cancelar | nada muda |
| CA-06.3.3 | a confirmação | o dono toca Excluir | volta à lista com o aviso "Lançamento excluído · Desfazer" por ~5 s; o lançamento some de extrato, saldo, resumo e últimos 5 e passa a aparecer na Lixeira (TELA-16); tocar Desfazer o devolve como estava [02-design JOR-h e §5.6] |
| CA-06.3.4 | um lançamento excluído e sincronizado | a equipe consulta o servidor | o registro existe com `excluido_em` e `excluido_por` preenchidos e há uma linha `exclusao` no histórico (RNF-15) |

**FIN-US-06.4 — Histórico de alterações** *(MVP pela F-09)*

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-06.4.1 | um lançamento criado, alterado, excluído e restaurado | o dono abre o detalhe (TELA-07) e toca "Ver histórico" | abre a TELA-15, só leitura, com a linha do tempo, mais recente em cima: "Restaurado", "Excluído", "Alterado" e "Criado", cada um com data, hora, quem fez ("por Dono") e o que mudou; o topo mostra o lançamento (ex.: "Alimentação · R$ 35,00 · Hoje"); não há informação de aparelho nem de conflito no MVP [CONFIRMADO F-09; D-QA-16; layout SUPOSIÇÃO, 02-design §4.5] |
| CA-06.4.2 | uma alteração do valor de R$ 25,00 para R$ 35,00 e da forma de Dinheiro para Pix | o dono olha essa linha na TELA-15 | vê só os campos alterados, com o valor antigo riscado e o novo: "Valor: ~~R$ 25,00~~ → R$ 35,00" e "Pagou com: ~~Dinheiro~~ → Pix" (nunca centavos crus nem nomes de campos do banco); a linha "Criado" mostra os dados iniciais ("R$ 25,00 · Dinheiro · Centro") |
| CA-06.4.3 | uma linha de alteração no histórico | o dono procura voltar aos valores daquela versão | não há botão de reverter na TELA-15; para corrigir, o dono volta ao detalhe e usa Editar (FIN-US-06.2), o que gera uma nova linha "Alterado" no histórico [D-QA-15] |
| CA-06.4.4 | o histórico aberto | o dono procura editar ou apagar uma linha | não existe essa opção; o histórico é só leitura (RNF-14) |
| CA-06.4.5 | o aparelho sem internet | o dono abre o histórico de um lançamento | a TELA-15 abre com as linhas já recebidas do servidor e mostra também, no topo, as alterações feitas no aparelho ainda não enviadas, marcadas como "aguardando envio" [SUPOSIÇÃO do QA: o 02-design v7 não trata o histórico sem internet; o histórico oficial é escrito pelo servidor] |
| CA-06.4.6 | um lançamento nunca alterado / um lançamento excluído e depois restaurado | o dono abre o detalhe e toca "Ver histórico" | o link "Ver histórico" aparece **sempre**; o primeiro mostra só a linha "Criado" (não existe estado vazio); o segundo mostra também "Excluído" e "Restaurado" [D-QA-17, 02-design TELA-07 e §4.5] |

**FIN-US-06.5 — Lixeira** *(MVP pela F-09)*

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-06.5.1 | lançamentos excluídos nos últimos 90 dias | o dono abre Mais → Lixeira (TELA-16) | vê no topo o aviso "Os lançamentos excluídos ficam aqui por 90 dias. Depois disso, saem da Lixeira." e a lista, do excluído mais recente para o mais antigo, com cada item igual ao do extrato (ícone, título, veículo/forma, unidade, valor com sinal), a linha "Excluído em 03/11 · some em 01/02" e o botão Restaurar [CONFIRMADO F-09; layout SUPOSIÇÃO, 02-design §4.6] |
| CA-06.5.2 | um lançamento na Lixeira | o dono toca "Restaurar" | sem pedir confirmação, o item sai da Lixeira e aparece o aviso "Lançamento restaurado · Ver" (Ver abre o detalhe); o lançamento volta como estava na hora da exclusão, com a data e a unidade originais, ao extrato, ao saldo e ao resumo, sem duplicar; `excluido_em` volta a nulo e o histórico ganha "Restaurado por Dono em …" (`restauracao`) [02-design JOR-h e §5.6] |
| CA-06.5.3 | um lançamento excluído há exatamente 90 dias / há 91 dias (contados pela data da exclusão no fuso da unidade) | o dono abre a Lixeira | o de 90 dias aparece / o de 91 dias não aparece e sai sozinho, sem ação do dono; o registro continua no servidor, com exclusão lógica e histórico [CONFIRMADO F-09: 90 dias; contagem inclusiva: SUPOSIÇÃO] |
| CA-06.5.8 | um item excluído em 03/11 / um item que sai da Lixeira em 3 dias | o dono olha a Lixeira | o primeiro mostra "some em 01/02" (data da exclusão + 90 dias); o segundo mostra "some em 3 dias" em âmbar, porque faltam menos de 7 dias [SUPOSIÇÃO, 02-design TELA-16] |
| CA-06.5.9 | um lançamento removido pelo "Desfazer" logo após salvar e outro removido por Excluir (com confirmação) | o dono abre a Lixeira | só o removido por Excluir aparece; o desfeito não aparece, mas continua no servidor com exclusão lógica e histórico [SUPOSIÇÃO, D-QA-18] |
| CA-06.5.4 | o aparelho sem internet | o dono abre a Lixeira e restaura um lançamento | a Lixeira funciona com os dados do aparelho, a restauração vale na hora no extrato e nos totais e fica pendente de envio (relógio), sendo enviada quando houver internet |
| CA-06.5.5 | a Lixeira | o dono procura "apagar definitivamente" | não existe; apagar de verdade só por procedimento administrativo (RNF-26) |
| CA-06.5.6 | um lançamento excluído cuja categoria, tipo de serviço ou veículo foi desativado depois | o dono o restaura | ele volta com os mesmos dados, como os lançamentos antigos de cadastros desativados (CB-g.1) [SUPOSIÇÃO, 02-design JOR-h] |
| CA-06.5.7 | nenhum lançamento excluído nos últimos 90 dias | o dono abre a Lixeira | vê o ícone de lixeira e "A Lixeira está vazia. O que você excluir fica aqui por 90 dias." [02-design §5.5] |

### FIN-EP-07 — Funcionamento offline e sincronização

**FIN-US-07.1 — PowerSync e banco local**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-07.1.1 | o app em modo avião após o primeiro acesso | o dono lança, edita, exclui, vê extrato e resumo e mexe nos cadastros | tudo funciona usando o banco local (RNF-03) |
| CA-07.1.2 | o usuário A ligado só à unidade U1 | a sincronização baixa os dados | o banco local de A contém só os lançamentos de U1 e os cadastros da própria organização |
| CA-07.1.3 | um envio do aparelho | ele chega ao Supabase | é feito com o token do usuário, e a RLS é aplicada (um envio para unidade sem vínculo é recusado) |
| CA-07.1.4 | lançamentos salvos no aparelho | o app é fechado à força e o aparelho reiniciado | os lançamentos continuam lá |

**FIN-US-07.2 — IDs no aparelho e envio sem duplicar**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-07.2.1 | um lançamento salvo offline | a equipe consulta o banco local | ele já tem um `id` UUID v7 gerado no aparelho |
| CA-07.2.2 | uma instalação nova | ocorre a primeira sincronização | o servidor passa a ter um registro em `dispositivo` com o id da instalação, e os lançamentos carregam esse `dispositivo_id` |
| CA-07.2.3 | uma operação de criação já gravada no servidor | a mesma operação é enviada de novo | o servidor fica com um só registro e não devolve erro (inserir ou ignorar) |

**FIN-US-07.3 — Sincronização automática**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-07.3.1 | dois aparelhos do dono abertos e com internet | um lançamento é salvo no aparelho A | ele aparece no aparelho B em até 1 min, sem nenhum toque (RNF-05) |
| CA-07.3.2 | lançamentos pendentes | o app é aberto, a internet volta, ou passam ~5 min com o app aberto | o envio começa sozinho [SUPOSIÇÃO de intervalo] |
| CA-07.3.3 | uma rede lenta (ex.: 2G simulado) | o dono toca Salvar | a confirmação aparece em até 300 ms; o envio acontece depois |
| CA-07.3.4 | uma alteração local pendente de um lançamento | chega do servidor uma versão diferente do mesmo lançamento antes do envio | a alteração local não é sobrescrita na tela até ser enviada |

**FIN-US-07.4 — Indicador de estado**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-07.4.1 | fila vazia e último recebimento ok | o dono olha o topo da Início | vê a nuvem com ✓ e "Atualizado às HH:MM" |
| CA-07.4.2 | 3 itens na fila e internet | o dono olha o topo | vê "N para enviar" / "Enviando…" |
| CA-07.4.3 | 3 itens na fila e sem internet | o dono olha a Início | vê o estado sem internet e a faixa "Seus lançamentos estão salvos no celular" |
| CA-07.4.4 | um envio recusado definitivamente | o dono olha o topo | vê o alerta em amarelo; ao tocar, abre a TELA-12 |

**FIN-US-07.5 — Tela de Sincronização e botão**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-07.5.1 | a TELA-12 | o dono a abre | vê a hora da última sincronização, a quantidade de pendentes e os erros em linguagem simples |
| CA-07.5.2 | pendências e internet | o dono toca "Sincronizar agora" | o envio e o recebimento acontecem na hora e aparece mensagem de sucesso |
| CA-07.5.3 | nada pendente | o dono toca "Sincronizar agora" | aparece mensagem de que não há nada pendente (após verificar o recebimento) |
| CA-07.5.4 | sem internet ou com erro | o dono toca "Sincronizar agora" | aparece mensagem dizendo que os dados estão seguros no celular, com "Tentar de novo"; nada é perdido |

**FIN-US-07.6 — Falhas de envio sem perda**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-07.6.1 | o servidor fora do ar | um envio falha | o item fica na fila e há novas tentativas com espera crescente (5 s, 15 s, 1 min, 5 min… até 30 min) [SUPOSIÇÃO de intervalos] |
| CA-07.6.2 | o token vencido e internet | o app vai enviar | renova o token sozinho; se não conseguir, pede login **sem apagar** a fila, e após o login envia tudo |
| CA-07.6.3 | um vínculo com a unidade removido no servidor | o app envia um lançamento dessa unidade | o item é marcado como erro, continua no aparelho e nunca é descartado sozinho |
| CA-07.6.4 | um item recusado por dado inválido | o dono abre o erro na TELA-12 | pode corrigir e reenviar, ou descartar; descartar pede confirmação |
| CA-07.6.5 | 1 item com erro definitivo e 4 itens válidos na fila | a sincronização roda | os 4 válidos são enviados; só ficam presos os que dependem do item com erro |

**FIN-US-07.7 — Conflito entre aparelhos · v1.1 (fora do MVP)**

> [CONFIRMADO F-15] O dono vai usar **um** celular; conforme o roadmap (R-RM-09), esta história saiu do MVP e vai para a **v1.1**. Os critérios ficam guardados aqui para a v1.1 e **não entram na contagem do MVP**. No MVP continuam a `versao` e o histórico no servidor (FIN-US-01.5), que protegem uma troca futura de aparelho (ver CB-e.1 e CB-e.3).

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-07.7.1 | o mesmo lançamento editado offline em A (valor R$ 30,00) e em B (valor R$ 35,00), com B enviando por último | os dois sincronizam | o servidor e os dois aparelhos ficam com R$ 35,00 (registro inteiro de B), e o histórico tem as duas alterações, a segunda com `conflito = true` [SUPOSIÇÃO — D-BL-08] |
| CA-07.7.2 | um lançamento com alteração em conflito | o dono abre o detalhe | vê "Este lançamento foi alterado em outro aparelho." |
| CA-07.7.3 | A exclui e B edita o mesmo lançamento offline, em qualquer ordem de envio | os dois sincronizam | o lançamento fica excluído em todos os aparelhos e a edição fica no histórico com `conflito = true` [SUPOSIÇÃO — D-BL-08] |
| CA-07.7.4 | uma alteração gravada no servidor com `conflito = true` | o dono abre o histórico (TELA-15) | a linha mostra o aparelho e um aviso de que foi feita sobre uma versão antiga, em outro aparelho [movido da FIN-US-06.4 para a v1.1 pela D-QA-16] |

**FIN-US-07.8 — Aviso de pendências antigas**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-07.8.1 | um item pendente há mais de 24 h | o dono abre a Início | vê um aviso de que há lançamentos guardados só no celular [SUPOSIÇÃO de prazo] |
| CA-07.8.2 | o pendente mais antigo tem 23 h | o dono abre a Início | o aviso não aparece |
| CA-07.8.3 | o aviso visível | os itens são enviados | o aviso some |

**FIN-US-07.9 — Roteiro de resiliência**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-07.9.1 | o repositório | a equipe procura o roteiro | existe um roteiro escrito com: modo avião → lançar 5 itens → fechar à força → reiniciar o aparelho → reconectar → conferir no servidor |
| CA-07.9.2 | uma versão candidata a publicação | o roteiro é executado | o resultado (aparelho, versão, data, aprovado/reprovado) fica registrado; qualquer perda reprova a versão |

### FIN-EP-08 — Ajustes e preferências

**FIN-US-08.1 — Tela Mais/Ajustes**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-08.1.1 | a barra inferior | o dono toca "Mais" | vê Categorias, Tipos de serviço, Tipos de veículo, Padrão Pessoal/Empresa, Lixeira, Sincronização, Sobre e Sair; **não** vê Unidades nem Formas de pagamento [CONFIRMADO F-08, F-09; 02-design TELA-09] |
| CA-08.1.2 | a TELA-09 | o dono toca cada item | abre a TELA-10, 11, 14, a escolha do padrão, a TELA-16 (Lixeira), a TELA-12, a tela Sobre e o fluxo de saída (FIN-US-09.1) |

**FIN-US-08.2 — Padrão Pessoal/Empresa**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-08.2.1 | um usuário novo | o dono abre Ajustes | o padrão é "Empresa" [CONFIRMADO DU-02] |
| CA-08.2.2 | o padrão trocado para "Pessoal" | o dono abre qualquer formulário | o dropdown vem "Pessoal"; os lançamentos antigos não mudam |
| CA-08.2.3 | o padrão trocado no aparelho A | a sincronização termina | o aparelho B passa a abrir os formulários com o mesmo padrão |
| CA-08.2.4 | o aparelho sem internet | o dono troca o padrão | vale na hora neste aparelho e é enviado quando houver internet |

**FIN-US-08.3 — Unidade atual**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-08.3.1 | a Início | o dono toca o nome da unidade no topo | abre a TELA-08 com a lista de unidades, a marca na atual e "Todas as unidades" |
| CA-08.3.2 | a TELA-08 | o dono escolhe "Unidade Bairro" | a folha fecha, o topo muda de nome e cor, o saldo e a lista passam a ser da Bairro e os novos lançamentos vêm com ela |
| CA-08.3.3 | a unidade "Bairro" escolhida | o dono fecha e abre o app | continua na "Bairro" [SUPOSIÇÃO] |

**FIN-US-08.4 — Período compartilhado**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-08.4.1 | o período "Semana" no Extrato | o dono abre o Resumo | o Resumo está em "Semana" [CONFIRMADO E2-10] |
| CA-08.4.2 | o período mudado para "27/10 a 02/11" no Resumo | o dono volta ao Extrato | o Extrato está em "27/10 a 02/11" |
| CA-08.4.3 | o app recém-aberto | o dono abre o Extrato ou o Resumo | o período é "Hoje" [SUPOSIÇÃO: o 02-design diz Hoje no Extrato e Mês no Resumo — D-BL-02 decide] |

### FIN-EP-09 — Segurança, privacidade e operação

**FIN-US-09.1 — Sair da conta**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-09.1.1 | nenhum item pendente | o dono toca Sair e confirma | os dados locais são apagados e o app volta à TELA-13 |
| CA-09.1.2 | 3 itens pendentes | o dono toca Sair | vê um aviso explícito com a quantidade ("3 lançamentos ainda não foram enviados e serão perdidos"), com a opção de sincronizar antes; cancelar mantém tudo |
| CA-09.1.3 | a saída concluída | outro usuário entra no mesmo aparelho | não vê nenhum dado do usuário anterior |

**FIN-US-09.2 — Cópias de segurança**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-09.2.1 | o ambiente de produção | a equipe consulta as cópias | existe cópia diária com pelo menos 7 dias de retenção [SUPOSIÇÃO — custo do plano depende da D-BL-07 parte 2, ainda aberta] |
| CA-09.2.2 | o ambiente de produção | a equipe consulta o local externo | existe cópia semanal fora do Supabase com 3 meses de retenção [SUPOSIÇÃO] |
| CA-09.2.3 | uma cópia recente | a equipe a restaura num banco de teste antes de ir para produção | a quantidade de lançamentos e a soma de `valor_centavos` por unidade batem com a origem, e o resultado é registrado |

**FIN-US-09.3 — Privacidade (LGPD)**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-09.3.1 | o app instalado | o dono abre Mais › Sobre | encontra a política de privacidade (sem página de loja, F-04) |
| CA-09.3.2 | o campo descrição aberto em qualquer formulário | o dono olha o campo | vê uma orientação curta para não colocar dados sensíveis (CPF, telefone, placa) |

**FIN-US-09.4 — Revisão de segurança**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-09.4.1 | o pacote do app gerado | a equipe procura chaves no pacote | não há chave `service_role` (só a chave pública) |
| CA-09.4.2 | o tráfego do app | a equipe o inspeciona | todas as chamadas são HTTPS |
| CA-09.4.3 | a versão candidata | a revisão é feita | há um checklist assinado com: chaves, HTTPS, senha mínima de 8, teste de RLS (CA-01.4.10) passando |

**FIN-US-09.5 — Desempenho medido**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-09.5.1 | um Android de entrada com 10.000 lançamentos no banco local | a equipe mede (mediana de 10 repetições [SUPOSIÇÃO]) | salvar ≤ 300 ms; abrir formulário ≤ 1 s; extrato e resumo do mês ≤ 1 s; partida a frio ≤ 3 s |
| CA-09.5.2 | as medições | a equipe as registra | ficam anotados aparelho, versão e tempos; um tempo acima do limite reprova a versão [SUPOSIÇÃO] |

**FIN-US-09.6 — Geração e distribuição do APK**

| ID | Dado | Quando | Então |
|---|---|---|---|
| CA-09.6.1 | o APK de produção gerado pelo EAS Build | é instalado diretamente (instalação de fonte externa) num Android 8 e num Android recente | o app instala, abre e o fluxo de lançamento funciona [CONFIRMADO F-04] |
| CA-09.6.2 | a configuração de build e distribuição | a equipe confere as plataformas e os canais | só existe build Android, distribuído como APK de instalação direta; não há publicação no Google Play nem iPhone/iOS no MVP [CONFIRMADO F-03, F-04] |
| CA-09.6.3 | uma correção publicada pelo EAS Update | o dono reabre o app | a correção está ativa sem reinstalar, e os dados locais e pendentes continuam intactos |
| CA-09.6.4 | o app instalado com lançamentos pendentes | o dono instala um APK de versão nova por cima do antigo (mesma assinatura) | a instalação substitui o app sem desinstalar; dados locais, sessão e pendências continuam intactos e são enviados depois |
| CA-09.6.5 | um APK assinado com outra chave, ou de versão mais antiga | o dono tenta instalá-lo por cima | o Android recusa a instalação e o app atual continua funcionando com os dados; a equipe guarda a chave de assinatura fora do aparelho [SUPOSIÇÃO] |

---

## 3. Casos de borda

### a) Valor

| ID | Dado | Quando | Então | Histórias |
|---|---|---|---|---|
| CB-a.1 | o campo em R$ 0,00 (valor vazio ou zerado por ⌫) | o dono tenta salvar | Salvar está desabilitado; nada é gravado | 02.1, 02.3, 02.4, 02.5, 06.2 |
| CB-a.2 | o campo em R$ 999.999,99 | o dono digita outro dígito | o valor não passa do máximo [SUPOSIÇÃO — D-QA-10] | 02.1, 06.2 |
| CB-a.3 | um valor que chegue ao servidor acima de 99999999 centavos (ex.: app antigo ou chamada direta) | o servidor recebe | recusa e o item vira erro de dado na TELA-12 [SUPOSIÇÃO: restrição também no banco] | 01.3, 07.6 |
| CB-a.4 | R$ 10.000,00 exatos / R$ 10.000,01 | o dono toca Salvar | salva direto / pede "Confere? R$ 10.000,01" [SUPOSIÇÃO: "acima de" = estritamente maior] | 02.1, 06.2 |
| CB-a.5 | o "Confere?" aberto | o dono toca Salvar duas vezes seguidas na confirmação | é gravado um único lançamento | 02.1, 07.2 |
| CB-a.6 | o campo zerado | o dono digita `2` `5` | aparece R$ 0,25 e, se salvo, grava 25 centavos | 02.1 |
| CB-a.7 | o valor R$ 1.240,00 | o dono segura ⌫ | o valor vai a R$ 0,00 e Salvar fica desabilitado | 02.1 |
| CB-a.8 | o campo zerado | o dono digita `0` `0` `0` | o valor continua R$ 0,00 (zeros à esquerda não contam) | 02.1 |
| CB-a.9 | um teclado que permita colar texto | o dono cola "12,5" ou "abc" | o campo ignora caracteres que não são dígitos e nunca grava número com vírgula [SUPOSIÇÃO] | 02.1 |

### b) Somas exatas em centavos

| ID | Dado | Quando | Então | Histórias |
|---|---|---|---|---|
| CB-b.1 | 3 entradas de R$ 0,10 e 1 saída de R$ 0,30 | o dono olha o Sobrou | é exatamente R$ 0,00 (sem "−R$ 0,00" nem R$ 0,01) | 04.1, 05.1 |
| CB-b.2 | 10.000 lançamentos com valores aleatórios entre 1 e 99999999 centavos | o app calcula Entrou, Saiu e Sobrou | o resultado é igual à soma inteira calculada no servidor (`sum(valor_centavos)`), centavo a centavo | 04.1, 05.1, 05.2, 05.3 |
| CB-b.3 | o pior caso de volume (10.000 lançamentos de R$ 999.999,99) | o app soma | não há estouro nem perda de precisão (≈ 10¹² centavos, abaixo do limite inteiro seguro de 2⁵³) | 05.1, 05.2 |
| CB-b.4 | 3 categorias de R$ 1,00 | o Resumo mostra percentuais | cada uma mostra 33%; a soma exibida pode dar 99% e isso é aceito; o total de R$ 3,00 continua exato | 05.3 |
| CB-b.5 | consolidado de "Todas as unidades" e linhas por unidade | o dono confere | a soma das linhas é igual ao consolidado; Empresa + Pessoal = total em "Tudo" | 05.1, 05.2 |
| CB-b.6 | um lançamento editado de R$ 25,00 para R$ 2,50 | os totais são recalculados | o total muda exatamente R$ 22,50 | 06.2, 05.1 |

### c) Datas e fuso

| ID | Dado | Quando | Então | Histórias |
|---|---|---|---|---|
| CB-c.1 | o seletor de data em qualquer formulário (criar ou editar) | o dono tenta tocar amanhã | o dia está apagado e não responde | 02.2, 06.2 |
| CB-c.2 | o relógio do aparelho adiantado, de modo que a data fique no futuro em relação ao fuso da unidade | o dono abre o formulário | o campo mostra "Só dá para lançar o que já aconteceu. Escolha hoje ou um dia anterior." e Salvar fica desabilitado | 02.2, 06.2 |
| CB-c.3 | hoje é 03/11 | o dono lança um gasto com data 15/08 | é salvo com `data_lancamento = 15/08`, aparece no dia 15/08 do Extrato e entra no Mês de agosto, não no de novembro; `criado_em` continua sendo hoje | 02.2, 04.1, 05.1 |
| CB-c.4 | unidade em `America/Sao_Paulo` e aparelho em São Paulo | o dono lança às 23h30 de 03/11 (02h30 de 04/11 em UTC) | `data_lancamento = 03/11`; aparece em "Hoje" até a meia-noite e no dia 03/11 depois | 02.2, 04.1, 05.1 |
| CB-c.5 | o lançamento de CB-c.4 sincronizado | outro aparelho com fuso UTC o recebe | continua em 03/11 (`data_lancamento` não tem hora) | 07.3, 04.1 |
| CB-c.6 | unidade em `America/Sao_Paulo` e aparelho configurado em `America/Manaus` (1 h a menos) | o dono lança às 23h30 hora de Manaus | a data padrão é 04/11, o "hoje" da unidade [SUPOSIÇÃO: regra da 03-arquitetura §5.2 — D-QA-08] | 02.2 |
| CB-c.7 | o app aberto às 23h59 com a Início em "Hoje" | passa a meia-noite no fuso da unidade | ao voltar à Início ou abrir um formulário, "Hoje" e a data padrão passam ao novo dia [SUPOSIÇÃO] | 05.1, 02.2 |

### d) Lançamento duplicado

| ID | Dado | Quando | Então | Histórias |
|---|---|---|---|---|
| CB-d.1 | um formulário válido | o dono toca Salvar duas vezes muito rápido (ou toca enquanto a tela fecha) | é gravado **um** lançamento; o botão fica desabilitado depois do primeiro toque | 02.3, 02.4, 02.5, 06.2 |
| CB-d.2 | uma criação enviada e gravada no servidor, mas a resposta se perdeu (queda de rede) | o app reenvia a mesma operação | o servidor fica com um registro só (mesmo `id`), sem erro, e a fila esvazia | 07.2, 07.6 |
| CB-d.3 | uma alteração já aplicada no servidor | ela é reenviada | `versao` não sobe duas vezes e não é criada uma segunda linha de histórico [SUPOSIÇÃO: envio idempotente também para alteração] | 07.2, 01.5 |
| CB-d.4 | "Mais um igual" usado em sequência | o dono salva 3 carros iguais | existem 3 lançamentos distintos, cada um com `id` próprio (não é duplicado) | 02.9 |

### e) Conflito entre aparelhos

[CONFIRMADO F-15] Com um só celular, a regra de conflito (FIN-US-07.7) foi para a v1.1. **No MVP valem só CB-e.1 e CB-e.3**, que protegem a **troca de aparelho** (o celular antigo ainda com alterações pendentes quando o novo já está em uso) usando a `versao` e o histórico do servidor (FIN-US-01.5, 07.2, 07.3). Os demais valem na **v1.1**. [SUPOSIÇÃO: essa divisão é interpretação do QA.]

| ID | Dado | Quando | Então | Histórias |
|---|---|---|---|---|
| CB-e.1 · **MVP** | o celular antigo com uma edição pendente de um lançamento, e o celular novo já editou e sincronizou o mesmo lançamento (troca de aparelho) | o celular antigo volta a ter internet | nenhuma versão se perde: o servidor aplica as duas na ordem de chegada, `versao` sobe a cada uma e o histórico guarda as duas, a segunda com `conflito = true`; os dois aparelhos terminam iguais ao servidor [qual versão prevalece: SUPOSIÇÃO "última que chega", decisão final na v1.1 — D-BL-08] | 01.5, 07.3 |
| CB-e.2 · v1.1 | A editou só o valor e B editou só a categoria | os dois sincronizam | não há mescla: fica o registro inteiro do último a chegar; o outro campo editado volta ao valor do último envio e fica recuperável no histórico [SUPOSIÇÃO — D-BL-08] | 07.7 |
| CB-e.3 · **MVP** | o celular antigo e o novo com relógios diferentes (um adiantado 2 h) | os dois enviam alterações do mesmo lançamento | a ordem de aplicação segue a chegada ao servidor (`recebido_servidor_em`), nunca a hora do aparelho | 01.5, 07.3 |
| CB-e.4 · v1.1 | A exclui e B edita offline; B envia **depois** de A | os dois sincronizam | o lançamento continua excluído; a edição de B fica no histórico com `conflito = true` [SUPOSIÇÃO] | 07.7, 06.3 |
| CB-e.5 · v1.1 | A exclui e B edita offline; B envia **antes** de A | os dois sincronizam | o lançamento termina excluído; B, ao receber, retira-o da tela e dos totais | 07.7, 06.3 |
| CB-e.6 · v1.1 | o lançamento excluído em CB-e.4 | o dono olha o aparelho B | o item some do extrato; não fica "fantasma" nos totais | 07.7, 04.1 |

### f) Sincronização

| ID | Dado | Quando | Então | Histórias |
|---|---|---|---|---|
| CB-f.1 | 20 itens na fila | a internet cai depois do 8º envio | os 8 enviados saem da fila, os 12 restantes continuam e são enviados quando a rede volta; no servidor ficam exatamente 20 | 07.3, 07.6, 07.2 |
| CB-f.2 | o app fechado à força no meio de um envio | o dono reabre | a fila é retomada sem perder nem duplicar | 07.6, 07.9 |
| CB-f.3 | o aparelho 7 dias sem internet, com 300 lançamentos | a internet volta | todos chegam ao servidor, na ordem; o indicador vai de "300 para enviar" a ✓; o aviso de 24 h aparecia durante o período | 07.3, 07.4, 07.8 |
| CB-f.4 | o aparelho 7 dias sem internet e a sessão vencida no servidor | a internet volta | o app renova a sessão; se precisar de login, a fila é mantida e enviada após entrar (ver CB-k.4) | 07.6, 01.7 |
| CB-f.5 | outro aparelho alterou cadastros durante os 7 dias | o aparelho volta a ficar online | recebe as mudanças e mantém a referência dos seus lançamentos (ex.: categoria renomeada aparece com o nome novo) | 07.3, 03.1 |
| CB-f.6 | pendências | o dono olha a Início e o Extrato | o número do indicador é igual à quantidade de itens com relógio no Extrato (incluindo edições e exclusões pendentes, contadas por operação) [SUPOSIÇÃO] | 07.4 |
| CB-f.7 | um lançamento criado offline e depois editado e excluído, ainda sem envio | a sincronização roda | o servidor termina com o lançamento excluído e o histórico com as 3 ações, na ordem | 07.3, 01.5 |

### g) Cadastros desativados, sistema e nomes repetidos

| ID | Dado | Quando | Então | Histórias |
|---|---|---|---|---|
| CB-g.1 | categoria "Luz" com 10 lançamentos | o dono a desativa | some da grade; os 10 continuam no extrato, no Resumo e no filtro de categoria | 03.1, 04.4, 05.3 |
| CB-g.2 | tipo de serviço "Cera" e tipo de veículo "Van" com lançamentos | o dono os desativa | somem da grade e da fileira; continuam no extrato e no Resumo › Serviços (Por serviço e Por veículo) | 03.3, 03.4, 05.4, 05.5 |
| CB-g.3 | um lançamento antigo de categoria desativada | o dono o edita | o formulário mostra a categoria atual, e salvar sem trocá-la é permitido [SUPOSIÇÃO — D-QA-09] | 06.2 |
| CB-g.4 | "Repetir"/"Mais um igual" de um serviço cujo tipo foi desativado | o dono toca | o formulário abre sem esse tipo marcado [SUPOSIÇÃO] | 02.9, 03.3 |
| CB-g.5 | qualquer uma das 4 categorias de sistema | o dono tenta desativar pela TELA-10, ou alguém tenta pelo servidor | a chave não muda / o servidor recusa [CONFIRMADO F-06] | 03.2 |
| CB-g.6 | a categoria de sistema "Serviços" renomeada para "Lavagens" | o dono lança um serviço | o lançamento continua indo para a mesma categoria (pelo id/marca de sistema) [CONFIRMADO F-06: renomear é permitido] | 03.2, 02.5 |
| CB-g.7 | o nome "Água" ativo | o dono tenta criar "água", " Água ", "Agua" ou "AGUA" | recusa nos quatro casos, no app e no servidor (a restrição de nome único usa a mesma comparação) [CONFIRMADO D-QA-04: maiúsculas, acentos e espaços nas pontas não diferenciam nomes; regra no servidor: SUPOSIÇÃO] | 03.1, 03.3, 03.4, 02.6, 02.7 |
| CB-g.8 | dois aparelhos offline criam o mesmo nome "Polimento" | os dois sincronizam | o segundo envio é recusado pela restrição de nome único e vira erro de dado na TELA-12, com opção de corrigir [SUPOSIÇÃO: a regra de resolução não está definida — D-QA-12] | 03.3, 07.6 |

### h) "Todas as unidades" ao lançar

| ID | Dado | Quando | Então | Histórias |
|---|---|---|---|---|
| CB-h.1 | "Todas as unidades" no topo | o dono toca "+ Carro", "+ Entrou" ou "− Saiu" | o formulário abre com o campo Unidade no topo, destacado e vazio; Salvar desabilitado até escolher [SUPOSIÇÃO SUP-D05] | 02.2, 08.3 |
| CB-h.2 | o formulário de CB-h.1 com a unidade "Centro" escolhida | o dono salva | o lançamento vai para "Centro"; o topo continua em "Todas as unidades" [SUPOSIÇÃO] | 02.2, 08.3 |
| CB-h.3 | "Todas as unidades" no topo | o dono olha a Início | "Repetir" aparece ou não conforme D-QA-06 [regra não definida] | 02.9 |

### i) Pessoal/Empresa

| ID | Dado | Quando | Então | Histórias |
|---|---|---|---|---|
| CB-i.1 | Empresa: entradas R$ 500,00 e saídas R$ 200,00; Pessoal: saída R$ 50,00 | o dono filtra Empresa / Pessoal / Tudo | Sobrou = R$ 300,00 / −R$ 50,00 / R$ 250,00, com as linhas Empresa e Pessoal em "Tudo" | 04.3, 05.1, 05.3 |
| CB-i.2 | o padrão "Empresa" | o dono troca o dropdown para "Pessoal" num lançamento | só esse lançamento é Pessoal; o padrão continua "Empresa" no próximo | 02.2, 08.2 |
| CB-i.3 | o padrão trocado para "Pessoal" no aparelho A, com B offline | B lança antes de sincronizar | o lançamento de B sai com o padrão antigo; depois de sincronizar, B passa a usar "Pessoal" (comportamento esperado, sem retroagir) | 08.2 |
| CB-i.4 | um lançamento Pessoal | aparece no Extrato com filtro "Empresa" | não aparece; com "Tudo", aparece com o rótulo "Pessoal" | 04.1, 04.3 |
| CB-i.5 | um lançamento Pessoal com o campo Unidade vazio (ex.: "Todas as unidades" no topo) | o dono tenta salvar | não consegue: Salvar fica desabilitado até escolher a unidade, como em qualquer lançamento; o lançamento Pessoal salvo fica na unidade escolhida e entra nos totais dela com o filtro Pessoal ou Tudo [CONFIRMADO F-05] | 02.2, 01.3 |

### j) Período

| ID | Dado | Quando | Então | Histórias |
|---|---|---|---|---|
| CB-j.1 | hoje é segunda, 03/11 | o dono toca "Semana" | o período é só 03/11 | 04.2 |
| CB-j.2 | hoje é domingo, 09/11 | o dono toca "Semana" | o período é de 03/11 (segunda) a 09/11 [CONFIRMADO E2-09] | 04.2 |
| CB-j.3 | hoje é quarta, 01/10, e a semana começou em 29/09 | o dono toca "Semana" | o período é de 29/09 a 01/10, atravessando o mês | 04.2 |
| CB-j.4 | o período "Mês" escolhido em 31/10 | o app fica aberto até 01/11 e o dono volta ao Extrato | "Mês" passa a ser 01/11 a 01/11 (atalho relativo, não datas fixas) [SUPOSIÇÃO] | 04.2, 08.4 |
| CB-j.5 | o intervalo de 27/10 a 02/11 escolhido no Extrato | o dono abre o Resumo e toca uma barra | o Resumo usa o mesmo intervalo e o Extrato aberto pela barra também | 08.4, 05.6 |
| CB-j.6 | o calendário no mês atual | o dono toca › | não avança para meses só com dias futuros [SUPOSIÇÃO] | 04.2 |
| CB-j.7 | um intervalo com os dias 27/10 e 02/11 | o Extrato filtra | os dois dias das pontas entram no resultado (intervalo inclusivo) | 04.2 |
| CB-j.8 | o período compartilhado | o app é fechado e reaberto | o período inicial segue a D-BL-02 (hoje, [SUPOSIÇÃO] "Hoje") | 08.4 |

### k) Segurança

| ID | Dado | Quando | Então | Histórias |
|---|---|---|---|---|
| CB-k.1 | o usuário A sem vínculo com a unidade U2 | A tenta ler ou gravar em U2 (pelo app ou chamando a API direto com seu token) | o servidor não devolve nada / recusa | 01.4, 07.1 |
| CB-k.2 | um usuário de outra organização | ele tenta ler cadastros ou lançamentos da organização do dono | não recebe nenhuma linha | 01.4 |
| CB-k.3 | o vínculo de A com U1 desativado enquanto A tem lançamentos de U1 pendentes | A sincroniza | os pendentes viram erro de permissão, ficam no aparelho e não são descartados sozinhos | 07.6, 01.4 |
| CB-k.4 | a sessão expirada e o aparelho sem internet | o dono abre o app | o app abre normalmente, permite lançar e consultar; não pede login nem apaga nada até haver internet | 01.7, 07.6 |
| CB-k.5 | a sessão de CB-k.4 e a internet de volta, com renovação impossível | o app pede login | após o login do **mesmo** usuário, a fila é enviada; com outro usuário, ver D-QA-07 [regra não definida] | 07.6, 09.1 |
| CB-k.6 | um token adulterado ou de usuário removido | o app chama o servidor | o servidor recusa; o app trata como sessão inválida, sem apagar a fila | 01.4, 07.6 |
| CB-k.7 | o pacote do app | a equipe procura segredos | não há `service_role` nem outra chave secreta | 09.4 |

---

## 4. Riscos de qualidade

Escala: Probabilidade e Impacto em Baixa / Média / Alta.

| # | Risco | Prob. | Impacto | Histórias | Como mitigar com teste |
|---|---|---|---|---|---|
| R-01 | Lançamento perdido por fechar o app, reiniciar ou cair a rede | Média | Alta | 07.1, 07.3, 07.6, 07.9 | E2E com modo avião + fechar à força + reinício (roteiro 07.9) a cada versão; teste de integração da fila com falha injetada no meio do lote (CB-f.1, CB-f.2) |
| R-02 | Lançamento duplicado (toque duplo ou reenvio) | Média | Alta | 02.3–02.5, 07.2 | Teste de unidade do botão com trava; integração reenviando a mesma operação 3 vezes e conferindo 1 registro (CB-d.1 a CB-d.3) |
| R-03 | Erro de centavos em somas ou na digitação | Baixa | Alta | 02.1, 04.1, 05.1–05.3 | Testes de propriedade (valores aleatórios) comparando com soma inteira; proibir `parseFloat`/divisão em valor monetário por regra de lint [SUPOSIÇÃO]; tabela de digitação da 02-design §5.4 como teste |
| R-04 | Lançamento no dia errado por causa de fuso (23h30, UTC) | Média | Média | 02.2, 04.1, 04.2, 05.1 | Testes de unidade com relógio simulado em 23h30/00h30 e fusos diferentes no aparelho (CB-c.4 a CB-c.7) |
| R-05 | Vazamento entre unidades/organizações por falha de RLS | Baixa | Alta | 01.4, 07.1 | Testes automáticos de RLS com dois usuários e duas organizações em toda migração (CA-01.4.x, CB-k.1, CB-k.2); revisão 09.4 |
| R-06 | Conflito entre aparelhos sobrescreve dados sem o dono perceber | Baixa (um só celular, F-15) | Média | 01.5 (MVP); 07.7 (v1.1) | MVP: integração simulando a troca de aparelho com pendência no celular antigo (CB-e.1, CB-e.3). v1.1: dois clientes editando offline, histórico com `conflito` e aviso na TELA-07 (CB-e.2, e.4 a e.6) |
| R-07 | Somas do extrato e do resumo divergem do servidor | Média | Alta | 04.1, 05.1–05.5, 07.3 | Teste de reconciliação: após sincronizar, total por unidade/dia no aparelho = total no servidor |
| R-08 | Sessão vencida apaga a fila ou bloqueia o uso offline | Média | Alta | 01.7, 07.6, 09.1 | E2E com token expirado em modo avião (CB-k.4, CB-k.5) |
| R-09 | Lentidão em aparelho de entrada com muitos dados | Média | Média | 04.1, 05.3, 09.5 | Medição automatizada com 10.000 lançamentos de teste em Android de entrada (CA-09.5.1) |
| R-10 | Valor salvo errado pela digitação caixa registradora (ex.: R$ 0,25 achando que era R$ 25,00) | Média | Média | 02.1, 02.8 | Teste manual com o dono no pátio; o aviso pós-salvar mostra o valor e oferece Desfazer; teste de usabilidade com 10 lançamentos reais |
| R-11 | Veículo pré-selecionado errado salvo sem perceber | Alta | Baixa | 02.5, 02.9 | Teste manual do destaque visual sob sol; aviso pós-salvar mostra o veículo (CA-02.8.2) |
| R-12 | Lançamento na unidade errada | Média | Média | 02.2, 08.3 | E2E de CB-h.1 e CB-h.2; teste manual do contraste da cor do topo |
| R-13 | Desativar cadastro some com dados antigos dos relatórios | Baixa | Média | 03.1, 03.3, 03.4, 05.x | Integração: desativar e conferir extrato/resumo antes e depois (CB-g.1, CB-g.2) |
| R-14 | Mudança de regra pendente (D-BL-02) exige retrabalho | Média | Média | 08.4 | Isolar a regra em uma função/restrição com teste próprio, para trocar só ela quando o dono responder |
| R-15 | Atualização do app (EAS Update ou APK novo) quebra o banco local ou a fila; perda da chave de assinatura impede atualizar sem reinstalar | Baixa | Alta | 09.6, 07.1 | Teste de atualização pelos dois caminhos com pendências na fila antes de cada versão (CA-09.6.3, CA-09.6.4); teste de APK com outra assinatura (CA-09.6.5) |
| R-17 | Restauração pela lixeira duplica o lançamento ou o devolve na data errada; corte de 90 dias errado por fuso | Baixa | Média | 06.5, 06.4 | Unidade: corte de 90 dias com relógio simulado; integração: restaurar e conferir 1 registro, `restauracao` no histórico e totais do dia original (CA-06.5.2, CA-06.5.3) |
| R-16 | Restauração de backup não funciona quando precisar | Baixa | Alta | 09.2 | Restauração de teste antes de produção e depois a cada 3 meses [SUPOSIÇÃO] (CA-09.2.3) |

---

## 5. Estratégia de testes

### 5.1 Testes automatizados

Ferramentas sugeridas [SUPOSIÇÃO, decisão da equipe]: Jest para unidade no app; pgTAP ou testes SQL contra um Supabase local para banco e RLS; Maestro (ou Detox) para ponta a ponta em emulador.

**Unidade (rodam a cada commit)**

| Alvo | Casos |
|---|---|
| Entrada de valor caixa registradora | CA-02.1.2 a 02.1.6, CB-a.1, a.2, a.6–a.9 |
| Formatação de dinheiro e datas | CA-01.9.1 a 01.9.3 |
| Somas e saldo em centavos | CB-b.1 a b.6 (teste de propriedade com valores aleatórios) |
| Percentuais do Resumo | CA-05.3.2, CB-b.4 |
| Cálculo de períodos (Hoje, Semana, Mês, Mês passado, intervalo, inversão) | CA-04.2.2 a 04.2.8, CB-j.1 a j.4, j.7 |
| "Hoje" no fuso da unidade e bloqueio de futuro | CB-c.1 a c.7 (relógio e fuso simulados) |
| Validações do formulário (Salvar habilitado/desabilitado) | CA-02.2.5, 02.3.2, 02.4.3, 06.2.3, CB-h.1 |
| Regras de nome repetido e reativação | CA-02.6.2, 02.6.3, 02.7.2, 02.7.3, 03.1.3, CB-g.7 |
| Corte de 90 dias da Lixeira e montagem do histórico em linguagem simples | CA-06.5.3, CA-06.4.2 |
| Regra "Repetir" / "Mais um igual" | CA-02.9.1 a 02.9.4, CB-g.4 |
| Filtros do Extrato e totais | CA-04.3.x, 04.4.x, 04.5.x, 04.7.x, CB-i.1, CB-i.4 |
| Regra serviço × veículo no formulário | CA-02.12.1 a 02.12.4, 02.12.7 |

**Integração (rodam a cada mudança de migração ou de sincronização)**

| Alvo | Casos |
|---|---|
| Esquema e restrições do banco | CA-01.3.1 a 01.3.8, CA-02.12.8 a 02.12.10, CB-a.3 |
| RLS com 2 usuários, 2 unidades, 2 organizações | CA-01.4.1 a 01.4.10, CB-k.1, k.2, k.6 |
| Gatilhos de histórico e versão | CA-01.5.1 a 01.5.5, CB-d.3, CA-06.5.2, CA-06.4.3, CA-06.5.9 |
| Idempotência do envio | CA-07.2.3, CB-d.2, CB-d.3 |
| Fila com falha no meio, retomada e erros | CA-07.6.1 a 07.6.5, CB-f.1, f.2, f.7, CB-k.3 |
| Troca de aparelho com pendência no celular antigo (MVP) | CB-e.1, CB-e.3 |
| Conflito com dois clientes (v1.1) | CA-07.7.1 a 07.7.3, CB-e.2, e.4 a e.6 |
| Regras de sincronização por unidade | CA-07.1.2, 07.1.3 |
| Reconciliação de totais aparelho × servidor | CB-b.2, R-07 |
| Dados iniciais idempotentes | CA-01.6.1 a 01.6.4 |

**Ponta a ponta (rodam antes de cada versão, em emulador Android)**

| Fluxo | Casos |
|---|---|
| Login, primeiro uso e uso offline | CA-01.7.1, 01.7.4, 01.8.1 a 01.8.3 |
| Lançar saída, outra entrada e serviço | CA-02.3.3, 02.4.2, 02.5.4, 02.8.1 a 02.8.3 |
| Três carros com "Mais um igual" | CA-02.9.1, CB-d.4 |
| Serviço sem tipo de serviço, do lançamento ao Resumo e de volta ao Extrato | CA-02.12.1, 02.12.5, 02.12.11, CA-05.4.4, CA-05.6.4, CA-04.7.7 |
| "Todas as unidades" ao lançar | CB-h.1, CB-h.2 |
| Extrato com período, filtros e ida do Resumo para o Extrato | CA-04.2.3, 04.2.4, 05.6.1, 08.4.1, 08.4.2 |
| Editar e excluir | CA-06.2.4, 06.3.3 |
| Excluir → Lixeira → Restaurar (online e offline) e ver o histórico | CA-06.5.2, 06.5.4, 06.4.1 |
| Offline → fechar à força → reabrir → online | CA-07.1.4, CB-f.2 |
| Sessão expirada offline | CB-k.4 |
| Sair da conta com pendências | CA-09.1.2, 09.1.3 |

### 5.2 O que pode ser só manual

- Aparência e leitura sob sol, uso com uma mão, tamanho das áreas de toque na prática (RNF-01).
- Leitor de tela (TalkBack) e fonte grande (CA-01.9.4, CA-01.9.5).
- Destaque do veículo pré-selecionado e cor do topo por unidade (R-11, R-12).
- Desempenho medido em aparelho real (CA-09.5.1) — pode ser semiautomático.
- Roteiro de resiliência com reinício real do aparelho (CA-07.9.x).
- Troca de aparelho real com pendência no celular antigo (MVP); dois aparelhos em conflito fica para a v1.1.
- Backup e restauração (CA-09.2.x), revisão de segurança (CA-09.4.x), política de privacidade (CA-09.3.1), instalação do APK e atualização por APK novo e pelo próprio app (CA-09.6.x), sem loja.
- Teste de usabilidade com o dono: 10 lançamentos reais medindo ≤ 15 s e ≤ 4 toques (OBJ-01).

### 5.3 Checklist de teste manual no celular

**Aparelhos** — só Android [CONFIRMADO F-03]; iPhone fora do MVP

**Instalação e atualização (APK, sem loja) [CONFIRMADO F-04]**

- [ ] Instalar o APK direto no celular (permitindo instalação de fonte externa) em Android 8 e recente
- [ ] Instalar um APK de versão nova por cima, com pendências → dados e pendências continuam
- [ ] Receber correção pelo próprio app (EAS Update) com pendências → dados e pendências continuam
- [ ] APK com outra assinatura é recusado pelo Android e o app atual segue funcionando

**Aparelhos para os testes**

- [ ] Android de entrada (2 GB RAM, Android 8 ou o mais antigo disponível)
- [ ] Android intermediário recente
- [ ] Tela pequena (≈ 360 × 640 dp ou 5")
- [ ] Fonte do sistema no maior tamanho em pelo menos um Android

**Com internet**

- [ ] Login com e-mail e senha corretos e errados
- [ ] Primeiro uso: boas-vindas, escolha da unidade, download
- [ ] Botões + Carro, + Entrou e − Saiu na zona do polegar, sem rolagem
- [ ] Teclado abre sozinho; `2` `5` = R$ 0,25; `6` `0` `0` `0` = R$ 60,00; ⌫ e segurar ⌫
- [ ] Valor zero bloqueado; "Confere?" acima de R$ 10.000,00
- [ ] Saída em ≤ 4 toques; serviço com veículo pré-selecionado; outra entrada
- [ ] Serviço sem tipo de serviço salva e aparece como "Serviço · SUV · Pix"; sem veículo, Salvar bloqueado com "Escolha o veículo"
- [ ] Aviso pós-salvar, Desfazer e "Mais um igual" (3 carros seguidos)
- [ ] "+ Novo serviço" e "+ Novo veículo", nome repetido e reativação
- [ ] Toque duplo rápido no Salvar → 1 lançamento
- [ ] Fechar formulário preenchido → "Descartar este lançamento?" (✕ e botão voltar do Android)
- [ ] "Todas as unidades" → formulário exige unidade
- [ ] Troca de unidade: nome e cor do topo mudam; continua após reabrir
- [ ] Cartão Hoje/Mês, Empresa/Pessoal/Tudo, Sobrou negativo em vermelho
- [ ] Extrato: agrupamento por dia, filtros, "Limpar filtros", mensagem sem resultado
- [ ] Filtro por tipo de serviço sozinho, com a opção "Sem tipo de serviço" e junto com o filtro por veículo; linhas "Por serviço" do Resumo (inclusive "Sem tipo de serviço") abrem o Extrato filtrado com o mesmo total
- [ ] Período: atalhos, um dia, intervalo invertido, 3º toque recomeça, futuro apagado
- [ ] Período igual no Extrato e no Resumo; barra do Resumo abre Extrato filtrado
- [ ] Resumo › Gastos e › Serviços (Por serviço e Por veículo)
- [ ] Detalhe, editar (data futura bloqueada), excluir com confirmação
- [ ] Excluir avisa dos 90 dias; excluído aparece na Lixeira com "some em …" (âmbar nos últimos 7 dias); Restaurar sem confirmação devolve ao dia e à unidade originais com "Lançamento restaurado · Ver"; "Ver histórico" sempre visível, só leitura, com valor antigo riscado; Desfazer logo após salvar não vai para a Lixeira
- [ ] Categorias: criar, renomear, desativar, reordenar; 4 de sistema travadas
- [ ] Tipos de serviço e de veículo: criar, renomear, desativar, reordenar
- [ ] Padrão Pessoal/Empresa trocado em um aparelho chega ao outro
- [ ] Lançamento em A aparece em B em até 1 min
- [ ] Lançamento às 23h30 cai no dia certo (ajustar o relógio do aparelho para teste)
- [ ] Leitor de tela lê os botões principais

**Sem internet (modo avião)**

- [ ] App abre sem pedir login
- [ ] Lançar, editar, excluir, ver extrato, resumo e cadastros
- [ ] Indicador "sem internet" e faixa "Seus lançamentos estão salvos no celular"
- [ ] Relógio nos itens pendentes; contagem bate com o indicador
- [ ] "Sincronizar agora" mostra que os dados estão seguros no celular
- [ ] Fechar o app à força e reiniciar o aparelho → pendentes continuam
- [ ] Lixeira e histórico abrem sem internet; restaurar offline fica pendente e é enviado depois
- [ ] Reconectar → tudo chega ao servidor, sem duplicar; indicador volta a ✓
- [ ] Pendência com mais de 24 h mostra aviso (ajustar data do aparelho ou usar build de teste)
- [ ] Troca de aparelho: celular antigo com alteração pendente sincroniza depois do novo → nada se perde (CB-e.1)
- [ ] *(v1.1)* Mesmo lançamento editado em dois aparelhos offline → aviso de conflito no detalhe
- [ ] *(v1.1)* Um aparelho exclui e o outro edita offline → fica excluído
- [ ] Sair da conta com pendências → aviso explícito com a quantidade

**Rede ruim**

- [ ] Rede lenta: Salvar continua instantâneo
- [ ] Ligar e desligar a rede durante uma sincronização de 20 itens → 20 no servidor

---

## 6. Suposições e dúvidas

### 6.1 Suposições deste documento

| # | Suposição |
|---|---|
| S-QA-01 | ~~Comparação de nomes ignora maiúsculas e espaços, mas acentos contam.~~ **Substituída pela resposta à D-QA-04 [CONFIRMADO]:** a comparação ignora maiúsculas/minúsculas, acentos e espaços nas pontas ("Agua" = "Água" = "água"). |
| S-QA-02 | [SUPOSIÇÃO] "Acima de R$ 10.000,00" significa estritamente maior; R$ 10.000,00 salva sem perguntar. |
| S-QA-03 | [SUPOSIÇÃO] Ao passar de R$ 999.999,99, o dígito extra é ignorado em silêncio. |
| S-QA-04 | [SUPOSIÇÃO] Atalhos de período (Hoje, Semana, Mês) são relativos: se o dia vira com o app aberto, passam a valer para o novo dia. |
| S-QA-05 | [SUPOSIÇÃO] Intervalos de período são inclusivos nas duas pontas. |
| S-QA-06 | [SUPOSIÇÃO] O indicador de pendências conta operações (criação, edição, exclusão), e cada lançamento com operação pendente tem o relógio no Extrato. |
| S-QA-07 | [SUPOSIÇÃO] Envio de alteração também é idempotente (não cria versão nem histórico em dobro). |
| S-QA-08 | [SUPOSIÇÃO] O valor máximo também é garantido por restrição no banco, não só no app. |
| S-QA-09 | [SUPOSIÇÃO] Formulário com só os valores pré-preenchidos fecha sem perguntar "Descartar?". |
| S-QA-10 | [SUPOSIÇÃO] Tempos de desempenho medidos pela mediana de 10 repetições; tempo acima do limite reprova a versão. |
| S-QA-11 | Mantidas todas as suposições do 03-arquitetura e do 04-backlog (limites de valor, 30 dias offline, ~5 min, 24 h, espera crescente, conflito, excluir vence editar, período inicial "Hoje", aba Hoje no cartão). |

### 6.2 Dúvidas que mudam critérios (já abertas no 04-backlog)

| # | Critérios afetados |
|---|---|
| ~~D-BL-01 (serviço × veículo)~~ | **Respondida pelo dono: opção a), veículo obrigatório e tipo de serviço opcional.** Aplicada em CA-02.12.x, CA-02.5.4, CA-04.7.1, CA-04.7.7, CA-04.7.8, CA-05.4.4, CA-05.4.5, CA-05.5.2 e CA-05.6.4 |
| D-BL-02 (período padrão) | CA-08.4.3, CA-04.3.4, CB-j.8 |
| ~~D-BL-03 (categorias de sistema)~~ | **Respondida (F-06):** renomear (nome, ícone, cor) sim, desativar não [CONFIRMADO]. CA-03.2.3, CA-03.2.4, CB-g.5, CB-g.6 |
| ~~D-BL-04 (cadastro de unidades e formas)~~ | **Respondida (F-08):** cadastradas pela equipe na implantação, sem telas no MVP [CONFIRMADO]. CA-01.6.1 |
| ~~D-BL-05 (histórico e lixeira)~~ | **Respondida (F-09):** sim, histórico e lixeira no app, com 90 dias na lixeira [CONFIRMADO]. FIN-US-06.4 e 06.5 entraram no MVP: CA-06.4.x, CA-06.5.x e CA-06.3.1 |
| ~~D-BL-06 (PIN/biometria)~~ | **Respondida (F-10):** não haverá PIN nem biometria; o app abre direto (vale o bloqueio de tela do celular) [CONFIRMADO]. FIN-US-09.7 saiu do roadmap; nenhum critério |
| D-BL-07 (custo, ~~Android/iOS~~) | **Parte 1 respondida (F-03): só Android** [CONFIRMADO] — CA-09.6.2 e checklist de aparelhos. **Parte 2 (aceitar plano pago do Supabase/PowerSync) continua aberta** — CA-09.2.1 |
| D-BL-08 (conflito) | **Sai do MVP (F-15):** a FIN-US-07.7 foi para a v1.1; a dúvida volta na v1.1. Afeta CA-07.7.x e CB-e.2, e.4 a e.6; no MVP, só a parte "qual versão prevalece" de CB-e.1 |
| ~~D-BL-09 (Pessoal pertence a unidade)~~ | **Respondida (F-05):** todo lançamento, inclusive o Pessoal, pertence a uma unidade [CONFIRMADO]. CA-01.3.5, CB-i.5. A parte da dúvida 13 (categorias separadas Pessoal/Empresa) segue com a FIN-US-03.7, fora do MVP |
| D-BL-10 (aba padrão do cartão) | CA-05.1.2 |

### 6.3 Dúvidas novas levantadas pelo QA

| # | Dúvida | Critérios afetados |
|---|---|---|
| D-QA-01 | ~~A categoria de sistema "Produtos" é de saída ou de entrada?~~ **Respondida (04-backlog v2, S-BL-09):** "Produtos" é de **saída**; a venda ao cliente é a categoria de **entrada "Venda de produtos"**. Critérios ajustados. | CA-01.6.2, CA-02.4.1 |
| D-QA-02 | ~~No primeiro lançamento, qual forma de pagamento vem marcada?~~ **Respondida (F-12):** **Pix** no primeiro lançamento; nos seguintes, a última usada; ficam as quatro formas [CONFIRMADO]. | CA-02.2.6, CA-02.2.8 |
| D-QA-03 | ~~A FIN-US-05.6 abre o Extrato filtrado por tipo de serviço, mas nenhuma história cria esse filtro.~~ **Resolvida (04-backlog v2):** criada a FIN-US-04.7 (filtro por tipo de serviço, MVP), dependência da FIN-US-05.6. | CA-04.7.x, CA-05.6.3 |
| D-QA-04 | ~~Nome repetido: "água" e "Água" são o mesmo nome? E "Agua" sem acento?~~ **Respondida pelo dono: sim**, são o mesmo nome (maiúsculas, acentos e espaços nas pontas não contam). **Continua aberta** a segunda parte: categoria desativada com o mesmo nome também oferece "Reativar", como os tipos de serviço e de veículo? | CA-02.6.2, CA-03.1.3, CB-g.7 |
| D-QA-05 | ~~Na edição, dá para trocar o tipo do lançamento?~~ **Respondida (F-13):** não; para trocar, exclui e lança de novo [CONFIRMADO]. | CA-06.2.6, CA-06.2.7 |
| D-QA-06 | Com **"Todas as unidades"**, o botão "Repetir" aparece? De qual unidade? | CB-h.3 |
| D-QA-07 | Se a sessão vencer com pendências e **outro usuário** entrar no aparelho, o que acontece com a fila do anterior? | CB-k.5 |
| D-QA-08 | Se o aparelho estiver em **fuso diferente** do da unidade, "hoje" é o da unidade mesmo quando isso adianta a data para o dono? | CB-c.6 |
| D-QA-09 | Editar um lançamento antigo cuja categoria/tipo foi **desativado**: mantém o item desativado ou obriga a trocar? | CB-g.3 |
| D-QA-10 | O que acontece ao passar de R$ 999.999,99: ignora em silêncio ou mostra mensagem? | CA-02.1.6, CB-a.2 |
| D-QA-11 | "Últimos 5" da Início: os 5 mais recentes de qualquer data ou só os de hoje? Por hora de criação ou por data do lançamento? | CA-04.6.1 |
| D-QA-12 | Dois aparelhos offline criam o **mesmo nome** de cadastro: recusar o segundo (erro na TELA-12) ou juntar os dois? | CB-g.8 |
| D-QA-13 | ~~"Entrada de serviço" passa a ser a entrada da categoria "Serviços"?~~ **Respondida pelo Orquestrador (E2-04 a)):** sim, entrada de serviço = entrada da categoria de sistema "Serviços", e não mais "entrada com tipo de serviço preenchido". | CA-02.12.1, 02.12.8 a 02.12.10 |
| D-QA-14 | ~~O filtro por tipo de serviço precisa da opção "Sem tipo de serviço"?~~ **Respondida pelo Orquestrador:** o filtro da FIN-US-04.7 ganha a opção "Sem tipo de serviço" [SUPOSIÇÃO], para a FIN-US-05.6 abrir a linha correspondente do Resumo. | CA-04.7.1, 04.7.7, 04.7.8, CA-05.6.4 |
| D-QA-15 | ~~Reverter pelo histórico entra no MVP?~~ **Respondida pelo Orquestrador:** não; a TELA-15 é só leitura e a correção é pelo Editar. | CA-06.4.3 |
| D-QA-16 | ~~Mostrar aparelho e conflito no histórico?~~ **Respondida pelo Orquestrador:** vão para a v1.1, com a FIN-US-07.7; no MVP o histórico mostra data, hora, quem e o que mudou. | CA-06.4.1, CA-07.7.4 (v1.1) |
| D-QA-17 | ~~Quando aparece "Ver histórico" e o estado vazio da TELA-15?~~ **Respondida pelo Orquestrador:** o link aparece sempre; o estado vazio saiu; excluídos e restaurados mostram essas ações. | CA-06.4.6 |
| D-QA-18 | ~~O Desfazer pós-salvar vai para a Lixeira?~~ **Respondida pelo Orquestrador:** não [SUPOSIÇÃO]; o registro continua no servidor. | CA-02.8.3, CA-06.5.9 |

---

## 7. Fora do escopo

Não recebem critérios neste documento:

- **FIN-US-07.7 (conflito entre aparelhos)**: movida para a **v1.1** pela decisão F-15. Os critérios (CA-07.7.x) e os casos CB-e.2, e.4 a e.6 ficam registrados para a v1.1.
- **Histórias Pós-MVP** do 04-backlog: FIN-US-01.10 (eventos), 03.6 (formas de pagamento — sem tela no MVP pela F-08), 03.7 (categorias por Pessoal/Empresa), 05.7 (cruzamento serviço × veículo), 08.5 (cadastro de unidades — feito na implantação pela F-08), 09.8 (exclusão LGPD). Ganham critérios se alguma decisão as trouxer para o MVP.
- **FIN-US-09.7 (PIN/biometria):** **saiu do roadmap** pela F-10; o app abre direto e vale o bloqueio de tela do celular.
- **Publicação em loja (Google Play):** fica como evolução pela F-04; no MVP o app é distribuído por APK.
- **Outros módulos:** lançamento automático pelo atendimento/fila, placa, modelo e cliente (PIF-01, PIF-04); saída automática pela compra de estoque (PIF-02); mão de obra e reembolso por funcionário (PIF-03); gerentes, funcionários, papéis, convites e visibilidade de itens Pessoais (PIF-05); contas a pagar/receber, vencimento e recorrentes (PIF-06); regra de alteração de lançamentos com `origem ≠ manual`.
- **Fora do sistema por ora:** integração bancária, Pix automático, conciliação, nota fiscal, impostos, contabilidade, folha de pagamento, agendamento.
- **Evoluções não pedidas:** foto do comprovante, exportação para o contador, painel web, notificações, histórico de alterações dos cadastros, modo escuro.

---

## Tabela de cobertura

| História MVP | Critérios | | História MVP | Critérios |
|---|---|---|---|---|
| FIN-US-01.1 | 4 | | FIN-US-04.6 | 4 |
| FIN-US-01.2 | 3 | | FIN-US-04.7 *(nova na v2)* | 8 |
| FIN-US-01.3 | 8 | | FIN-US-05.1 | 5 |
| FIN-US-01.4 | 10 | | FIN-US-05.2 | 3 |
| FIN-US-01.5 | 5 | | FIN-US-05.3 | 5 |
| FIN-US-01.6 | 5 | | FIN-US-05.4 | 5 |
| FIN-US-01.7 | 5 | | FIN-US-05.5 | 2 |
| FIN-US-01.8 | 5 | | FIN-US-05.6 | 4 |
| FIN-US-01.9 | 5 | | FIN-US-06.1 | 3 |
| FIN-US-02.1 | 8 | | FIN-US-06.2 | 7 |
| FIN-US-02.2 | 8 | | FIN-US-06.3 | 4 |
| FIN-US-02.3 | 4 | | FIN-US-06.4 *(MVP na v7, F-09)* | 6 |
| FIN-US-02.4 | 3 | | FIN-US-06.5 *(MVP na v7, F-09)* | 9 |
| FIN-US-02.5 | 5 | | FIN-US-07.1 | 4 |
| FIN-US-02.6 | 4 | | FIN-US-07.2 | 3 |
| FIN-US-02.7 | 4 | | FIN-US-07.3 | 4 |
| FIN-US-02.8 | 4 | | FIN-US-07.4 | 4 |
| FIN-US-02.9 | 4 | | FIN-US-07.5 | 4 |
| FIN-US-02.10 | 4 | | FIN-US-07.6 | 5 |
| FIN-US-02.11 | 2 | | FIN-US-07.8 | 3 |
| FIN-US-02.12 *(desbloqueada na v3)* | 11 | | FIN-US-07.9 | 2 |
| FIN-US-03.1 | 6 | | FIN-US-08.1 | 2 |
| FIN-US-03.2 | 4 | | FIN-US-08.2 | 4 |
| FIN-US-03.3 | 4 | | FIN-US-08.3 | 3 |
| FIN-US-03.4 | 4 | | FIN-US-08.4 | 3 |
| FIN-US-03.5 | 3 | | FIN-US-09.1 | 3 |
| FIN-US-04.1 | 5 | | FIN-US-09.2 | 3 |
| FIN-US-04.2 | 9 | | FIN-US-09.3 | 2 |
| FIN-US-04.3 | 5 | | FIN-US-09.4 | 3 |
| FIN-US-04.4 | 2 | | FIN-US-09.5 | 2 |
| FIN-US-04.5 | 3 | | FIN-US-09.6 | 5 |

**Totais do MVP:** 62 histórias MVP; **62 com critérios**, somando **280 critérios**, mais **66 casos de borda** que valem no MVP.
**História MVP sem critério:** nenhuma.
**Fora da contagem do MVP (v1.1, decisão F-15):** FIN-US-07.7, com 4 critérios (CA-07.7.1 a 07.7.4), e 4 casos de borda (CB-e.2, e.4, e.5, e.6). No documento inteiro: 284 critérios e 70 casos de borda.
