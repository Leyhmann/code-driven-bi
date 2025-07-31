import { doubleCsrf } from 'csrf-csrf';
import { NextFunction, Request, Response } from 'express';

/**
 * Опции для настройки double CSRF middleware.
 */
const doubleCsrfOptions = {
  /**
   * Получает CSRF-секрет из куки `csrf-secret`.
   */
  getSecret: (req: Request): string =>
    (req.cookies as Record<string, string> | undefined)?.['csrf-secret'] || '',

  /**
   * Извлекает CSRF-токен из заголовка `x-csrf-token`.
   */
  getCsrfTokenFromRequest: (req: Request) =>
    req.headers['x-csrf-token'] as string,

  /**
   * Получает идентификатор сессии из куки `session_id`.
   * Используется для связывания CSRF-токена с конкретной сессией.
   */
  getSessionIdentifier: (req: Request): string =>
    (req.cookies as Record<string, string> | undefined)?.['session_id'] || '',

  /** Имя куки, в которой хранится CSRF-секрет. */
  cookieName: 'csrf-secret',

  /** Настройки для куки с CSRF-секретом. */
  cookieOptions: {
    /** Запрещает передачу куки сторонним сайтам. */
    sameSite: 'strict' as const,
    /** Использовать `secure` флаг только в production. */
    secure: process.env.NODE_ENV === 'prod',
    /** Доступ к куки только через HTTP (недоступно JS на клиенте). */
    httpOnly: true,
  },
};

/**
 * Генератор CSRF-токена и middleware защиты.
 */
const { generateCsrfToken, doubleCsrfProtection } =
  doubleCsrf(doubleCsrfOptions);

/**
 * Middleware условной защиты от CSRF.
 * Применяется только при `SESSION_ID_METHOD=cookie`, исключая `GET /api/auth/csrf-token`.
 */
const conditionalCsrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isException =
    process.env.SESSION_ID_METHOD !== 'cookie' ||
    process.env.AUTH_METHOD === 'jwt' ||
    (req.path === '/api/auth/csrf-token' && req.method === 'GET');
  console.log('Conditional CSRF Protection:', {
    isException,
    sessionIdMethod: process.env.SESSION_ID_METHOD,
    authMethod: process.env.AUTH_METHOD,
    requestPath: req.path,
    requestMethod: req.method,
  });
  if (isException) return next();
  return doubleCsrfProtection(req, res, next);
};

export { generateCsrfToken, conditionalCsrfProtection };
