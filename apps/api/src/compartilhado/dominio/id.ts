import { PADRAO_UUID_V7, gerarUuidV7 } from '@lavajato/dominio-compartilhado';
import { ErroDeDominio } from './erros';

const PADRAO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/**
 * Identificador de entidade: UUID, gerado no aparelho ou no servidor como v7, ordenável pelo
 * tempo (03-arquitetura §3.1 e §4.1). O gerador é o mesmo do app (pacote compartilhado).
 */
export class Id {
  private constructor(readonly valor: string) {}

  static gerar(): Id {
    return new Id(gerarUuidV7());
  }

  /** Aceita qualquer UUID válido vindo de fora (o aparelho pode ter gerado). */
  static de(valor: string): Id {
    const normalizado = valor.toLowerCase();
    if (!PADRAO_UUID.test(normalizado)) {
      throw new ErroDeDominio('id_invalido', 'Identificador inválido.');
    }
    return new Id(normalizado);
  }

  ehV7(): boolean {
    return PADRAO_UUID_V7.test(this.valor);
  }

  igual(outro: Id): boolean {
    return this.valor === outro.valor;
  }

  toString(): string {
    return this.valor;
  }
}
