import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Configuração do app (substitui o app.json). FIN-US-09.6.
 *
 * ID DO PACOTE ANDROID — ÚNICO LUGAR PARA TROCAR.
 * [SUPOSIÇÃO, ainda não confirmado pelo dono.] Depois que o primeiro APK for instalado no
 * celular do dono, este id não pode mais mudar: um APK com outro id vira OUTRO app (sem os
 * dados do anterior). Confirme antes de gerar o APK definitivo.
 */
export const ID_PACOTE_ANDROID = 'br.com.lavajato.app';

/**
 * Variante do build, definida pelo perfil do eas.json (APP_VARIANTE):
 * - "teste": APK de teste da equipe, com id próprio (".teste"), para conviver no mesmo celular
 *   com o app do dono sem misturar dados;
 * - "dono": o app de verdade do dono.
 */
const variante = process.env.APP_VARIANTE === 'teste' ? 'teste' : 'dono';

/**
 * Id do projeto no EAS, criado pelo dono com `eas init` (PENDÊNCIA DO DONO: conta Expo).
 * Fica numa variável de ambiente para não depender de editar este arquivo.
 */
const idProjetoEas = process.env.EAS_PROJECT_ID;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: variante === 'teste' ? 'Lavajato (teste)' : 'Lavajato',
  slug: 'lavajato',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'lavajato',
  userInterfaceStyle: 'light',
  // Só Android no MVP (F-03); nada de iOS nem web.
  platforms: ['android'],
  android: {
    package: variante === 'teste' ? `${ID_PACOTE_ANDROID}.teste` : ID_PACOTE_ANDROID,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  // EAS Update: correções só de JavaScript/telas chegam pelo próprio app (RNF-28).
  // O canal (teste ou dono) vem do perfil de build no eas.json.
  // "fingerprint": o APK só aceita atualizações feitas para o mesmo código nativo; mudança
  // nativa exige APK novo.
  runtimeVersion: { policy: 'fingerprint' },
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    // Abre na hora com a versão que já está no celular; a nova vale na próxima abertura.
    fallbackToCacheTimeout: 0,
    ...(idProjetoEas ? { url: `https://u.expo.dev/${idProjetoEas}` } : {}),
  },
  extra: {
    variante,
    ...(idProjetoEas ? { eas: { projectId: idProjetoEas } } : {}),
  },
  plugins: ['expo-router'],
});
