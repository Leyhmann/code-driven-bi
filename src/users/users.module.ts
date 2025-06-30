import { Module } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersCommand } from './users.command';
import { HashPasswordService } from 'src/security/hash-password.service';

@Module({
  providers: [UsersRepository, UsersService, UsersCommand, HashPasswordService],
})
export class UsersModule {}
