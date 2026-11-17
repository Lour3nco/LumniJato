import type { Papel } from '../dominio/usuario-autenticado';

/** Valida o JWT do Supabase Auth e devolve o id do usuário (`sub`). Lança ErroDeAutenticacao. */
export abstract class VerificadorDeToken {
  abstract verificar(token: string): Promise<{ usuarioId: string }>;
}

export interface PerfilComVinculos {
  id: string;
  nome: string;
  email: string | null;
  ativo: boolean;
  /** Só vínculos ativos de unidades ativas. */
  vinculos: { unidadeId: string; organizacaoId: string; unidadeNome: string; papel: Papel }[];
}

export interface RegistroDeDispositivo {
  id: string;
  usuarioId: string;
  nome: string | null;
}

/** Leitura e gravação das tabelas do schema `identidade`. */
export abstract class RepositorioDeIdentidade {
  abstract carregarPerfil(usuarioId: string): Promise<PerfilComVinculos | null>;
  abstract buscarDispositivo(id: string): Promise<RegistroDeDispositivo | null>;
  /** Insere se não existir (concorrência: dois envios ao mesmo tempo não duplicam). */
  abstract inserirDispositivoSeNaoExistir(dispositivo: RegistroDeDispositivo): Promise<void>;
  abstract marcarSincronizacao(dispositivoId: string, quando: Date): Promise<void>;
}
