import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { configureCors } from './cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureCors(app);


  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 5170;

  await app.listen(port);
}

bootstrap();
