import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { LoginDto } from 'src/dto/login.dto';

@Controller('api/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Успешная аутентификация (JWT или Session)',
    schema: {
      oneOf: [
        {
          example: {
            data: {
              type: 'auth',
              attributes: {
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
                expires_in: '3600',
              },
            },
          },
        },
        {
          example: {
            data: {
              type: 'auth',
              attributes: {
                session_id: 'uuid',
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Неверные учетные данные',
  })
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    const { login, password } = loginDto;
    const result = await this.authService.login(password, login);

    if (
      this.configService.get<'jwt' | 'session'>('AUTH_METHOD', 'jwt') ===
        'session' &&
      this.configService.get<'cookie' | 'header'>(
        'SESSION_ID_METHOD',
        'cookie',
      ) === 'cookie'
    ) {
      const sessionId = result?.data.attributes.session_id;
      if (sessionId) {
        response.cookie('session_id', sessionId, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: Number(this.configService.get('SESSION_EXPIRES_IN')) * 1000,
        });
      }
    }

    return response.json(result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь разлогинен',
    schema: {
      example: {
        data: {
          type: 'auth',
          attributes: {
            message: 'Logged out successfully',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Управление сессией не поддерживается',
  })
  async logout(@Req() request: Request, @Res() response: Response) {
    let sessionId: string | undefined;

    if (
      this.configService.get<'jwt' | 'session'>('AUTH_METHOD', 'jwt') ===
      'session'
    ) {
      if (
        this.configService.get<'cookie' | 'header'>(
          'SESSION_ID_METHOD',
          'cookie',
        ) === 'cookie'
      ) {
        const cookies = request.cookies as
          | Record<string, string | undefined>
          | undefined;
        sessionId = cookies?.['session_id'];
        console.log('Cookies:', sessionId);
        if (sessionId) {
          response.clearCookie('session_id', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
          });
        }
      } else {
        sessionId = request.headers['x-session-id']?.toString();
        console.log('X-Session-ID:', sessionId);
      }
    }

    const result = await this.authService.logout(sessionId);
    return response.json(result);
  }
}
