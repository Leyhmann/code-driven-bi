import { Command, Positional } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Injectable()
export class UsersCommand {
  constructor(private readonly usersService: UsersService) {}

  @Command({
    command: 'create:user <email> <login> <password>',
    describe: 'create a user',
  })
  async create(
    @Positional({
      name: 'email',
      describe: 'user email',
      type: 'string',
    })
    email: string,
    @Positional({
      name: 'login',
      describe: 'user login',
      type: 'string',
    })
    login: string,
    @Positional({
      name: 'password',
      describe: 'user password',
      type: 'string',
    })
    password: string,
  ) {
    await this.usersService.create({
      email,
      login,
      password,
      id: '',
      created_at: '',
      updated_at: '',
    });
  }
}
