import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { SessionStore } from './session-store.interface';

@Injectable()
export class RedisSessionStore implements SessionStore {
  constructor(private readonly redisService: RedisService) {}

  async set(sessionId: string, data: any, ttl: number): Promise<void> {
    await this.redisService.set(
      `session:${sessionId}`,
      JSON.stringify(data),
      ttl,
    );
  }

  async get(sessionId: string): Promise<string | null> {
    return this.redisService.get(`session:${sessionId}`);
  }

  async delete(sessionId: string): Promise<void> {
    await this.redisService.del(`session:${sessionId}`);
  }
}
