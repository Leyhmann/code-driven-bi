import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from './database/schema';

@Injectable()
export class AppService {
  constructor(@InjectKysely('system') private readonly db: Kysely<DB>) {}

  async getHello(): Promise<any> {
    return await this.db.selectFrom('users').selectAll().execute();
  }
}
