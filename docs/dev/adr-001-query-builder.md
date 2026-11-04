# ADR-001 · Query builder da API: Kysely

- **Data:** 04/11/2026 · **Status:** aceita · **História:** FIN-US-01.12
- **Contexto:** o 04-backlog deixou "Drizzle ou Kysely" como [SUPOSIÇÃO] para os repositórios Postgres da API (03-arquitetura §9.3).

## Decisão

Usar o **Kysely** (com o driver `pg`).

## Por quê

1. As migrações já são SQL do Supabase (`infra/supabase/migrations`, RNF-27). O Kysely só monta e tipa consultas, sem um segundo esquema nem uma segunda ferramenta de migração; o Drizzle pede o esquema declarado em TypeScript e tende a gerar as próprias migrações, duplicando a fonte da verdade.
2. Ele combina com o monólito modular: o kernel guarda uma conexão sem tabelas, e cada módulo declara só as suas (`conexao.withTables<...>()`), sem um tipo global que deixaria um módulo ler a tabela de outro.

## Consequências

- Os tipos das tabelas de cada módulo ficam junto da infraestrutura do módulo e precisam acompanhar as migrações (pode-se gerar com `kysely-codegen` mais tarde).
- Nos testes, o Kysely roda sobre o Postgres em memória (PGlite) sem Docker (`apps/api/test/apoio/conexao-pglite.ts`).
