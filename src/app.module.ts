import { Module } from '@nestjs/common';
import { PostgresDialect } from 'kysely';
import { ConfigModule, ConfigService } from '@nestjs/config';
import pg from 'pg-pool';
import { KyselyModule } from 'nestjs-kysely';
import { CommandModule } from 'nestjs-command';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DEFAULT_NAMESPACE } from './constants/database.js';
import { databaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    KyselyModule.forRootAsync({
      namespace: DEFAULT_NAMESPACE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: new PostgresDialect({
          pool: new pg({
            host: configService.get<string>('database.host'),
            user: configService.get<string>('database.username'),
            password: configService.get<string>('database.password'),
            database: configService.get<string>('database.database'),
          }),
        }),
      }),
    }),
    UsersModule,
    CommandModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
