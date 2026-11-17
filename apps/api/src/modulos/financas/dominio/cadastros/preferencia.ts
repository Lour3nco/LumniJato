import { ErroDeDominio } from '../../../../compartilhado/dominio/erros';

export type Natureza = 'empresa' | 'pessoal';

/** Padrão Pessoal/Empresa do usuário (preferencia_usuario, SUP-D11: começa em "empresa"). */
export function conferirNatureza(valor: unknown): Natureza {
  if (valor !== 'empresa' && valor !== 'pessoal') {
    throw new ErroDeDominio('natureza_invalida', 'Escolha Empresa ou Pessoal.');
  }
  return valor;
}
