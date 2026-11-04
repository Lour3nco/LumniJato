import glifos from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json';

import { CATALOGO_DE_ICONES, glifoDoIcone } from '../icones/catalogo';

describe('catálogo de ícones (FIN-US-01.9)', () => {
  it('todo ícone do catálogo existe na família de desenhos', () => {
    const faltando = Object.entries(CATALOGO_DE_ICONES).filter(([, glifo]) => !(glifo in glifos));
    expect(faltando).toEqual([]);
  });

  it('tem ícone próprio para os tipos de veículo iniciais e para as categorias de sistema', () => {
    for (const nome of ['carro', 'moto', 'suv', 'picape', 'van', 'veiculo', 'servicos', 'produtos', 'mao-de-obra', 'reembolso']) {
      expect(CATALOGO_DE_ICONES).toHaveProperty(nome);
    }
  });

  it('o padrão do banco para veículo novo (tipo_veiculo.icone = "veiculo") existe', () => {
    expect(glifoDoIcone('veiculo')).toBe(CATALOGO_DE_ICONES.veiculo);
  });

  it('nome desconhecido (app desatualizado) cai num ícone genérico em vez de quebrar', () => {
    expect(glifoDoIcone('icone-que-nao-existe')).toBe(CATALOGO_DE_ICONES.outros);
  });
});
