import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CONFIGURACAO } from '../../compartilhado/compartilhado.module';
import type { Configuracao } from '../../compartilhado/infraestrutura/configuracao/configuracao';
import { AutenticarRequisicao } from './aplicacao/autenticar-requisicao';
import { RepositorioDeIdentidade, VerificadorDeToken } from './aplicacao/portas';
import { RegistrarDispositivo } from './aplicacao/registrar-dispositivo';
import { RepositorioIdentidadePostgres } from './infraestrutura/repositorio-identidade-postgres';
import { VerificadorJwtSupabase } from './infraestrutura/verificador-jwt-supabase';
import { GuardaDeAutenticacao } from './interface/guarda-de-autenticacao';
import { IdentidadeController } from './interface/identidade.controller';

/**
 * Identidade e Acesso (03-arquitetura §9.2, FIN-US-01.13): valida o JWT do Supabase Auth em
 * toda chamada (guarda global), carrega o usuário e os vínculos ativos e decide por papel
 * (`temPapel`). Para os outros módulos, só a interface pública (`publico/`).
 */
@Module({
  controllers: [IdentidadeController],
  providers: [
    {
      provide: VerificadorDeToken,
      inject: [CONFIGURACAO],
      useFactory: (configuracao: Configuracao) => new VerificadorJwtSupabase(configuracao.SUPABASE_URL),
    },
    { provide: RepositorioDeIdentidade, useClass: RepositorioIdentidadePostgres },
    AutenticarRequisicao,
    RegistrarDispositivo,
    { provide: APP_GUARD, useClass: GuardaDeAutenticacao },
  ],
  exports: [RegistrarDispositivo],
})
export class IdentidadeAcessoModule {}
