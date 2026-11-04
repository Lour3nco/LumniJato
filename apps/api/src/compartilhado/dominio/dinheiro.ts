import { formatarReais } from '@lavajato/dominio-compartilhado';
import { ErroDeDominio } from './erros';

/**
 * Valor em centavos inteiros (03-arquitetura §5.1). Nunca usa número com vírgula, então
 * somas não perdem centavos. Pode ser negativo (ex.: saldo); a regra "lançamento > 0" é do
 * agregado `Lancamento`, não daqui.
 */
export class Dinheiro {
  private constructor(readonly centavos: number) {}

  static readonly ZERO = new Dinheiro(0);

  static deCentavos(centavos: number): Dinheiro {
    if (!Number.isSafeInteger(centavos)) {
      throw new ErroDeDominio('valor_invalido', 'O valor precisa ser em centavos inteiros.');
    }
    return new Dinheiro(centavos);
  }

  somar(outro: Dinheiro): Dinheiro {
    return Dinheiro.deCentavos(this.centavos + outro.centavos);
  }

  subtrair(outro: Dinheiro): Dinheiro {
    return Dinheiro.deCentavos(this.centavos - outro.centavos);
  }

  static somarTodos(valores: Iterable<Dinheiro>): Dinheiro {
    let total = Dinheiro.ZERO;
    for (const valor of valores) total = total.somar(valor);
    return total;
  }

  ehPositivo(): boolean {
    return this.centavos > 0;
  }

  maiorQue(outro: Dinheiro): boolean {
    return this.centavos > outro.centavos;
  }

  igual(outro: Dinheiro): boolean {
    return this.centavos === outro.centavos;
  }

  /** "R$ 1.234,56" */
  toString(): string {
    return formatarReais(this.centavos);
  }
}
