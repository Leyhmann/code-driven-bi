import { Kysely, PostgresDialect } from 'kysely';
import { loadDatabaseConfig } from 'src/utils/load-config.js';
import pg from 'pg-pool';
import { DB } from './schema.js';

const dbConnection = loadDatabaseConfig();

const dialect = new PostgresDialect({
  pool: new pg({
    host: dbConnection.host,
    user: dbConnection.user,
    password: dbConnection.password,
    database: dbConnection.database,
  }),
});

export const db = new Kysely<DB>({ dialect });
