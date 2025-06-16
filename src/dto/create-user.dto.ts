import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Users } from 'src/database/schema.js';
export class CreateUserDto
  implements Omit<Users, 'id' | 'created_at' | 'updated_at'>
{
  @IsEmail()
  email: string;

  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
