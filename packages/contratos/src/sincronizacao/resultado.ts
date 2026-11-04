import { z } from 'zod';

/**
 * Resposta de `POST /sync/upload`: o resultado de CADA operação do lote (03-arquitetura §2.2
 * passo 4 e §4.6). [SUPOSIÇÃO] Proposta para a prova de conceito (FIN-US-07.10); o contrato
 * final é fechado no módulo Sincronização (FIN-US-07.11).
 *
 * - `aceita`: gravada (ou repetição já gravada, §4.1) — sai da fila.
 * - `recusada`: regra de domínio (422) ou permissão (403) — fica marcada como erro no aparelho,
 *   nunca é descartada sozinha (§4.6).
 */
export const resultadoOperacaoSchema = z.discriminatedUnion('situacao', [
  z.object({ id: z.uuid(), situacao: z.literal('aceita') }),
  z.object({
    id: z.uuid(),
    situacao: z.literal('recusada'),
    motivo: z.enum(['dados', 'permissao']),
    codigo: z.string().min(1),
    mensagem: z.string().min(1),
  }),
]);

export const resultadoLoteSchema = z.object({
  resultados: z.array(resultadoOperacaoSchema),
});

export type ResultadoOperacao = z.infer<typeof resultadoOperacaoSchema>;
export type ResultadoLote = z.infer<typeof resultadoLoteSchema>;
