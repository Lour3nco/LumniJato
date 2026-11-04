import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CompartilhadoModule } from './compartilhado/compartilhado.module';
import { FiltroDeErros } from './compartilhado/interface/filtro-de-erros';
import { FinancasModule } from './modulos/financas/financas.module';
import { IdentidadeAcessoModule } from './modulos/identidade-acesso/identidade-acesso.module';
import { SincronizacaoModule } from './modulos/sincronizacao/sincronizacao.module';

/** Monólito modular: um processo, um módulo NestJS por área do negócio (03-arquitetura §9.2). */
@Module({
  imports: [CompartilhadoModule, IdentidadeAcessoModule, FinancasModule, SincronizacaoModule],
  providers: [{ provide: APP_FILTER, useClass: FiltroDeErros }],
})
export class AppModule {}
