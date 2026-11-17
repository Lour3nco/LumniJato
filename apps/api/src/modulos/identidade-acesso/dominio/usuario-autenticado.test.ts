import { describe, expect, it } from 'vitest';
import { ErroDeAutorizacao } from '../../../compartilhado/dominio/erros';
import { UsuarioAutenticado } from './usuario-autenticado';

const usuario = new UsuarioAutenticado('u-a', 'Dono A', 'a@exemplo.com', [
  { unidadeId: 'U1', organizacaoId: 'O1', unidadeNome: 'Centro', papel: 'dono' },
]);

describe('política de acesso (temPapel)', () => {
  it('tem papel dono na própria unidade e não na outra', () => {
    expect(usuario.temPapel('U1', ['dono'])).toBe(true);
    expect(usuario.temPapel('U2', ['dono'])).toBe(false);
    expect(usuario.temPapel('U1', ['gerente'])).toBe(false);
  });

  // CA-01.13.3
  it('exigirPapel recusa com 403 a unidade sem vínculo', () => {
    expect(() => usuario.exigirPapel('U1', ['dono'])).not.toThrow();
    expect(() => usuario.exigirPapel('U2', ['dono'])).toThrow(ErroDeAutorizacao);
  });

  // CA-01.13.5
  it('exigirMesmoAutor recusa autor diferente do token', () => {
    expect(() => usuario.exigirMesmoAutor('u-a')).not.toThrow();
    expect(() => usuario.exigirMesmoAutor('u-b')).toThrow(ErroDeAutorizacao);
  });

  it('papel novo entra como valor novo, sem mudar a regra (RNF-20)', () => {
    const gerente = new UsuarioAutenticado('u-g', 'Gerente', null, [
      { unidadeId: 'U1', organizacaoId: 'O1', unidadeNome: 'Centro', papel: 'gerente' },
    ]);
    expect(gerente.temPapel('U1', ['dono', 'gerente'])).toBe(true);
    expect(gerente.temPapel('U1', ['dono'])).toBe(false);
  });

  it('papel na organização vale para os cadastros comuns', () => {
    expect(usuario.temPapelNaOrganizacao('O1', ['dono'])).toBe(true);
    expect(() => usuario.exigirPapelNaOrganizacao('O2', ['dono'])).toThrow(ErroDeAutorizacao);
  });
});
