import { Module } from '@nestjs/common';
import { RedisSessionStore } from './redis-session.store';
import { RedisService } from '../redis/redis.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [
    RedisSessionStore,
    {
      provide: 'SessionStore',
      useFactory: (redisService: RedisService) => {
        if (process.env.SESSION_PROVIDER === 'redis') {
          return new RedisSessionStore(redisService);
        }
        throw new Error('Unsupported session provider');
      },
      inject: [RedisService],
    },
  ],
  exports: ['SessionStore'],
})
export class SessionModule {}
