import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashPasswordService } from 'src/security/hash-password.service';
import { UsersService } from 'src/users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuid } from 'uuid';
import { SessionStore } from './contracts/session-store.interface';
import { SessionData } from 'src/types/commonTypes';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashPass: HashPasswordService,
    private readonly eventEmitter: EventEmitter2,
    private readonly jwtService: JwtService,
    @Inject('SessionStore')
    private readonly sessionStore: SessionStore,
  ) {}

  async login(password: string, login: string) {
    const user = await this.usersService.findByLogin(login);

    if (
      !user ||
      (user.password && !(await this.hashPass.compare(password, user.password)))
    ) {
      this.eventEmitter.emit('user.login_failed', {
        login,
        timestamp: new Date().toISOString(),
        action: 'login_failed',
        details: { reason: 'Invalid credentials' },
      });
      throw new UnauthorizedException(
        'Invalid credentials. Please check your login and password.',
      );
    }

    if (process.env.AUTH_METHOD === 'jwt') {
      const payload = {
        sub: user.id,
        login: user.login,
        email: user.email,
      };
      const token = this.jwtService.sign(payload);
      this.eventEmitter.emit('user.login', {
        user_id: user.id,
        timestamp: new Date().toISOString(),
        action: 'login',
        details: { method: 'jwt' },
      });
      return {
        data: {
          type: 'auth',
          attributes: {
            token,
            expires_in: process.env.JWT_EXPIRES_IN,
          },
        },
      };
    }
    if (process.env.AUTH_METHOD === 'session') {
      const sessionId = uuid();
      const sessionData: SessionData = {
        user_id: user.id,
        login: user.login,
        expires_at: Date.now() + Number(process.env.SESSION_EXPIRES_IN) * 1000,
      };
      await this.sessionStore.set(
        `session:${sessionId}`,
        JSON.stringify(sessionData),
        Number(process.env.SESSION_EXPIRES_IN),
      );
      this.eventEmitter.emit('user.login', {
        user_id: user.id,
        timestamp: new Date().toISOString(),
        action: 'login',
        details: { method: 'session' },
      });
      return {
        data: {
          type: 'auth',
          attributes: {
            session_id: sessionId,
          },
        },
      };
    }
  }

  async logout(sessionId?: string) {
    if (process.env.AUTH_METHOD === 'jwt') {
      this.eventEmitter.emit('user.logout', {
        timestamp: new Date().toISOString(),
        action: 'logout',
      });
      return {
        data: {
          type: 'auth',
          attributes: {
            message: 'Logged out successfully',
          },
        },
      };
    }

    if (process.env.AUTH_METHOD === 'session') {
      if (sessionId) {
        await this.sessionStore.delete(`session:${sessionId}`);
        this.eventEmitter.emit('user.logout', {
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          action: 'logout',
        });
        return {
          data: {
            type: 'auth',
            attributes: {
              message: 'Logged out successfully',
            },
          },
        };
      }
      if (!sessionId) {
        throw new UnauthorizedException('Session ID not provided');
      }
    }
  }
}
