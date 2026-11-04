import { FUSO_PADRAO, ehDataValida, hojeNoFuso, somarDias } from '@lavajato/dominio-compartilhado';
import { ErroDeDominio } from './erros';

/**
 * Data sem hora ("AAAA-MM-DD"), como `data_lancamento` (03-arquitetura §5.2). "Hoje" é
 * calculado no fuso da unidade, não no do servidor nem em UTC.
 */
export class DataLocal {
  private constructor(readonly valor: string) {}

  static de(valor: string): DataLocal {
    if (!ehDataValida(valor)) {
      throw new ErroDeDominio('data_invalida', 'Data inválida.');
    }
    return new DataLocal(valor);
  }

  static hoje(fuso: string = FUSO_PADRAO, agora: Date = new Date()): DataLocal {
    return new DataLocal(hojeNoFuso(fuso, agora));
  }

  somarDias(dias: number): DataLocal {
    return new DataLocal(somarDias(this.valor, dias));
  }

  // O formato AAAA-MM-DD ordena certo como texto.
  ehDepoisDe(outra: DataLocal): boolean {
    return this.valor > outra.valor;
  }

  ehAntesDe(outra: DataLocal): boolean {
    return this.valor < outra.valor;
  }

  igual(outra: DataLocal): boolean {
    return this.valor === outra.valor;
  }

  toString(): string {
    return this.valor;
  }
}
