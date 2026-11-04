import { Module } from '@nestjs/common';

/**
 * Finanças: lançamentos, lixeira, histórico, categorias, tipos de serviço e de veículo,
 * formas de pagamento e preferências (03-arquitetura §9.2).
 *
 * Camadas (03-arquitetura §9.3), de fora para dentro:
 * - interface/       controladores HTTP e manipuladores de sincronização
 * - infraestrutura/  repositórios Postgres, gravador de histórico, eventos
 * - aplicacao/       casos de uso e consultas
 * - dominio/         agregados, objetos de valor, eventos e regras (TypeScript puro)
 */
@Module({})
export class FinancasModule {}
