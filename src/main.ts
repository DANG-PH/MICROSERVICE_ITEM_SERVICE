import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { ITEM_PACKAGE_NAME } from 'proto/item.pb';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: ITEM_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'proto/item.proto'), 
      url: process.env.ITEM_URL, 
      loader: {
        keepCase: true,
        objects: true,
        arrays: true,
      },
    },
  });

  await app.startAllMicroservices();
  logger.log(`✅ gRPC server running on ${process.env.ITEM_URL}`);

  await app.listen(Number(process.env.PORT));
  logger.log(`✅ HTTP server running on ${process.env.PORT}`);
}

bootstrap();
