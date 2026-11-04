import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet, View } from 'react-native';

import {
  AvisoInferior,
  BotaoGrande,
  Chip,
  FolhaInferior,
  GradeDeIcones,
  ItemDeLista,
  ValorEmReais,
} from '../componentes';
import { cores } from '../tema';

function estiloDe(elemento: { props: { style?: unknown } }) {
  return StyleSheet.flatten(elemento.props.style as never) ?? {};
}

/** Maior `minHeight` no elemento ou nos seus filhos/pais próximos. */
function alturaMinima(elemento: { props: { style?: unknown }; parent: unknown; children?: unknown[] }): number {
  let maior = 0;
  const visitar = (no: { props?: { style?: unknown }; children?: unknown[] } | string, profundidade: number) => {
    if (typeof no === 'string' || !no?.props || profundidade > 3) return;
    const estilo = estiloDe(no as { props: { style?: unknown } });
    if (typeof estilo.minHeight === 'number') maior = Math.max(maior, estilo.minHeight);
    for (const filho of no.children ?? []) visitar(filho as never, profundidade + 1);
  };
  visitar(elemento as never, 0);
  return maior;
}

describe('componentes base (FIN-US-01.9)', () => {
  // CA-01.9.1
  it.each([
    [123456, 'R$ 1.234,56'],
    [5, 'R$ 0,05'],
    [0, 'R$ 0,00'],
    [99999999, 'R$ 999.999,99'],
  ])('ValorEmReais mostra %i centavos como "%s"', async (centavos, texto) => {
    await render(<ValorEmReais centavos={centavos} />);
    expect(screen.getByText(texto)).toBeOnTheScreen();
  });

  // CA-01.9.2
  it('ValorEmReais mostra saldo negativo com "−" e em vermelho', async () => {
    await render(<ValorEmReais centavos={-2550} cor={cores.texto} />);
    const valor = screen.getByText('−R$ 25,50');
    expect(estiloDe(valor).color).toBe(cores.vermelho);
  });

  // CA-01.9.4
  it('BotaoGrande é lido pelo rótulo próprio e tem pelo menos 64 dp', async () => {
    const aoTocar = jest.fn();
    await render(
      <View>
        <BotaoGrande rotulo="+ Carro" rotuloAcessivel="Adicionar carro" variante="entrada" icone="carro" aoTocar={aoTocar} />
        <BotaoGrande rotulo="− Saiu" rotuloAcessivel="Registrar saída" variante="saida" aoTocar={jest.fn()} />
      </View>,
    );
    const botao = screen.getByRole('button', { name: 'Adicionar carro' });
    expect(screen.getByRole('button', { name: 'Registrar saída' })).toBeOnTheScreen();
    await fireEvent.press(botao);
    expect(aoTocar).toHaveBeenCalledTimes(1);
    expect(alturaMinima(botao as never)).toBeGreaterThanOrEqual(64);
  });

  it('BotaoGrande desabilitado não reage ao toque', async () => {
    const aoTocar = jest.fn();
    await render(<BotaoGrande rotulo="Salvar" rotuloAcessivel="Salvar" aoTocar={aoTocar} desabilitado />);
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(aoTocar).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
  });

  it('Chip informa se está selecionado e tem 48 dp', async () => {
    await render(<Chip rotulo="Mês" selecionado aoTocar={jest.fn()} />);
    const chip = screen.getByRole('button', { name: 'Mês' });
    expect(chip).toBeSelected();
    expect(alturaMinima(chip as never)).toBeGreaterThanOrEqual(48);
  });

  it('GradeDeIcones escolhe e, quando permitido, desmarca', async () => {
    const aoSelecionar = jest.fn();
    const itens = [
      { id: 'a', rotulo: 'Polimento', icone: 'servicos' },
      { id: 'b', rotulo: 'Lavagem rápida', icone: 'servicos' },
    ];
    await render(<GradeDeIcones itens={itens} selecionadoId="a" aoSelecionar={aoSelecionar} permitirDesmarcar />);
    expect(screen.getByRole('radio', { name: 'Polimento' })).toBeChecked();
    await fireEvent.press(screen.getByRole('radio', { name: 'Lavagem rápida' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Polimento' }));
    expect(aoSelecionar.mock.calls).toEqual([['b'], [null]]);
  });

  it('ItemDeLista mostra sinal e cor e é lido de uma vez pelo leitor de tela', async () => {
    await render(
      <View>
        <ItemDeLista icone="alimentacao" titulo="Alimentação" detalhe="Dinheiro" tipo="saida" valorCentavos={2500} data="Hoje" pendente />
        <ItemDeLista icone="suv" titulo="Lavagem completa" detalhe="SUV · Pix" tipo="entrada" valorCentavos={6000} pessoal />
      </View>,
    );
    const saida = screen.getByText('−R$ 25,00');
    expect(estiloDe(saida).color).toBe(cores.vermelho);
    expect(estiloDe(screen.getByText('+R$ 60,00')).color).toBe(cores.verde);
    expect(
      screen.getByLabelText('Alimentação, Dinheiro, saída de R$ 25,00, Hoje, aguardando envio'),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Lavagem completa, SUV · Pix, entrada de R$ 60,00, pessoal')).toBeOnTheScreen();
  });

  it('AvisoInferior oferece Desfazer e some sozinho depois de ~5 s', async () => {
    jest.useFakeTimers();
    const desfazer = jest.fn();
    const aoSumir = jest.fn();
    await render(
      <AvisoInferior
        visivel
        mensagem="Saída de R$ 25,00 salva"
        acoes={[{ rotulo: 'Desfazer', aoTocar: desfazer }]}
        aoSumir={aoSumir}
      />,
    );
    expect(screen.getByText('Saída de R$ 25,00 salva')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Desfazer' }));
    expect(desfazer).toHaveBeenCalledTimes(1);
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(aoSumir).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('FolhaInferior mostra o título e fecha pelo ✕', async () => {
    const aoFechar = jest.fn();
    await render(
      <FolhaInferior visivel titulo="Escolha a unidade" aoFechar={aoFechar}>
        <Chip rotulo="Centro" aoTocar={jest.fn()} />
      </FolhaInferior>,
    );
    expect(screen.getByRole('header', { name: 'Escolha a unidade' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Fechar Escolha a unidade' }));
    expect(aoFechar).toHaveBeenCalledTimes(1);
  });
});
