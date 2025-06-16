import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { DB, Users } from 'src/database/schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectKysely() private readonly db: Kysely<DB>) {}
  async findById(userId: string) {
    return await this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', userId)
      .executeTakeFirst();
  }
  async create(
    user: Omit<Users, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<{ id: string }> {
    const { email, login, password } = user;
    return await this.db
      .insertInto('users')
      .values({
        email,
        login,
        password,
      })
      .returning(['id'])
      .executeTakeFirstOrThrow();
  }
  async update(user: Omit<Users, 'created_at' | 'updated_at'>) {
    const { email, login, password, id } = user;
    return await this.db
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
    await this.db
      .deleteFrom('users')
      .where('id', '=', userId)
      .executeTakeFirst();
  }
}
