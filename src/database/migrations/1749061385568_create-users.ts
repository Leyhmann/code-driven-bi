import { Kysely, sql } from 'kysely';
import { DB } from '../schema.js';

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('login', 'varchar(100)')
    .addColumn('email', 'text')
    .addColumn('password', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('users_login_uindex')
    .unique()
    .on('users')
    .column('login')
    .execute();

  await db.schema
    .createIndex('users_email_uindex')
    .unique()
    .on('users')
    .column('email')
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable('users').execute();
}
