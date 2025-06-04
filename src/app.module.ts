import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { PostgresDialect } from "kysely";
import pg from "pg-pool";
import { KyselyModule } from "nestjs-kysely";
import * as process from "node:process";

@Module({
  imports: [
    KyselyModule.forRoot([
      {
        namespace: "system",
        dialect: new PostgresDialect({
          pool: new pg({
            host: process.env.HOST ?? "postgres",
            user: process.env.DATABASE_USERNAME ?? "postgres",
            password: process.env.DATABASE_PASSWORD ?? "secret",
            database: process.env.DATABASE_NAME ?? "cd-bi"
          })
        })
      }
    ])
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
