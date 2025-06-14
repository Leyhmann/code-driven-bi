import { Module } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';
import { UsersCommand } from './users.command.js';

@Module({
  providers: [UsersRepository, UsersService, UsersCommand],
})
export class UsersModule {}
