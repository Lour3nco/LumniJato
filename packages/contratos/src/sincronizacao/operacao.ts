import { z } from 'zod';

/**
 * Uma operação da fila de envio do aparelho, no formato que chega a
 * `POST /sync/upload` (03-arquitetura §2.2).
 *
 * [SUPOSIÇÃO] Versão inicial, no formato da fila do PowerSync (PUT = criar ou
 * substituir, PATCH = alterar campos, DELETE = apagar). O contrato definitivo,
 * com o resultado por operação, é fechado no módulo Sincronização (FIN-US-07.11).
 */
export const operacaoSincronizacaoSchema = z.object({
  op: z.enum(['PUT', 'PATCH', 'DELETE']),
  tabela: z.string().min(1),
  id: z.uuid(),
  dados: z.record(z.string(), z.unknown()).optional(),
});

export const loteSincronizacaoSchema = z.object({
  operacoes: z.array(operacaoSincronizacaoSchema).min(1),
});

export type OperacaoSincronizacao = z.infer<typeof operacaoSincronizacaoSchema>;
export type LoteSincronizacao = z.infer<typeof loteSincronizacaoSchema>;
