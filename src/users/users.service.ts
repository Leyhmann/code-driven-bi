import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { HashPasswordService } from 'src/security/hash-password.service';
import { UpdateResult } from 'kysely';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly hashPass: HashPasswordService,
  ) {}

  async create(user: CreateUserDto): Promise<{
    id: string;
  }> {
    const hashPassword = await this.hashPass.hash(user.password, 10);
    return await this.usersRepo.create({
      ...user,
      password: hashPassword,
    });
  }

  async update(user: UpdateUserDto): Promise<UpdateResult> {
    const userToUpdate = { ...user };
    if (user.password) {
      const hashPassword = await this.hashPass.hash(user.password, 10);
      userToUpdate.password = hashPassword;
    }
    return await this.usersRepo.update(userToUpdate);
  }

  async delete(userId: string) {
    await this.usersRepo.delete(userId);
  }
}
