import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ColumnType } from 'kysely';
import { Users } from 'src/database/schema';

export class UpdateUserDto implements Omit<Users, 'created_at' | 'updated_at'> {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  id: ColumnType<string>;
}
