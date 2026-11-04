import LayoutAbas from '../../app/(protegido)/(abas)/_layout';
import Extrato from '../../app/(protegido)/(abas)/extrato';
import Inicio from '../../app/(protegido)/(abas)/index';
import Mais from '../../app/(protegido)/(abas)/mais';
import Resumo from '../../app/(protegido)/(abas)/resumo';
import LayoutProtegido from '../../app/(protegido)/_layout';
import Categorias from '../../app/(protegido)/ajustes/categorias';
import Lixeira from '../../app/(protegido)/ajustes/lixeira';
import Sincronizacao from '../../app/(protegido)/ajustes/sincronizacao';
import Sobre from '../../app/(protegido)/ajustes/sobre';
import TiposDeServico from '../../app/(protegido)/ajustes/tipos-de-servico';
import TiposDeVeiculo from '../../app/(protegido)/ajustes/tipos-de-veiculo';
import LancarEntrada from '../../app/(protegido)/lancar/entrada';
import LancarSaida from '../../app/(protegido)/lancar/saida';
import LancarServico from '../../app/(protegido)/lancar/servico';
import LayoutRaiz from '../../app/_layout';
import TelaEntrar from '../../app/entrar';

/** Todas as rotas do app, no formato do `renderRouter` (espelha a pasta src/app). */
export const ROTAS_DO_APP = {
  _layout: LayoutRaiz,
  entrar: TelaEntrar,
  '(protegido)/_layout': LayoutProtegido,
  '(protegido)/(abas)/_layout': LayoutAbas,
  '(protegido)/(abas)/index': Inicio,
  '(protegido)/(abas)/extrato': Extrato,
  '(protegido)/(abas)/resumo': Resumo,
  '(protegido)/(abas)/mais': Mais,
  '(protegido)/lancar/servico': LancarServico,
  '(protegido)/lancar/entrada': LancarEntrada,
  '(protegido)/lancar/saida': LancarSaida,
  '(protegido)/ajustes/categorias': Categorias,
  '(protegido)/ajustes/tipos-de-servico': TiposDeServico,
  '(protegido)/ajustes/tipos-de-veiculo': TiposDeVeiculo,
  '(protegido)/ajustes/lixeira': Lixeira,
  '(protegido)/ajustes/sincronizacao': Sincronizacao,
  '(protegido)/ajustes/sobre': Sobre,
};
