import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { SessionStore } from '../contracts/session-store.interface';
import { NextFunction, Request, Response } from 'express';

/**
 * Middleware для защиты от brute-force атак на вход.
 *
 * Ограничивает количество попыток входа по IP-адресу.
 * Хранит счётчик в Redis (или любом другом SessionStore).
 *
 * - Ключ: `login_attempts:<ip>`
 * - TTL: 900 секунд по умолчанию
 * - Максимум попыток: 5 по умолчанию
 */
@Injectable()
export class BruteForceProtectionMiddleware implements NestMiddleware {
  /**
   * @param sessionStore Хранилище сессий, использующее Redis или другой механизм хранения.
   */
  constructor(
    @Inject('SessionStore') private readonly sessionStore: SessionStore,
  ) {}

  /**
   * Метод NestJS middleware.
   * Проверяет IP и увеличивает счётчик попыток логина.
   * При превышении лимита — выбрасывает ошибку 429.
   */
  async use(req: Request, res: Response, next: NextFunction) {
    console.log('BruteForceProtectionMiddleware triggered');

    const ip = req.ip || req.connection.remoteAddress;

    if (!ip) {
      throw new HttpException(
        {
          errors: [
            {
              status: '400',
              title: 'Bad Request',
              detail: 'Unable to determine client IP address.',
            },
          ],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const key = `login_attempts:${ip}`;
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);
    const ttl = parseInt(process.env.TTL_LOGIN_ATTEMPTS || '900', 10);

    try {
      const attempts = (await this.sessionStore.get(key)) || 0;
      const attemptsCount = attempts ? parseInt(attempts, 10) : 0;

      if (attemptsCount >= maxAttempts) {
        throw new HttpException(
          {
            errors: [
              {
                status: '429',
                title: 'Too Many Requests',
                detail: 'Too many login attempts. Try again later.',
              },
            ],
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      /**
       * Увеличение счётчика попыток логина
       */
      await this.sessionStore.set(key, attemptsCount + 1, ttl);
      next();
    } catch (error) {
      throw error instanceof HttpException
        ? error
        : new HttpException(
            {
              errors: [
                {
                  status: '500',
                  title: 'Internal Server Error',
                  detail: 'Failed to process login attempts.',
                },
              ],
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }
}
