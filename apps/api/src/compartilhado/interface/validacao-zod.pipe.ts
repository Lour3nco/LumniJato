import { Injectable, type PipeTransform } from '@nestjs/common';
import type { z } from 'zod';
import { ErroDeValidacao } from '../dominio/erros';

/**
 * Valida a entrada com um esquema zod antes de chegar ao controlador (CA-01.12.2).
 * Fora do esquema → `ErroDeValidacao` com o campo e o motivo, e nada é gravado.
 *
 * Uso: `@Body(new ValidacaoZod(meuEsquema)) corpo: z.infer<typeof meuEsquema>`
 */
@Injectable()
export class ValidacaoZod<T extends z.ZodType> implements PipeTransform<unknown, z.infer<T>> {
  constructor(private readonly esquema: T) {}

  transform(valor: unknown): z.infer<T> {
    const resultado = this.esquema.safeParse(valor);
    if (resultado.success) return resultado.data;
    throw new ErroDeValidacao(
      resultado.error.issues.map((problema) => ({
        campo: problema.path.join('.') || '(corpo)',
        motivo: problema.message,
      })),
    );
  }
}
