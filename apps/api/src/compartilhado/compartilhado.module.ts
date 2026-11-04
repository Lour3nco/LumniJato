import { Global, Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { BarramentoDeEventos } from './aplicacao/barramento-de-eventos';
import { UnidadeDeTrabalho } from './aplicacao/unidade-de-trabalho';
import { CONEXAO_BANCO, type ConexaoBanco, criarConexao } from './infraestrutura/banco/conexao';
import { UnidadeDeTrabalhoPostgres } from './infraestrutura/banco/unidade-de-trabalho-postgres';
import { type Configuracao, carregarConfiguracao } from './infraestrutura/configuracao/configuracao';
import { BarramentoEmMemoria } from './infraestrutura/eventos/barramento-em-memoria';
import { SaudeController } from './interface/saude.controller';

export const CONFIGURACAO = Symbol('CONFIGURACAO');

/**
 * Kernel compartilhado (03-arquitetura §9.2): configuração, conexão com o banco, unidade de
 * trabalho e barramento de eventos, disponíveis para todos os módulos. Sem regra de negócio.
 */
@Global()
@Module({
  controllers: [SaudeController],
  providers: [
    { provide: CONFIGURACAO, useFactory: (): Configuracao => carregarConfiguracao() },
    {
      provide: CONEXAO_BANCO,
      inject: [CONFIGURACAO],
      useFactory: (configuracao: Configuracao): ConexaoBanco => criarConexao(configuracao.DATABASE_URL),
    },
    BarramentoEmMemoria,
    { provide: BarramentoDeEventos, useExisting: BarramentoEmMemoria },
    UnidadeDeTrabalhoPostgres,
    { provide: UnidadeDeTrabalho, useExisting: UnidadeDeTrabalhoPostgres },
  ],
  exports: [CONFIGURACAO, CONEXAO_BANCO, BarramentoDeEventos, UnidadeDeTrabalho, UnidadeDeTrabalhoPostgres],
})
export class CompartilhadoModule implements OnApplicationShutdown {
  constructor(@Inject(CONEXAO_BANCO) private readonly conexao: ConexaoBanco) {}

  async onApplicationShutdown(): Promise<void> {
    await this.conexao.destroy();
  }
}
