import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;
  let configService: jest.Mocked<Partial<ConfigService>>;
  let response: Response;
  let request: Request;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      logout: jest.fn(),
    };
    configService = {
      get: jest.fn(),
    };
    response = {
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;
    request = {
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
      cookies: { session_id: 'test-session' },
      headers: { 'x-session-id': 'header-session' } as Record<string, string>,
      method: 'GET',
      url: '/',
      params: {},
      query: {},
      body: {},
      get: jest.fn(),
      header: jest.fn(),
      signedCookies: {},
      protocol: 'http',
      secure: false,
      xhr: false,
      baseUrl: '/',
      originalUrl: '/',
      path: '/',
      hostname: 'localhost',
      subdomains: [],
      accepts: jest.fn(),
      acceptsCharsets: jest.fn(),
      acceptsEncodings: jest.fn(),
      acceptsLanguages: jest.fn(),
      range: jest.fn(),
      param: jest.fn(),
    } as unknown as Request;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  // jest.mock('./protection/csrf.middleware', () => ({
  //   generateCsrfToken: jest.fn(() => 'mocked-csrf-token'),
  // }));

  describe('login', () => {
    it('should login with JWT and return token', async () => {
      (configService.get! as jest.Mock).mockImplementation((key, def) => {
        if (key === 'AUTH_METHOD') return 'jwt';
        return def as string;
      });
      const result = {
        data: {
          type: 'auth',
          attributes: {
            token: 'jwt-token',
            expires_in: '3600',
          },
        },
      };
      (authService.login! as jest.Mock).mockResolvedValue(result);

      const loginDto = { login: 'user', password: 'pass' };
      await controller.login(loginDto, response, request);

      expect(authService.login).toHaveBeenCalledWith(
        'pass',
        'user',
        '127.0.0.1',
      );
      expect(response.json).toHaveBeenCalledWith(result);
    });

    it('should login with session and set cookie', async () => {
      (configService.get! as jest.Mock).mockImplementation((key, def) => {
        if (key === 'AUTH_METHOD') return 'session';
        if (key === 'SESSION_ID_METHOD') return 'cookie';
        if (key === 'SESSION_EXPIRES_IN') return '3600';
        return def as string;
      });
      const result = {
        data: {
          type: 'auth',
          attributes: {
            session_id: 'session-uuid',
          },
        },
      };
      (authService.login! as jest.Mock).mockResolvedValue(result);

      const loginDto = { login: 'user', password: 'pass' };
      await controller.login(loginDto, response, request);

      expect(response.cookie).toHaveBeenCalledWith(
        'session_id',
        'session-uuid',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 3600 * 1000,
        }),
      );
      expect(response.json).toHaveBeenCalledWith(result);
    });

    it('should throw HttpException if IP is missing', async () => {
      const loginDto = { login: 'user', password: 'pass' };
      const req = {
        ...request,
        ip: undefined,
        connection: { remoteAddress: undefined },
      } as unknown as Request;
      await expect(controller.login(loginDto, response, req)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout with session and clear cookie', async () => {
      (configService.get! as jest.Mock).mockImplementation((key, def) => {
        if (key === 'AUTH_METHOD') return 'session';
        if (key === 'SESSION_ID_METHOD') return 'cookie';
        return def as string;
      });
      (authService.logout! as jest.Mock).mockResolvedValue({
        data: {
          type: 'auth',
          attributes: { message: 'Logged out successfully' },
        },
      });

      await controller.logout(request, response);

      expect(authService.logout).toHaveBeenCalledWith('test-session');
      expect(response.clearCookie).toHaveBeenCalledWith(
        'session_id',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        }),
      );
      expect(response.json).toHaveBeenCalled();
    });

    it('should logout with JWT', async () => {
      (configService.get! as jest.Mock).mockImplementation((key, def) => {
        if (key === 'AUTH_METHOD') return 'jwt';
        return def as string;
      });
      (authService.logout! as jest.Mock).mockResolvedValue({
        data: {
          type: 'auth',
          attributes: { message: 'Logged out successfully' },
        },
      });

      await controller.logout(request, response);

      expect(authService.logout).toHaveBeenCalledWith(undefined);
      expect(response.json).toHaveBeenCalled();
    });
  });

  describe('csrfToken', () => {
    it('should return csrf token', () => {
      controller.csrfToken(request, response);

      expect(response.json).toHaveBeenCalledWith({
        csrfToken: expect.stringMatching(/^[0-9a-f]+?\.[0-9a-f]+$/i),
      });
    });
  });
});
