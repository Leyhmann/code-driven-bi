import { Injectable } from '@nestjs/common';
import { db } from 'src/database/kysely.js';
import { Users } from 'src/database/schema.js';

@Injectable()
export class UsersRepository {
  async findById(userId: string) {
    return await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', userId)
      .executeTakeFirst();
  }
  async create(user: Users): Promise<{ id: string }> {
    const { email, login, password } = user;
    return await db
      .insertInto('users')
      .values({
        email,
        login,
        password,
      })
      .returning(['id'])
      .executeTakeFirstOrThrow();
  }
  async update(user: Users) {
    const { email, login, password, id } = user;
    return await db
      .updateTable('users')
      .set({
        email,
        login,
        password,
      })
      .where('id', '=', id.__update__)
      .executeTakeFirst();
  }
  async delete(userId: string): Promise<void> {
    await db.deleteFrom('users').where('id', '=', userId).executeTakeFirst();
  }
}
