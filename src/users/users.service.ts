import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { HashPasswordService } from 'src/security/hash-password.service';

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
  async update(user: UpdateUserDto) {
    return await this.usersRepo.update(user);
  }
  async delete(userId: string) {
    await this.usersRepo.delete(userId);
  }
}
