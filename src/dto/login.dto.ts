import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Логин пользователя (email или username)',
  })
  @IsString()
  login: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль пользователя',
  })
  @IsString()
  password: string;
}
