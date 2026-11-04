import { useRouter } from 'expo-router';

import { TelaDeLancamento } from '../../../telas/TelaDeLancamento';

/**
 * [PROVISÓRIO] Salvar ainda não grava: o banco local e a fila de envio entram com a
 * FIN-US-07.1 (PowerSync) e os campos do formulário com as FIN-US-02.2 a 02.5. Por ora, só
 * volta para a Início.
 */
export default function Lancar() {
  const router = useRouter();
  return <TelaDeLancamento tipo="servico" aoSalvar={() => router.back()} aoFechar={() => router.back()} />;
}
