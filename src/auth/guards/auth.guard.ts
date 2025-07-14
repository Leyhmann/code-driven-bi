// auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

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
    try {
      const result = await super.canActivate(context);
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
