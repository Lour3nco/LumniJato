// Exemplo PERMITIDO: domínio usando o próprio domínio, o kernel compartilhado e @lavajato/dominio-compartilhado.
import { normalizarNome } from '@lavajato/dominio-compartilhado';
import { valorDoKernel } from '../../../compartilhado/kernel';
import { outraRegra } from './outra-regra';

export const usaPermitidos = [normalizarNome, valorDoKernel, outraRegra];
