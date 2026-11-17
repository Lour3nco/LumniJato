import { Module, type OnModuleInit } from '@nestjs/common';
import { BarramentoDeEventos } from '../../compartilhado/aplicacao/barramento-de-eventos';
import { CadastroDeCategorias } from './aplicacao/cadastros/cadastro-de-categorias';
import { CadastroDeTiposDeServico, CadastroDeTiposDeVeiculo } from './aplicacao/cadastros/cadastro-de-tipos';
import { DefinirNaturezaPadrao } from './aplicacao/cadastros/definir-natureza-padrao';
import { FormasDePagamento } from './aplicacao/cadastros/formas-de-pagamento';
import { RepositorioDeCadastros } from './aplicacao/cadastros/portas';
import { LancamentoRepositorio } from './dominio/lancamento/lancamento-repositorio';
import {
  EVENTOS_COM_HISTORICO,
  type EventoDoLancamento,
  GravadorDeHistoricoPostgres,
} from './infraestrutura/persistencia/gravador-de-historico-postgres';
import { LancamentoRepositorioPostgres } from './infraestrutura/persistencia/lancamento-repositorio-postgres';
import { RepositorioDeCadastrosPostgres } from './infraestrutura/persistencia/repositorio-de-cadastros-postgres';

/**
 * Finanças (03-arquitetura §9.2 e §9.3): lançamentos, histórico, cadastros e preferências.
 *   dominio/        agregados (Lancamento, Categoria, TipoServico, TipoVeiculo…), TypeScript puro
 *   aplicacao/      casos de uso (cadastros; os de lançamento entram na FIN-US-01.15)
 *   infraestrutura/ repositórios Postgres e o gravador de histórico
 *   interface/      manipuladores de sincronização (FIN-US-07.11) e consultas do painel (pós-MVP)
 */
@Module({
  providers: [
    { provide: LancamentoRepositorio, useClass: LancamentoRepositorioPostgres },
    { provide: RepositorioDeCadastros, useClass: RepositorioDeCadastrosPostgres },
    GravadorDeHistoricoPostgres,
    CadastroDeCategorias,
    CadastroDeTiposDeServico,
    CadastroDeTiposDeVeiculo,
    FormasDePagamento,
    DefinirNaturezaPadrao,
  ],
})
export class FinancasModule implements OnModuleInit {
  constructor(
    private readonly barramento: BarramentoDeEventos,
    private readonly gravadorDeHistorico: GravadorDeHistoricoPostgres,
  ) {}

  /** O histórico é gravado "na transação", antes do commit (FIN-US-01.5). */
  onModuleInit(): void {
    for (const nome of EVENTOS_COM_HISTORICO) {
      this.barramento.assinarNaTransacao(nome, (evento) => this.gravadorDeHistorico.gravar(evento as EventoDoLancamento));
    }
  }
}
