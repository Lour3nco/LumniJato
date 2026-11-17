import { normalizarNome } from '@lavajato/dominio-compartilhado';
import { ErroDeDominio } from '../../../../compartilhado/dominio/erros';

/** Tamanho máximo de nome de categoria, serviço ou veículo [SUPOSIÇÃO]. */
export const NOME_MAXIMO = 60;

/**
 * Nome de cadastro com a chave de comparação (F-16): maiúsculas, acentos e espaços nas pontas
 * não contam ("água" = "Água" = "Agua" = " agua "). A chave é a mesma da coluna `nome_chave`
 * do banco e do aviso offline do app (pacote compartilhado, CA-01.17.2).
 */
export class NomeNormalizado {
  private constructor(
    /** Como o dono escreveu, sem espaços nas pontas. */
    readonly nome: string,
    /** Chave de comparação: lower(f_unaccent(btrim(nome))). */
    readonly chave: string,
  ) {}

  static de(texto: string): NomeNormalizado {
    const nome = (texto ?? '').replace(/^ +| +$/g, '');
    if (nome === '') throw new ErroDeDominio('nome_obrigatorio', 'Escreva um nome.');
    if (nome.length > NOME_MAXIMO) {
      throw new ErroDeDominio('nome_longo', `O nome pode ter até ${NOME_MAXIMO} letras.`);
    }
    return new NomeNormalizado(nome, normalizarNome(nome));
  }

  mesmaChave(outro: NomeNormalizado): boolean {
    return this.chave === outro.chave;
  }
}
