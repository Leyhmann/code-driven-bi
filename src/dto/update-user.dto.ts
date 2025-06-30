import { IsNotEmpty } from 'class-validator';
import { ColumnType } from 'kysely';
import { Users } from 'src/database/schema';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto
  extends CreateUserDto
  implements Omit<Users, 'created_at' | 'updated_at'>
{
  @IsNotEmpty()
  id: ColumnType<string>;
}
