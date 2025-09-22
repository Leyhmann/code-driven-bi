import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { conditionalCsrfProtection } from './auth/protection/csrf.middleware.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.use(conditionalCsrfProtection);

  if (process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle(process.env.SWAGGER_TITLE || 'API Title')
      .setDescription(process.env.SWAGGER_DESCRIPTION || 'API description')
      .setVersion('0.01')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
  }

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
