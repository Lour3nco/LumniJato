import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'kysely';
import { CONEXAO_BANCO, type ConexaoBanco } from '../infraestrutura/banco/conexao';

export interface EstadoDeSaude {
  status: 'ok';
  banco: 'ok' | 'indisponivel';
}

/**
 * Rota de saúde, sem token (CA-01.12.1): a hospedagem usa para saber se a API está de pé.
 * Responde 200 mesmo com o banco fora, informando o estado da conexão [nome da rota: SUPOSIÇÃO].
 */
@Controller('saude')
export class SaudeController {
  constructor(@Inject(CONEXAO_BANCO) private readonly conexao: ConexaoBanco) {}

  @Get()
  async verificar(): Promise<EstadoDeSaude> {
    try {
      await sql`select 1`.execute(this.conexao);
      return { status: 'ok', banco: 'ok' };
    } catch {
      return { status: 'ok', banco: 'indisponivel' };
    }
  }
}
