import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const serviceType = process.env.SERVICE_TYPE || 'HTTP';

  if (serviceType === 'HTTP') {
    // --- Report Service ---
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: { brokers: ['kafka:9092'] },
        consumer: { groupId: 'report-api-group' },
      },
    });

    await app.startAllMicroservices();
    await app.listen(3001);
    logger.log('REPORT SERVICE is listening on port 3001');
  } else {
    // --- Kafka Consumers ---
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['kafka:9092'],
            clientId: `${serviceType.toLowerCase()}-client`,
            retry: {
              initialRetryTime: 3000,
              retries: 10,
            },
          },
          consumer: {
            groupId: `${serviceType.toLowerCase()}-group`,
          },
          subscribe: {
            fromBeginning: true,
          },
        },
      },
    );

    await app.listen();
    logger.log(`${serviceType} SERVICE is listening for Kafka events`);
  }
}
bootstrap();
