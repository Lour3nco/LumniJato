import { Module } from '@nestjs/common';

/**
 * Identidade e Acesso: organização, unidades, usuários, vínculo usuário × unidade × papel,
 * validação do JWT do Supabase Auth e política `temPapel` (03-arquitetura §9.2).
 * Para os outros módulos, exporta só a interface pública. Implementação na FIN-US-01.13.
 */
@Module({})
export class IdentidadeAcessoModule {}
