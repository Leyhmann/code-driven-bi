import { config as loadEnv } from 'dotenv';
import { databaseConfig } from '../config/database.config.js';

export const loadDatabaseConfig = () => {
  loadEnv();
  const dbConfig = databaseConfig();
  return {
    host: dbConfig.host,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
  };
};
