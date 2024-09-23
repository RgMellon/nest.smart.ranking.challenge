import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { formatInTimeZone } from 'date-fns-tz';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://renan:naner994@18.217.224.224:5672/smartranking'],
      noAck: false,
      queue: 'challenges',
    },
  });

  Date.prototype.toJSON = function (): any {
    const timeZone = 'America/Sao_Paulo';
    return formatInTimeZone(this, timeZone, 'yyyy-MM-dd HH:mm:ss.SSS');
  };

  await app.listen();
}
bootstrap();
