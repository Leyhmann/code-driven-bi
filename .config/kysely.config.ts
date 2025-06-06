import { PostgresDialect } from "kysely";
import pg from "pg-pool";
import { defineConfig } from "kysely-ctl";
import { loadDatabaseConfig } from "../src/utils/load-config.js";

const dbConnection = loadDatabaseConfig();


export default defineConfig({
  dialect: new PostgresDialect({
    pool: new pg({
      host: dbConnection.host,
      user: dbConnection.user,
      password: dbConnection.password,
      database: dbConnection.database
    })
  }),
  migrations: {
    migrationFolder: "./src/database/migrations"
  },
  plugins: [],
  seeds: {
    seedFolder: "./src/database/seeds"
  }
});