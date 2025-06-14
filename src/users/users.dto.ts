import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { Users } from 'src/database/schema.js';
export class CreateUserDto implements Users {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  login: string;
  @IsNotEmpty()
  @MinLength(6)
  password: string;
  @IsOptional()
  id: any;
  @IsOptional()
  created_at: any;
  @IsOptional()
  updated_at: any;
}

export class UpdateUserDto extends CreateUserDto {}
