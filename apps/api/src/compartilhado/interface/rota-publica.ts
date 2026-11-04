import { SetMetadata } from '@nestjs/common';

export const CHAVE_ROTA_PUBLICA = 'lavajato:rota-publica';

/**
 * Marca uma rota que responde SEM token (ex.: /saude). Todas as outras exigem o JWT do Supabase
 * Auth, validado pela guarda global do módulo Identidade e Acesso (CA-01.13.1).
 */
export const RotaPublica = (): MethodDecorator & ClassDecorator => SetMetadata(CHAVE_ROTA_PUBLICA, true);
