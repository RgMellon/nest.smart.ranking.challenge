import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://renan:naner994@18.217.224.224:5672/smartranking'],
      noAck: false,
      queue: 'challenges',
    },
  });

  await app.listen();
}
bootstrap();
