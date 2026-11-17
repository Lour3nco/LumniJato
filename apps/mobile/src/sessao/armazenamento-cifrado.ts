import aesjs from 'aes-js';

/**
 * Armazenamento cifrado da sessão do Supabase Auth (sugestão da Arquitetura, passo 5) — padrão
 * "LargeSecureStore" da documentação do Supabase para React Native:
 * - a CHAVE (256 bits, nova a cada gravação) fica no cofre do aparelho (expo-secure-store,
 *   Android Keystore), que tem limite de tamanho por item;
 * - os DADOS (a sessão, que passa desse limite) ficam no AsyncStorage, cifrados com AES-256-CTR.
 * Quem copiar o AsyncStorage sem acesso ao cofre do aparelho não lê os tokens.
 */

/** Parte do expo-secure-store usada aqui. */
export interface CofreDeChaves {
  getItemAsync(chave: string): Promise<string | null>;
  setItemAsync(chave: string, valor: string): Promise<void>;
  deleteItemAsync(chave: string): Promise<void>;
}

/** Parte do AsyncStorage usada aqui. */
export interface ArmazenamentoSimples {
  getItem(chave: string): Promise<string | null>;
  setItem(chave: string, valor: string): Promise<void>;
  removeItem(chave: string): Promise<void>;
}

type Dependencias = {
  cofre: CofreDeChaves;
  armazenamento: ArmazenamentoSimples;
  bytesAleatorios: (quantidade: number) => Uint8Array;
};

/** Nome da chave no cofre (só letras, números, ".", "-" e "_" são aceitos pelo SecureStore). */
function nomeNoCofre(chave: string): string {
  return `cifra.${chave.replace(/[^A-Za-z0-9._-]/g, '_')}`;
}

export function criarArmazenamentoCifrado({ cofre, armazenamento, bytesAleatorios }: Dependencias) {
  return {
    async getItem(chave: string): Promise<string | null> {
      const cifrado = await armazenamento.getItem(chave);
      if (!cifrado) return null;
      const chaveHex = await cofre.getItemAsync(nomeNoCofre(chave));
      if (!chaveHex) return null;
      const ctr = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(chaveHex), new aesjs.Counter(1));
      return aesjs.utils.utf8.fromBytes(ctr.decrypt(aesjs.utils.hex.toBytes(cifrado)));
    },

    async setItem(chave: string, valor: string): Promise<void> {
      const chaveDeCifra = bytesAleatorios(256 / 8);
      const ctr = new aesjs.ModeOfOperation.ctr(chaveDeCifra, new aesjs.Counter(1));
      const cifrado = ctr.encrypt(aesjs.utils.utf8.toBytes(valor));
      await cofre.setItemAsync(nomeNoCofre(chave), aesjs.utils.hex.fromBytes(chaveDeCifra));
      await armazenamento.setItem(chave, aesjs.utils.hex.fromBytes(cifrado));
    },

    async removeItem(chave: string): Promise<void> {
      await armazenamento.removeItem(chave);
      await cofre.deleteItemAsync(nomeNoCofre(chave));
    },
  };
}
