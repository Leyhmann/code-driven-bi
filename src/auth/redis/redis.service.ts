import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(private configService: ConfigService) {
    this.client = new Redis(
      this.configService.get<string>('REDIS_URL', 'redis://localhost:6379'),
    );

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  async set(key: string, value: string, expiresIn?: number): Promise<void> {
    if (expiresIn) {
      await this.client.set(key, value, 'EX', expiresIn);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    const value = await this.client.get(key);
    return value;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
