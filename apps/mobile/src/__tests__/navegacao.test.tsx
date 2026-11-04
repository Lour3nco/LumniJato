import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import LayoutRaiz from '../app/_layout';
import LayoutAbas from '../app/(abas)/_layout';
import Extrato from '../app/(abas)/extrato';
import Inicio from '../app/(abas)/index';
import Mais from '../app/(abas)/mais';
import Resumo from '../app/(abas)/resumo';

const rotas = {
  _layout: LayoutRaiz,
  '(abas)/_layout': LayoutAbas,
  '(abas)/index': Inicio,
  '(abas)/extrato': Extrato,
  '(abas)/resumo': Resumo,
  '(abas)/mais': Mais,
};

const itensDaBarra = ['Início', 'Extrato', 'Resumo', 'Mais'];

function itensMarcados(): string[] {
  return itensDaBarra.filter(
    (item) => screen.getByRole('button', { name: item }).props.accessibilityState?.selected,
  );
}

type NoDeTeste = { props: { style?: unknown }; parent: NoDeTeste | null };

/** Maior `minHeight` no elemento tocável ou nos seus contêineres próximos. */
function alturaMinima(no: NoDeTeste | null): number {
  let maior = 0;
  for (let nivel = 0; no && nivel < 4; nivel++, no = no.parent) {
    const estilo = Object.assign({}, ...[no.props.style].flat(Infinity).filter(Boolean));
    if (typeof estilo.minHeight === 'number') maior = Math.max(maior, estilo.minHeight);
  }
  return maior;
}

/**
 * O `renderRouter` liga timers falsos: depois de tocar, é preciso avançar o tempo para a
 * navegação terminar; senão o toque seguinte é ignorado e o estado vaza para o próximo teste.
 */
async function tocar(item: string): Promise<void> {
  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: item }));
  });
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
}

describe('navegação pela barra inferior (FIN-US-01.1)', () => {
  // CA-01.1.1
  it('abre na Início com a barra Início · Extrato · Resumo · Mais e Início marcada', async () => {
    await renderRouter(rotas, { initialUrl: '/' });

    expect(await screen.findByRole('header', { name: 'Início' })).toBeOnTheScreen();
    for (const item of itensDaBarra) {
      expect(screen.getByRole('button', { name: item })).toBeOnTheScreen();
    }
    expect(itensMarcados()).toEqual(['Início']);
  });

  // CA-01.1.2
  it.each([
    ['/', 'Extrato', 'TELA-05', '/extrato'],
    ['/extrato', 'Resumo', 'TELA-06', '/resumo'],
    ['/resumo', 'Mais', 'TELA-09', '/mais'],
    ['/mais', 'Início', 'TELA-01', '/'],
  ])('de %s, tocar em %s abre a %s e marca o item', async (inicial, item, idTela, caminho) => {
    await renderRouter(rotas, { initialUrl: inicial });

    await tocar(item);

    expect(screen).toHavePathname(caminho);
    expect(screen.getByRole('header', { name: item })).toBeOnTheScreen();
    expect(screen.getByText(`${idTela} · em construção`)).toBeOnTheScreen();
    expect(itensMarcados()).toEqual([item]);
  });

  it('percorre a barra inteira em sequência', async () => {
    await renderRouter(rotas, { initialUrl: '/' });

    for (const item of ['Extrato', 'Resumo', 'Mais', 'Início']) {
      await tocar(item);
      expect(itensMarcados()).toEqual([item]);
    }
  });

  // CA-01.1.3 (parte verificável em teste): área de toque mínima de 48 dp na barra (RNF-01)
  it('cada item da barra tem pelo menos 48 dp de altura de toque', async () => {
    await renderRouter(rotas, { initialUrl: '/' });

    for (const item of itensDaBarra) {
      const botao = await screen.findByRole('button', { name: item });
      expect(alturaMinima(botao)).toBeGreaterThanOrEqual(48);
    }
  });
});
