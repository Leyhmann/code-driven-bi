import { Module } from '@nestjs/common';
import { PostgresDialect } from 'kysely';
import { ConfigModule } from '@nestjs/config';
import pg from 'pg-pool';
import { KyselyModule } from 'nestjs-kysely';
import * as process from 'node:process';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DEFAULT_NAMESPACE } from './constants/database.js';
import { databaseConfig } from './config/database.config.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    KyselyModule.forRoot([
      {
        namespace: DEFAULT_NAMESPACE,
        dialect: new PostgresDialect({
          pool: new pg({
            host: process.env.HOST ?? 'postgres',
            user: process.env.DATABASE_USERNAME ?? 'postgres',
            password: process.env.DATABASE_PASSWORD ?? 'secret',
            database: process.env.DATABASE_NAME ?? 'cd-bi',
          }),
        }),
      },
    ]),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
