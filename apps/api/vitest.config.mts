import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// O NestJS depende dos metadados de decorators (emitDecoratorMetadata), que o
// esbuild do Vitest não gera; por isso os testes compilam com o SWC.
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    // Os testes de integração sobem um Postgres em memória (PGlite) e a API inteira; com todos
    // os pacotes rodando juntos no turbo, 5 s não bastam.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
