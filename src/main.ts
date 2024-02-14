import helmet from 'helmet';
import * as nocache from 'nocache';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,
  });

  const configService = app.get<ConfigService>(ConfigService);

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.use(nocache());

  app.enableCors({
    origin: configService.get<string>('CLIENT_ORIGIN_URL'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    maxAge: 86400,
  });

  app.use(
    helmet({
      hsts: { maxAge: 31536000 },
      frameguard: { action: 'deny' },
      contentSecurityPolicy: {
        directives: {
          'default-src': ["'self'"],
          'frame-ancestors': ["'none'"],
        },
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('vResume API')
    .setVersion('0.1.0')
    .setDescription(
      'Client Guest Credentials [guest@vresume.dev, Cookies123$b]',
    )
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup(`api`, app, document, customOptions);
  fs.writeFileSync('./api-spec.json', JSON.stringify(document));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(configService.get<string>('PORT'));
}

bootstrap();
