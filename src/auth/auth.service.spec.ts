import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { HashPasswordService } from 'src/security/hash-password.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { SessionStore } from './contracts/session-store.interface';
import { UnauthorizedException } from '@nestjs/common';

/**
 * Тесты для AuthService.
 */
describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let hashPass: jest.Mocked<Partial<HashPasswordService>>;
  let eventEmitter: jest.Mocked<Partial<EventEmitter2>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let sessionStore: jest.Mocked<Partial<SessionStore>>;

  beforeEach(async () => {
    usersService = {
      findByLogin: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;
    hashPass = { compare: jest.fn() };
    eventEmitter = { emit: jest.fn() };
    jwtService = { sign: jest.fn() };
    sessionStore = { set: jest.fn(), get: jest.fn(), delete: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: HashPasswordService, useValue: hashPass },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: JwtService, useValue: jwtService },
        { provide: 'SessionStore', useValue: sessionStore },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.resetModules();
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid credentials', async () => {
      usersService.findByLogin!.mockResolvedValue(undefined);

      await expect(
        service.login('wrongpass', 'nouser', '127.0.0.1'),
      ).rejects.toThrow(UnauthorizedException);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.login_failed',
        expect.any(Object),
      );
    });

    it('should login with JWT and return token', async () => {
      process.env.AUTH_METHOD = 'jwt';
      process.env.JWT_EXPIRES_IN = '3600';
      const user = {
        id: 1,
        login: 'user',
        email: 'user@mail.com',
        password: 'hashed',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (usersService.findByLogin as jest.Mock).mockResolvedValue(user);
      (hashPass.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('jwt-token');

      const result = await service.login('pass', 'user', '127.0.0.1');
      expect(result).toBeDefined();
      if (!result) throw new Error('Result is undefined');
      expect(result.data.attributes.token).toBe('jwt-token');
      expect(result.data.attributes.expires_in).toBe('3600');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.login',
        expect.any(Object),
      );
    });

    it('should login with session and return session_id', async () => {
      process.env.AUTH_METHOD = 'session';
      process.env.SESSION_EXPIRES_IN = '3600';
      const user = {
        id: 2,
        login: 'user2',
        email: 'user2@mail.com',
        password: 'hashed',
        created_at: new Date(),
        updated_at: new Date(),
      };
      (usersService.findByLogin as jest.Mock).mockResolvedValue(user);
      (hashPass.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('pass', 'user2', '127.0.0.1');
      expect(result).toBeDefined();
      if (!result) throw new Error('Result is undefined');
      expect(result.data.attributes.session_id).toBeDefined();
      expect(sessionStore.set).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.login',
        expect.any(Object),
      );
    });
  });

  describe('logout', () => {
    it('should call sessionStore.delete for session logout', async () => {
      process.env.AUTH_METHOD = 'session';
      (sessionStore.delete as jest.Mock).mockResolvedValue(undefined);

      await service.logout('session-id');
      expect(sessionStore.delete).toHaveBeenCalledWith('session:session-id');
    });

    it('should not call sessionStore.delete for jwt logout', async () => {
      process.env.AUTH_METHOD = 'jwt';

      await service.logout();
      expect(sessionStore.delete).not.toHaveBeenCalled();
    });
  });
});
