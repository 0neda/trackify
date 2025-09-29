import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://*.vercel.app',
    ],
    credentials: true,
  });

  const port = parseInt(process.env.PORT) || 3000;
  await app.listen(port);
}

bootstrap();
