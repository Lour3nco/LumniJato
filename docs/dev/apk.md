# APK do Lavajato: gerar, instalar e atualizar

FIN-US-09.6 · RNF-28. O app é só para Android 8 ou mais novo (F-03) e é instalado direto no
celular do dono, **sem Google Play** (F-04).

## Como está montado

| Peça | Onde | O que faz |
|---|---|---|
| `apps/mobile/app.config.ts` | `ID_PACOTE_ANDROID` no topo | **Único lugar** do id do pacote Android (hoje `br.com.lavajato.app`, ainda **não confirmado** pelo dono) |
| `apps/mobile/eas.json` | perfil `teste` | APK da equipe: id `…app.teste`, nome "Lavajato (teste)", canal de atualização `teste` |
| `apps/mobile/eas.json` | perfil `dono` | APK do dono: canal `dono`, número de versão (`versionCode`) sobe sozinho a cada APK |
| EAS Update | `updates` e `runtimeVersion` no `app.config.ts` | Correções só de telas/JavaScript chegam pelo app ao abrir com internet |

O APK de teste tem id diferente: pode ficar no mesmo celular que o app do dono, sem misturar os dados.

## Antes do primeiro APK — passos do dono (uma vez)

Estes passos usam a **conta do dono**. Ninguém da equipe cria a conta por ele.

1. **Confirmar o id do pacote.** Depois do primeiro APK instalado ele não muda mais (um id
   diferente vira outro app, sem os dados). Para trocar: editar só `ID_PACOTE_ANDROID` em
   `apps/mobile/app.config.ts`.
2. **Criar a conta Expo** (gratuita) em <https://expo.dev/signup>.
3. No terminal, em `apps/mobile`:

   ```bash
   pnpm dlx eas-cli login
   pnpm dlx eas-cli init          # cria o projeto no EAS e mostra o id do projeto
   ```

   Copie o id do projeto para `apps/mobile/.env` (`EAS_PROJECT_ID=...`, a partir do `.env.example`)
   e também cadastre-o no EAS (próximo passo), porque o build roda na nuvem do EAS.
4. **Variáveis do build no EAS** (o `.env` do computador não vai para a nuvem): em
   <https://expo.dev> → projeto → **Environment variables**, cadastre para os ambientes
   `preview` (teste) e `production` (dono):
   `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` e `EAS_PROJECT_ID`.
   Só valores públicos: **nunca** a service_role nem a senha do banco.

## Chave de assinatura — guardar fora do git

O Android só aceita instalar uma versão nova **por cima** se ela for assinada com a **mesma
chave**. Perdeu a chave = o dono teria que desinstalar (perdendo o que não foi enviado) e
instalar de novo. Por isso:

1. No **primeiro** `eas build` do perfil `dono`, responda **sim** para o EAS gerar a chave.
   Ela fica guardada na conta do EAS (`credentialsSource: remote`).
2. Logo depois, baixe uma cópia de segurança:

   ```bash
   pnpm dlx eas-cli credentials -p android
   # escolha o perfil "dono" → Keystore → "Download existing keystore"
   ```

   O comando mostra a senha da chave e o alias: guarde os três juntos.
3. Guarde o arquivo `.jks` + senhas **em dois lugares fora do computador de build**, por
   exemplo: o gerenciador de senhas do dono e um pendrive/nuvem pessoal criptografada.
4. **Nunca** coloque o `.jks` nem o `credentials.json` no repositório (o `.gitignore` já
   bloqueia `*.jks`, `*.keystore`, `credentials.json` e `credentials/`).

## Gerar o APK

Em `apps/mobile`:

```bash
pnpm dlx eas-cli build -p android --profile teste   # APK de teste da equipe
pnpm dlx eas-cli build -p android --profile dono    # APK do dono (só depois de confirmar o id)
```

No fim, o EAS mostra um link e um QR code para baixar o `.apk`.

## Instalar no celular do dono (Android 8+)

1. No celular, abra o link do APK (ou leia o QR code) e baixe o arquivo.
2. Toque no arquivo baixado. Na primeira vez o Android avisa que o navegador (ou o app de
   arquivos) não pode instalar apps: toque em **Configurações** e ligue
   **Permitir desta fonte** ("instalar apps desconhecidos").
3. Volte e toque em **Instalar**. Se o Play Protect perguntar, escolha **Instalar mesmo assim**.
4. Abra o **Lavajato** e entre com o e-mail e a senha que a equipe passou.

## Atualizar

| Mudou o quê | Como chega | O que o dono faz |
|---|---|---|
| Só telas/JavaScript | EAS Update: `pnpm dlx eas-cli update --channel dono -m "o que mudou"` | Nada: o app baixa ao abrir com internet e a versão nova vale na **próxima** abertura |
| Algo nativo (biblioteca, permissão, versão do Expo) | APK novo pelo perfil `dono` | Baixa e instala **por cima**, como na instalação. Os dados e as pendências continuam |

Regras:

- Publique primeiro no canal `teste`, confira no APK de teste e só depois no canal `dono`.
- O `runtimeVersion` usa a "impressão digital" do código nativo: uma atualização feita para
  outro código nativo **não** é entregue ao APK antigo (evita quebrar o app).
- Antes de cada versão, teste as duas atualizações com lançamentos pendentes na fila
  (CA-09.6.3 e CA-09.6.4) e confira que um APK assinado com outra chave é recusado
  (CA-09.6.5).
