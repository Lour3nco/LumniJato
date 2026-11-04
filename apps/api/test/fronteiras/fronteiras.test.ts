import { createRequire } from 'node:module';
import { join } from 'node:path';
import { cruise, type IViolation } from 'dependency-cruiser';
import { describe, expect, it } from 'vitest';

const exigir = createRequire(__filename);
const regras = exigir('../../.dependency-cruiser.cjs');

/**
 * CA-01.11.3: o lint de fronteiras reprova a importação de algo interno de outro módulo.
 * Roda as mesmas regras do `pnpm lint:fronteiras` sobre um projeto de exemplo em `exemplo/`.
 */
describe('lint de fronteiras entre módulos', () => {
  async function violacoes(): Promise<IViolation[]> {
    const resultado = await cruise(
      ['src'],
      {
        baseDir: join(__dirname, 'exemplo'),
        validate: true,
        ruleSet: { forbidden: regras.forbidden },
        tsPreCompilationDeps: true,
        doNotFollow: { path: 'node_modules' },
      },
      { extensions: ['.ts', '.js'] },
    );
    if (typeof resultado.output === 'string') throw new Error('saída inesperada do dependency-cruiser');
    return resultado.output.summary.violations;
  }

  it('aponta Finanças importando o domínio interno de Identidade e Acesso', async () => {
    expect(await violacoes()).toContainEqual(
      expect.objectContaining({
        rule: expect.objectContaining({ name: 'fronteira-entre-modulos' }),
        from: 'src/modulos/financas/aplicacao/usa-interno.ts',
        to: 'src/modulos/identidade-acesso/dominio/regra-interna.ts',
      }),
    );
  });

  it('aceita o uso da interface pública do outro módulo', async () => {
    const daInterfacePublica = (await violacoes()).filter(
      (v) => v.from === 'src/modulos/financas/aplicacao/usa-publico.ts',
    );
    expect(daInterfacePublica).toEqual([]);
  });

  it('aponta o domínio dependendo do NestJS', async () => {
    expect(await violacoes()).toContainEqual(
      expect.objectContaining({
        rule: expect.objectContaining({ name: 'dominio-puro' }),
        from: 'src/modulos/financas/dominio/depende-do-nest.ts',
      }),
    );
  });

  it('aponta o domínio dependendo de biblioteca externa que não é o kernel (zod)', async () => {
    expect(await violacoes()).toContainEqual(
      expect.objectContaining({
        rule: expect.objectContaining({ name: 'dominio-puro' }),
        from: 'src/modulos/financas/dominio/depende-do-zod.ts',
      }),
    );
  });

  it('aceita o domínio usando o próprio domínio, compartilhado/ e @lavajato/dominio-compartilhado', async () => {
    const doDominioPermitido = (await violacoes()).filter(
      (v) => v.from === 'src/modulos/financas/dominio/usa-permitidos.ts',
    );
    expect(doDominioPermitido).toEqual([]);
  });

  it('aponta a infraestrutura importando a interface', async () => {
    expect(await violacoes()).toContainEqual(
      expect.objectContaining({
        rule: expect.objectContaining({ name: 'infraestrutura-nao-conhece-interface' }),
        from: 'src/modulos/financas/infraestrutura/usa-interface.ts',
        to: 'src/modulos/financas/interface/controlador.ts',
      }),
    );
  });

  it('aponta o kernel compartilhado importando um módulo', async () => {
    expect(await violacoes()).toContainEqual(
      expect.objectContaining({
        rule: expect.objectContaining({ name: 'compartilhado-nao-conhece-modulos' }),
        from: 'src/compartilhado/usa-modulo.ts',
      }),
    );
  });
});
