/**
 * Interface pública do módulo Identidade e Acesso: o que os outros módulos podem usar
 * (03-arquitetura §9.1). Nada além disto deve ser importado de fora do módulo.
 */
export { UsuarioAutenticado, PAPEIS, type Papel, type Vinculo } from '../dominio/usuario-autenticado';
export { UsuarioAtual } from '../interface/usuario-atual.decorator';
export { RegistrarDispositivo } from '../aplicacao/registrar-dispositivo';
