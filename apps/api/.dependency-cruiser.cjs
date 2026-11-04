/**
 * Fronteiras do monólito modular (03-arquitetura §9.1): um módulo nunca importa
 * o domínio nem a infraestrutura de outro. Entre módulos, só vale a interface
 * pública: o arquivo `<modulo>.module.ts` e a pasta `publico/` do módulo.
 * Dentro do módulo, as dependências apontam para dentro (interface → aplicação → domínio).
 */
module.exports = {
  forbidden: [
    {
      name: 'fronteira-entre-modulos',
      comment:
        'Um módulo só usa outro pela interface pública (<modulo>.module.ts ou publico/) ou por eventos de domínio.',
      severity: 'error',
      from: { path: '^src/modulos/([^/]+)/' },
      to: {
        path: '^src/modulos/([^/]+)/',
        pathNot: [
          '^src/modulos/$1/',
          '^src/modulos/[^/]+/[^/]+[.]module[.]ts$',
          '^src/modulos/[^/]+/publico/',
        ],
      },
    },
    {
      name: 'dominio-puro',
      comment:
        'O domínio é TypeScript puro: só importa o próprio dominio/, o kernel src/compartilhado/ e ' +
        '@lavajato/dominio-compartilhado. Nada de NestJS, banco (pg, drizzle), validação (zod), HTTP ' +
        'nem as outras camadas.',
      severity: 'error',
      // Testes do domínio podem importar o vitest.
      from: { path: '^src/modulos/([^/]+)/dominio/', pathNot: '[.]test[.]ts$' },
      to: {
        pathNot: [
          '^src/modulos/$1/dominio/',
          '^src/compartilhado/',
          // Resolve para node_modules/@lavajato/dominio-compartilhado ou para packages/dominio-compartilhado.
          '(^|/)(@lavajato/)?dominio-compartilhado/',
        ],
      },
    },
    {
      name: 'aplicacao-nao-conhece-infra-nem-interface',
      comment: 'A aplicação declara portas; a infraestrutura e a interface é que dependem dela.',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/aplicacao/' },
      to: { path: '^src/modulos/[^/]+/(infraestrutura|interface)/' },
    },
    {
      name: 'infraestrutura-nao-conhece-interface',
      comment: 'Adaptadores de banco e serviços externos não dependem de controllers nem de DTOs HTTP.',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/infraestrutura/' },
      to: { path: '^src/modulos/[^/]+/interface/' },
    },
    {
      name: 'compartilhado-nao-conhece-modulos',
      comment: 'O kernel compartilhado é usado pelos módulos e nunca depende deles.',
      severity: 'error',
      from: { path: '^src/compartilhado/' },
      to: { path: '^src/modulos/' },
    },
    {
      name: 'sem-ciclos',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
  },
};
