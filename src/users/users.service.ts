import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import { CreateUserDto, UpdateUserDto } from './users.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}
  async create(user: CreateUserDto): Promise<{
    id: string;
  }> {
    const hashPassword = await bcrypt.hash(user.password, 10);
    return await this.usersRepo.create({
      ...user,
      password: hashPassword,
    });
  }
  async update(user: UpdateUserDto) {
    return await this.usersRepo.update(user);
  }
  async delete(userId: string) {
    await this.usersRepo.delete(userId);
  }
}
