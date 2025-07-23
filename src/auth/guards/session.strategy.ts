import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { SessionStore } from '../contracts/session-store.interface';
import { SessionData } from 'src/types/commonTypes';

@Injectable()
export class SessionStrategy extends PassportStrategy(Strategy, 'session') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @Inject('SessionStore') private readonly sessionStore: SessionStore,
  ) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const sessionIdMethod = this.configService.get<'cookie' | 'header'>(
      'SESSION_ID_METHOD',
      'cookie',
    );

    let sessionId: string | undefined;

    if (sessionIdMethod === 'cookie') {
      sessionId = (req.cookies as Record<string, string> | undefined)?.[
        'session_id'
      ];
    } else if (sessionIdMethod === 'header') {
      sessionId = req.headers['x-session-id']?.toString();
    }

    if (!sessionId) {
      throw new UnauthorizedException('Session ID not provided');
    }

    const sessionData = await this.sessionStore.get(`session:${sessionId}`);
    if (!sessionData) {
      throw new UnauthorizedException('Session not found');
    }

    const session = JSON.parse(sessionData) as SessionData;
    if (session.expires_at < Date.now()) {
      await this.sessionStore.delete(`session:${sessionId}`);
      throw new UnauthorizedException('Session expired');
    }

    const user = await this.usersService.findById(session.user_id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
