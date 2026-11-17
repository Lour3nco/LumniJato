import { criarArmazenamentoCifrado } from '../sessao/armazenamento-cifrado';

function memoria() {
  const dados = new Map<string, string>();
  return {
    dados,
    getItem: async (k: string) => dados.get(k) ?? null,
    setItem: async (k: string, v: string) => void dados.set(k, v),
    removeItem: async (k: string) => void dados.delete(k),
    getItemAsync: async (k: string) => dados.get(k) ?? null,
    setItemAsync: async (k: string, v: string) => void dados.set(k, v),
    deleteItemAsync: async (k: string) => void dados.delete(k),
  };
}

const SESSAO = JSON.stringify({ access_token: 'eyJ-token-de-acesso', refresh_token: 'token-de-renovacao', user: { email: 'dono@exemplo.com' } });

describe('sessão guardada cifrada (padrão LargeSecureStore)', () => {
  function criar() {
    const cofre = memoria();
    const armazenamento = memoria();
    const cifrado = criarArmazenamentoCifrado({
      cofre,
      armazenamento,
      bytesAleatorios: (n) => globalThis.crypto.getRandomValues(new Uint8Array(n)),
    });
    return { cofre, armazenamento, cifrado };
  }

  it('grava e lê de volta o mesmo texto', async () => {
    const { cifrado } = criar();
    await cifrado.setItem('sb-projeto-auth-token', SESSAO);
    expect(await cifrado.getItem('sb-projeto-auth-token')).toBe(SESSAO);
  });

  it('o AsyncStorage só tem texto cifrado: nenhum token aparece', async () => {
    const { cifrado, armazenamento } = criar();
    await cifrado.setItem('sb-projeto-auth-token', SESSAO);
    const guardado = armazenamento.dados.get('sb-projeto-auth-token')!;
    expect(guardado).not.toContain('token');
    expect(guardado).not.toContain('dono@exemplo.com');
    expect(guardado).toMatch(/^[0-9a-f]+$/);
  });

  it('sem a chave do cofre não dá para ler; remover apaga os dois', async () => {
    const { cifrado, cofre, armazenamento } = criar();
    await cifrado.setItem('sb-projeto-auth-token', SESSAO);
    expect([...cofre.dados.keys()]).toEqual(['cifra.sb-projeto-auth-token']);
    cofre.dados.clear();
    expect(await cifrado.getItem('sb-projeto-auth-token')).toBeNull();

    await cifrado.setItem('sb-projeto-auth-token', SESSAO);
    await cifrado.removeItem('sb-projeto-auth-token');
    expect(armazenamento.dados.size).toBe(0);
    expect(cofre.dados.size).toBe(0);
  });

  it('cada gravação usa uma chave nova', async () => {
    const { cifrado, cofre, armazenamento } = criar();
    await cifrado.setItem('k', SESSAO);
    const [chave1, dado1] = [cofre.dados.get('cifra.k'), armazenamento.dados.get('k')];
    await cifrado.setItem('k', SESSAO);
    expect(cofre.dados.get('cifra.k')).not.toBe(chave1);
    expect(armazenamento.dados.get('k')).not.toBe(dado1);
  });
});
