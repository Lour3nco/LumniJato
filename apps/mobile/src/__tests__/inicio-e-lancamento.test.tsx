import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { StyleSheet } from 'react-native';

import { ROTAS_DO_APP } from '../testes/apoio/rotas';

// O dono já entrou neste aparelho.
jest.mock('../sessao/servico-padrao', () => {
  const apoio = jest.requireActual('../testes/apoio/sessao-falsa');
  return { servicoDeSessao: apoio.criarSessaoFalsa(apoio.SESSAO_DO_DONO).servico };
});

/** Avança os timers falsos do renderRouter para a navegação terminar. */
async function esperarNavegacao(): Promise<void> {
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
}

async function tocar(nome: string): Promise<void> {
  await act(async () => {
    await fireEvent.press(screen.getByRole('button', { name: nome }));
  });
  await esperarNavegacao();
}

async function segurar(nome: string): Promise<void> {
  await act(async () => {
    await fireEvent(screen.getByRole('button', { name: nome }), 'longPress');
  });
}

async function digitar(sequencia: string): Promise<void> {
  for (const digito of sequencia) await tocar(digito);
}

function valorNaTela(): string {
  return String(screen.getByTestId('valor-digitado').props.children);
}

async function abrirFormulario(botao: string): Promise<void> {
  await renderRouter(ROTAS_DO_APP, { initialUrl: '/' });
  await screen.findByRole('header', { name: 'Início' });
  await tocar(botao);
}

afterEach(async () => {
  await esperarNavegacao();
});

describe('Início: botões de lançamento (FIN-US-02.11)', () => {
  // CA-02.11.1
  it('mostra + Carro, + Entrou e − Saiu fixos embaixo, com ~72 dp', async () => {
    await renderRouter(ROTAS_DO_APP, { initialUrl: '/' });
    await screen.findByRole('header', { name: 'Início' });
    for (const nome of ['Adicionar carro', 'Registrar entrada', 'Registrar saída']) {
      const botao = screen.getByRole('button', { name: nome });
      const estilo = StyleSheet.flatten(botao.props.style);
      expect(estilo.minHeight).toBeGreaterThanOrEqual(72);
    }
    // Os botões ficam fora da área que rola, num bloco próprio no pé da tela.
    expect(screen.getByTestId('botoes-de-lancamento')).toBeOnTheScreen();
  });

  // CA-02.11.2
  it.each([
    ['Adicionar carro', 'Novo serviço'],
    ['Registrar entrada', 'Nova entrada'],
    ['Registrar saída', 'Nova saída'],
  ])('%s abre "%s" com 1 toque', async (botao, titulo) => {
    await abrirFormulario(botao);
    expect(await screen.findByRole('header', { name: titulo })).toBeOnTheScreen();
  });
});

