import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { ROTAS_DO_APP } from '../testes/apoio/rotas';

import { MENSAGENS_AO_ENTRAR } from '../sessao/servico-de-sessao';
import { SESSAO_DO_DONO, criarSessaoFalsa } from '../testes/apoio/sessao-falsa';

// Cada teste troca o serviço de sessão; o getter lê o atual na hora de renderizar.
const mockSessao = { atual: criarSessaoFalsa() };
jest.mock('../sessao/servico-padrao', () => ({
  get servicoDeSessao() {
    return mockSessao.atual.servico;
  },
}));

const rotas = ROTAS_DO_APP;

async function preencherEEntrar(email: string, senha: string): Promise<void> {
  await fireEvent.changeText(await screen.findByLabelText('E-mail'), email);
  await fireEvent.changeText(screen.getByLabelText('Senha'), senha);
  await act(async () => {
    await fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
  });
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
}

describe('entrar com e-mail e senha (FIN-US-01.7)', () => {
  // O renderRouter usa timers falsos: deixa a navegação terminar antes da limpeza do teste.
  afterEach(async () => {
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
  });

  it('sem sessão, abre na TELA-13 sem opção de criar conta (ST-07)', async () => {
    mockSessao.atual = criarSessaoFalsa(null);
    await renderRouter(rotas, { initialUrl: '/' });

    expect(await screen.findByRole('header', { name: 'Entrar' })).toBeOnTheScreen();
    expect(screen.queryByText(/criar conta|cadastr/i)).toBeNull();
    expect(screen.queryByRole('header', { name: 'Início' })).toBeNull();
  });

  // CA-01.7.1
  it('com e-mail e senha corretos, entra e abre a Início', async () => {
    mockSessao.atual = criarSessaoFalsa(null);
    await renderRouter(rotas, { initialUrl: '/' });

    await preencherEEntrar(' dono@exemplo.com ', 'senha-certa');

    expect(await screen.findByRole('header', { name: 'Início' })).toBeOnTheScreen();
    expect(mockSessao.atual.estado.tentativas).toEqual([{ email: ' dono@exemplo.com ', senha: 'senha-certa' }]);
  });

  // CA-01.7.2
  it('com senha errada, mostra mensagem simples e continua na TELA-13', async () => {
    mockSessao.atual = criarSessaoFalsa(null);
    mockSessao.atual.estado.proximoResultado = {
      ok: false,
      motivo: 'credenciais_invalidas',
      mensagem: MENSAGENS_AO_ENTRAR.credenciais_invalidas,
    };
    await renderRouter(rotas, { initialUrl: '/' });

    await preencherEEntrar('dono@exemplo.com', 'errada');

    expect(screen.getByText('E-mail ou senha incorretos. Confira e tente de novo.')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Entrar' })).toBeOnTheScreen();
  });

  // CA-01.7.3
  it('no primeiro acesso sem internet, avisa que precisa de internet e nada trava', async () => {
    mockSessao.atual = criarSessaoFalsa(null);
    mockSessao.atual.estado.proximoResultado = {
      ok: false,
      motivo: 'sem_internet',
      mensagem: MENSAGENS_AO_ENTRAR.sem_internet,
    };
    await renderRouter(rotas, { initialUrl: '/' });

    await preencherEEntrar('dono@exemplo.com', 'senha-certa');

    expect(screen.getByText(/primeiro acesso precisa de internet/)).toBeOnTheScreen();
    // Dá para tentar de novo: o botão volta a ficar disponível.
    expect(screen.getByRole('button', { name: 'Entrar' })).not.toBeDisabled();
  });

  // CA-01.7.4 (o serviço de sessão local não usa rede; ver servico-supabase.test.ts)
  it('quem já entrou abre direto na Início, sem pedir login', async () => {
    mockSessao.atual = criarSessaoFalsa(SESSAO_DO_DONO);
    await renderRouter(rotas, { initialUrl: '/' });

    expect(await screen.findByRole('header', { name: 'Início' })).toBeOnTheScreen();
    expect(screen.queryByLabelText('Senha')).toBeNull();
  });

  it('o botão Entrar fica desabilitado até preencher e-mail e senha', async () => {
    mockSessao.atual = criarSessaoFalsa(null);
    await renderRouter(rotas, { initialUrl: '/' });

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeDisabled();
  });
});
