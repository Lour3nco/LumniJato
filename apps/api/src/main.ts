import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ErroDeConfiguracao,
  carregarConfiguracao,
} from './compartilhado/infraestrutura/configuracao/configuracao';

/** Lê o apps/api/.env, se existir (na hospedagem as variáveis vêm do próprio ambiente). */
function lerArquivoEnv(): void {
  try {
    process.loadEnvFile('.env');
  } catch {
    // sem .env: segue com as variáveis do ambiente
  }
}

async function iniciar(): Promise<void> {
  lerArquivoEnv();
  // Confere as variáveis antes de tudo: se faltar alguma, a API não sobe (CA-01.12.5).
  let porta: number;
  try {
    porta = carregarConfiguracao().PORTA;
  } catch (erro) {
    if (erro instanceof ErroDeConfiguracao) {
      console.error(`${erro.message}\nCopie apps/api/.env.example para apps/api/.env e preencha.`);
      process.exit(1);
    }
    throw erro;
  }
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.listen(porta);
}

void iniciar();
