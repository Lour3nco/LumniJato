import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { StyleSheet } from 'react-native';

import { ROTAS_DO_APP } from '../testes/apoio/rotas';
import { criarFonteFalsa } from '../testes/apoio/unidades-falsas';

jest.mock('../sessao/servico-padrao', () => {
  const apoio = jest.requireActual('../testes/apoio/sessao-falsa');
  return { servicoDeSessao: apoio.criarSessaoFalsa(apoio.SESSAO_DO_DONO).servico };
});

// A mesma fonte durante o arquivo todo: a escolha "sobrevive" a fechar e abrir o app.
const mockUnidades = { atual: criarFonteFalsa() };
jest.mock('../unidades/fonte-padrao', () => ({
  criarFonteDeUnidadesPadrao: () => mockUnidades.atual.fonte,
}));

async function esperar(): Promise<void> {
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
}

async function tocar(nome: string, papel: 'button' | 'radio' = 'button'): Promise<void> {
  await act(async () => {
    await fireEvent.press(screen.getByRole(papel, { name: nome }));
  });
  await esperar();
}

async function abrirApp() {
  const app = await renderRouter(ROTAS_DO_APP, { initialUrl: '/' });
  await screen.findByRole('header', { name: 'Início' });
  await esperar();
  return app;
}

function corDoTopo(): string {
  return StyleSheet.flatten(screen.getByTestId('topo-da-unidade').props.style).backgroundColor;
}

afterEach(esperar);

describe('seletor de unidade (FIN-US-08.3)', () => {
  // CA-08.3.1
  it('tocar no nome da unidade abre a lista com a atual marcada e "Todas as unidades"', async () => {
    mockUnidades.atual = criarFonteFalsa();
    await abrirApp();
    await tocar('Unidade atual: Unidade Centro. Toque para trocar.');
    expect(screen.getByRole('header', { name: 'Escolha a unidade' })).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Unidade Centro' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Unidade Bairro' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Todas as unidades' })).toBeOnTheScreen();
  });

  // CA-08.3.2 e CA-08.3.3
  it('escolher "Unidade Bairro" troca nome e cor do topo, vale para o lançamento novo e fica lembrada', async () => {
    mockUnidades.atual = criarFonteFalsa();
    const app = await abrirApp();
    const corAntes = corDoTopo();
    await tocar('Unidade atual: Unidade Centro. Toque para trocar.');
    await tocar('Unidade Bairro', 'radio');

    expect(screen.queryByRole('header', { name: 'Escolha a unidade' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Unidade atual: Unidade Bairro. Toque para trocar.' })).toBeOnTheScreen();
    expect(corDoTopo()).not.toBe(corAntes);

    await tocar('Adicionar carro');
    expect(screen.getByLabelText('Unidade: Unidade Bairro')).toBeOnTheScreen();

    // "Fecha e abre o app": desmonta e monta de novo, com a mesma fonte guardada no aparelho.
    await act(async () => {
      await app.unmount();
    });
    await abrirApp();
    expect(screen.getByRole('button', { name: 'Unidade atual: Unidade Bairro. Toque para trocar.' })).toBeOnTheScreen();
  });

  it('com "Todas as unidades", o formulário pede a unidade antes de salvar', async () => {
    mockUnidades.atual = criarFonteFalsa(undefined, 'todas');
    await abrirApp();
    expect(screen.getByRole('button', { name: 'Unidade atual: Todas as unidades. Toque para trocar.' })).toBeOnTheScreen();
    await tocar('Registrar saída');
    await tocar('5');
    expect(screen.getByText('Escolha a unidade antes de salvar.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    await tocar('Unidade Centro');
    expect(screen.queryByText('Escolha a unidade antes de salvar.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Salvar' })).not.toBeDisabled();
  });

  it('sem nenhuma unidade no celular, a lista explica como baixar', async () => {
    mockUnidades.atual = criarFonteFalsa([], null);
    await abrirApp();
    await tocar('Unidade atual: Sem unidade. Toque para trocar.');
    expect(screen.getByText(/Nenhuma unidade no celular ainda/)).toBeOnTheScreen();
  });
});

// Sugestão (d) da Arquitetura, passo 5
describe('formulário enquanto a gravação não existe', () => {
  it('avisa que não grava e, ao tocar Salvar, diz que nada foi gravado e continua no formulário', async () => {
    mockUnidades.atual = criarFonteFalsa();
    await abrirApp();
    await tocar('Registrar entrada');
    expect(screen.getByTestId('aviso-nao-grava')).toHaveTextContent(/ainda não grava/);
    await tocar('2');
    await tocar('5');
    await tocar('Salvar');
    expect(screen.getByText('Nada foi gravado: esta versão ainda não salva lançamentos.')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Nova entrada' })).toBeOnTheScreen();
  });
});
