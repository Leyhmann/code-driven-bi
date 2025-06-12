import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import { CreateUserDto, UpdateUserDto } from './users.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}
  async create(user: CreateUserDto): Promise<{
    id: string;
  }> {
    return await this.usersRepo.create(user);
  }
  async update(user: UpdateUserDto) {
    return await this.usersRepo.update(user);
  }
  async delete(userId: string) {
    await this.usersRepo.delete(userId);
  }
}
