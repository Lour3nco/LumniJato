import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function iniciar(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const porta = Number(process.env.PORTA ?? 3000);
  await app.listen(porta);
}

void iniciar();
