import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export interface PassHasher {
  hash(password: string, saltRounds: number): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

@Injectable()
export class HashPasswordService implements PassHasher {
  async hash(password: string, saltRounds: number): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
