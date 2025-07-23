// auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Injectable()
export class AuthGuard extends PassportAuthGuard(['jwt', 'session']) {
  constructor(private readonly configService: ConfigService) {
    const authMethod = configService.get<'jwt' | 'session'>(
      'AUTH_METHOD',
      'jwt',
    );
    if (!['jwt', 'session'].includes(authMethod)) {
      throw new Error(
        `Invalid AUTH_METHOD configuration: ${authMethod}. Expected 'jwt' or 'session'.`,
      );
    }
    super(authMethod);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const authMethod = this.configService.get<'jwt' | 'session'>(
      'AUTH_METHOD',
      'jwt',
    );

    try {
      const result = await super.canActivate(context);

      if (
        typeof result === 'boolean' &&
        result &&
        authMethod === 'session' &&
        this.configService.get<'cookie' | 'header'>(
          'SESSION_ID_METHOD',
          'cookie',
        ) === 'cookie'
      ) {
        const cookies: Record<string, string> =
          (request.cookies as Record<string, string>) || {};
        const sessionId =
          cookies['session_id'] || request.headers['x-session-id']?.toString();
        if (sessionId) {
          response.cookie('session_id', sessionId, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: Number(this.configService.get('SESSION_EXPIRES_IN')) * 1000,
          });
        }
      }
      return result as boolean;
    } catch {
      throw new UnauthorizedException({
        errors: [
          {
            status: '401',
            title: 'Unauthorized',
            detail: 'Invalid or expired token',
          },
        ],
      });
    }
  }
}
