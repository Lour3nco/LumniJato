import { Controller, Get } from '@nestjs/common';

/** Rota de saúde, usada pela hospedagem para saber se a API está de pé. */
@Controller('saude')
export class SaudeController {
  @Get()
  verificar(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
