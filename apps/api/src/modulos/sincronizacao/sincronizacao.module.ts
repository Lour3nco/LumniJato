import { Module } from '@nestjs/common';

/**
 * Sincronização: endpoints `/sync/*`. Traduz cada operação vinda do aparelho no caso de uso
 * do módulo dono da tabela e não tem regra de negócio própria. Implementação na FIN-US-07.11.
 */
@Module({})
export class SincronizacaoModule {}
