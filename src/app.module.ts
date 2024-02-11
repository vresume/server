import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { ModulesModule } from '~/modules/modules.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '~/all-exceptions.filter';

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test', 'provision')
          .default('development'),
        PORT: Joi.number().default(6060),
        ISSUER_BASE_URL: Joi.string().required(),
        AUDIENCE: Joi.string().required(),
        CLIENT_ORIGIN_URL: Joi.string().required(),
        OPENAI_API_KEY: Joi.string().required(),
        OPENAI_DEFAULT_MODEL: Joi.string().default('gpt-3.5-turbo-16k-0613'),
        OPENAI_DEFAULT_MAX_TOKENS: Joi.number().default(4096),
        RESEND_API_KEY: Joi.string().required(),
        SCRAPERAPI_KEY: Joi.string().required(),
      }),
    }),
    ModulesModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