describe('valor estilo caixa registradora (FIN-US-02.1)', () => {
  // CA-02.1.1
  it('abre com "R$ 0,00" em cinza e o teclado numérico do app já aberto', async () => {
    await abrirFormulario('Registrar saída');
    expect(valorNaTela()).toBe('R$ 0,00');
    expect(StyleSheet.flatten(screen.getByTestId('valor-digitado').props.style).color).toBe('#5C5C5C');
    for (const tecla of ['0', '1', '9', 'Apagar']) {
      expect(screen.getByRole('button', { name: tecla })).toBeOnTheScreen();
    }
  });

  // CA-02.1.2
  it.each([
    ['25', 'R$ 0,25'],
    ['2500', 'R$ 25,00'],
    ['124000', 'R$ 1.240,00'],
  ])('digitar %s mostra %s', async (sequencia, esperado) => {
    await abrirFormulario('Adicionar carro');
    await digitar(sequencia);
    expect(valorNaTela()).toBe(esperado);
  });

  // CA-02.1.3, CA-02.1.4 e CB-a.7
  it('⌫ apaga o último dígito e segurar ⌫ zera e desabilita Salvar', async () => {
    await abrirFormulario('Registrar saída');
    await digitar('2500');
    await tocar('Apagar');
    expect(valorNaTela()).toBe('R$ 2,50');
    await segurar('Apagar');
    expect(valorNaTela()).toBe('R$ 0,00');
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  // CA-02.1.5, CB-a.1 e CB-a.8
  it('Salvar fica desabilitado em R$ 0,00, inclusive digitando só zeros', async () => {
    await abrirFormulario('Registrar entrada');
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    await digitar('000');
    expect(valorNaTela()).toBe('R$ 0,00');
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  // CA-02.1.6
  it('em R$ 999.999,99, mais um dígito não muda o valor', async () => {
    await abrirFormulario('Registrar saída');
    await digitar('999999999');
    expect(valorNaTela()).toBe('R$ 999.999,99');
  });

  // CA-02.1.7 e CB-a.4
  it('acima de R$ 10.000,00 pede "Confere?"; corrigir volta com o valor intacto', async () => {
    await abrirFormulario('Registrar saída');
    await digitar('1200000');
    await tocar('Salvar');
    expect(screen.getByRole('header', { name: 'Confere?' })).toBeOnTheScreen();
    await tocar('Corrigir o valor');
    expect(screen.queryByRole('header', { name: 'Confere?' })).toBeNull();
    expect(valorNaTela()).toBe('R$ 12.000,00');
  });

  it('R$ 10.000,00 exatos não pedem confirmação', async () => {
    await abrirFormulario('Registrar saída');
    await digitar('1000000');
    await tocar('Salvar');
    expect(screen.queryByRole('header', { name: 'Confere?' })).toBeNull();
  });
});

describe('Mais / Ajustes (FIN-US-08.1)', () => {
  async function abrirMais(): Promise<void> {
    await renderRouter(ROTAS_DO_APP, { initialUrl: '/' });
    await screen.findByRole('header', { name: 'Início' });
    await tocar('Mais');
  }

  // CA-08.1.1
  it('mostra os 8 itens e não mostra Unidades nem Formas de pagamento', async () => {
    await abrirMais();
    for (const item of ['Categorias', 'Tipos de serviço', 'Tipos de veículo', 'Lixeira', 'Sincronização', 'Sobre', 'Sair']) {
      expect(screen.getByRole('button', { name: item })).toBeOnTheScreen();
    }
    expect(screen.getByRole('button', { name: 'Padrão Pessoal/Empresa: Empresa' })).toBeOnTheScreen();
    expect(screen.queryByText(/Unidades|Formas de pagamento/)).toBeNull();
  });

  // CA-08.1.2
  it.each([
    ['Categorias', 'TELA-10'],
    ['Tipos de serviço', 'TELA-11'],
    ['Tipos de veículo', 'TELA-14'],
    ['Lixeira', 'TELA-16'],
    ['Sincronização', 'TELA-12'],
  ])('%s abre a %s', async (item, tela) => {
    await abrirMais();
    await tocar(item);
    expect(await screen.findByText(`${tela} · em construção`)).toBeOnTheScreen();
  });

  it('Sobre mostra o nome e a versão do app', async () => {
    await abrirMais();
    await tocar('Sobre');
    expect(await screen.findByText(/^Versão /)).toBeOnTheScreen();
  });

  it('Padrão Pessoal/Empresa abre a escolha e mostra o escolhido', async () => {
    await abrirMais();
    await tocar('Padrão Pessoal/Empresa: Empresa');
    expect(screen.getByRole('header', { name: 'Padrão dos lançamentos' })).toBeOnTheScreen();
    await tocar('Pessoal');
    expect(screen.getByRole('button', { name: 'Padrão Pessoal/Empresa: Pessoal' })).toBeOnTheScreen();
  });

  it('Sair abre a confirmação e, confirmando, volta para a tela Entrar', async () => {
    await abrirMais();
    await tocar('Sair');
    expect(screen.getByRole('header', { name: 'Sair da conta?' })).toBeOnTheScreen();
    await tocar('Confirmar sair da conta');
    expect(await screen.findByRole('header', { name: 'Entrar' })).toBeOnTheScreen();
  });
});
