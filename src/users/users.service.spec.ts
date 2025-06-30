import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { HashPasswordService } from 'src/security/hash-password.service';
import { ColumnType, UpdateResult } from 'kysely';

describe('UsersService', () => {
  let service: UsersService;
  let hashPass: jest.Mocked<HashPasswordService>;
  let userRepo: jest.Mocked<UsersRepository>;

  const mockHashPass: jest.Mocked<HashPasswordService> = {
    hash: jest.fn().mockResolvedValue('hashedPassword'),
    compare: jest.fn(),
  };
  const mockUserRepo: Partial<UsersRepository> = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUserRepo,
        },
        {
          provide: HashPasswordService,
          useValue: mockHashPass,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    hashPass = module.get<HashPasswordService>(
      HashPasswordService,
    ) as jest.Mocked<HashPasswordService>;
    userRepo = module.get<UsersRepository>(
      UsersRepository,
    ) as jest.Mocked<UsersRepository>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create user with hash password', async () => {
    const userDto = {
      email: 'test@example.com',
      login: 'tester',
      password: 'plainPassword',
    };

    const hashPassword = await hashPass.hash(userDto.password, 10);
    userRepo.create.mockResolvedValue({ id: '1' }); // Мокаем результат создания

    const result = await service.create(userDto);

    const hasSpy = jest.spyOn(hashPass, 'hash');
    expect(hasSpy).toHaveBeenCalledWith(userDto.password, 10);

    const createSpy = jest.spyOn(userRepo, 'create');
    expect(createSpy).toHaveBeenCalledWith({
      ...userDto,
      password: hashPassword,
    });

    expect(result).toEqual({ id: '1' });
  });

  it('should update user with has password', async () => {
    const userDtoForUpdate = {
      id: '2' as unknown as ColumnType<string>,
      email: 'test@example.com',
      login: 'tester',
      password: 'plainPassword',
    };

    const hashPassword = await hashPass.hash(userDtoForUpdate.password, 10);
    userRepo.update.mockResolvedValue({} as UpdateResult);
    const result = await service.update(userDtoForUpdate);

    const hasSpy = jest.spyOn(hashPass, 'hash');
    expect(hasSpy).toHaveBeenCalledWith(userDtoForUpdate.password, 10);

    const createSpy = jest.spyOn(userRepo, 'update');
    expect(createSpy).toHaveBeenCalledWith({
      ...userDtoForUpdate,
      password: hashPassword,
    });
    expect(result).toBeDefined();
  });
});
