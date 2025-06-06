import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env.HOST ?? 'postgres',
  username: process.env.DATABASE_USERNAME ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'secret',
  database: process.env.DATABASE_NAME ?? 'cd-bi',
}));
