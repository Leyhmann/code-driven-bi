import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
export class CreateUserDto {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  login: string;
  @IsNotEmpty()
  @MinLength(6)
  password: string;
  @IsOptional()
  id?: string;
  //   @IsOptional()
  //   created_at?: string;
  //   @IsOptional()
  //   updated_at?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
