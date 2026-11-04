import type { ExpoConfig } from 'expo/config';

import configurar, { ID_PACOTE_ANDROID } from '../../app.config';
import eas from '../../eas.json';

function configuracaoCom(variante?: string): ExpoConfig {
  const anterior = process.env.APP_VARIANTE;
  if (variante) process.env.APP_VARIANTE = variante;
  else delete process.env.APP_VARIANTE;
  try {
    let resultado!: ExpoConfig;
    jest.isolateModules(() => {
      const modulo = jest.requireActual<{ default: typeof configurar }>('../../app.config');
      resultado = modulo.default({ config: {} } as never);
    });
    return resultado;
  } finally {
    if (anterior === undefined) delete process.env.APP_VARIANTE;
    else process.env.APP_VARIANTE = anterior;
  }
}

describe('configuração de build e distribuição (FIN-US-09.6)', () => {
  // CA-09.6.2
  it('só gera Android, sem iOS nem web', () => {
    const config = configuracaoCom('dono');
    expect(config.platforms).toEqual(['android']);
    expect(config.ios).toBeUndefined();
  });

  it('os perfis de teste e do dono geram APK de instalação direta, sem loja', () => {
    expect(eas.build.base.android.buildType).toBe('apk');
    expect(eas.build.teste.extends).toBe('base');
    expect(eas.build.dono.extends).toBe('base');
    expect(eas).not.toHaveProperty('submit');
  });

  it('tem canais separados para teste e para o dono', () => {
    expect(eas.build.teste.channel).toBe('teste');
    expect(eas.build.dono.channel).toBe('dono');
  });

  it('o id do pacote vem de um único lugar; o APK de teste tem id próprio', () => {
    expect(configuracaoCom('dono').android?.package).toBe(ID_PACOTE_ANDROID);
    expect(configuracaoCom().android?.package).toBe(ID_PACOTE_ANDROID);
    expect(configuracaoCom('teste').android?.package).toBe(`${ID_PACOTE_ANDROID}.teste`);
  });

  it('atualizações pelo app só valem para o mesmo código nativo', () => {
    expect(configuracaoCom('dono').runtimeVersion).toEqual({ policy: 'fingerprint' });
  });
});
