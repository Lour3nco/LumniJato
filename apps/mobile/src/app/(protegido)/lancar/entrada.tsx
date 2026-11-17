import { useRouter } from 'expo-router';

import { TelaDeLancamento } from '../../../telas/TelaDeLancamento';

/**
 * Sem `aoSalvar`: a gravação (banco local e fila, FIN-US-07.1; campos, FIN-US-02.2 a 02.5)
 * ainda não existe, e a tela avisa claramente que NÃO grava.
 */
export default function Lancar() {
  const router = useRouter();
  return <TelaDeLancamento tipo="entrada" aoFechar={() => router.back()} />;
}
