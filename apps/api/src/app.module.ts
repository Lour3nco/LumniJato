import { Module } from '@nestjs/common';
import { SaudeController } from './compartilhado/saude.controller';
import { FinancasModule } from './modulos/financas/financas.module';
import { IdentidadeAcessoModule } from './modulos/identidade-acesso/identidade-acesso.module';
import { SincronizacaoModule } from './modulos/sincronizacao/sincronizacao.module';

/** Monólito modular: um processo, um módulo NestJS por área do negócio (03-arquitetura §9.2). */
@Module({
  imports: [IdentidadeAcessoModule, FinancasModule, SincronizacaoModule],
  controllers: [SaudeController],
})
export class AppModule {}
