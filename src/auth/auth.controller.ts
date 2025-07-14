import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from 'src/dto/login.dto';

@Controller('api/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Успешная аутентификация (JWT или Session)',
    schema: {
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
  })
  @ApiResponse({
    status: 401,
    description: 'Неверные учетные данные',
  })
  async login(@Body() loginDto: LoginDto) {
    const { login, password } = loginDto;
    return await this.authService.login(password, login);
  }
}
