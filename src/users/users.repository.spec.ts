import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { ColumnType, Kysely } from 'kysely';
import { DB } from 'src/database/schema';
import { DEFAULT_NAMESPACE } from 'src/constants/database';

describe('UsersRepositoryService', () => {
  let service: UsersRepository;
  let dbMock: Partial<Kysely<DB>>;

  beforeEach(async () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      login: 'tester',
      password: 'hashed',
      created_at: new Date(),
      updated_at: new Date(),
    };
    const queryMock = {
      selectAll: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      executeTakeFirst: jest.fn().mockResolvedValue(user),

      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
      executeTakeFirstOrThrow: jest.fn().mockResolvedValue({ id: '2' }),

      set: jest.fn().mockReturnThis(),
    };
    const deleteMock = {
      where: jest.fn().mockReturnThis(),
      executeTakeFirst: jest.fn().mockResolvedValue(undefined),
    };

    dbMock = {
      selectFrom: jest.fn().mockReturnValue(queryMock),
      insertInto: jest.fn().mockReturnValue(queryMock),
      updateTable: jest.fn().mockReturnValue(queryMock),
      deleteFrom: jest.fn().mockReturnValue(deleteMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: `KyselyModuleConnectionToken_${DEFAULT_NAMESPACE}`,
          useValue: dbMock,
        },
      ],
    }).compile();

    service = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find user by Id', async () => {
    const user = await service.findById('1');
    expect(user).toHaveProperty('id', '1');
    expect(dbMock.selectFrom).toHaveBeenCalledWith('users');
  });

  it('should create a new user', async () => {
    const newUser = {
      email: 'test2@example.com',
      login: 'tester2',
      password: 'hashed2',
    };
    const userId = await service.create(newUser);
    expect(userId).toBeDefined();
    expect(userId).toEqual({ id: '2' });
    expect(dbMock.insertInto).toHaveBeenCalledWith('users');
  });

  it('should update user', async () => {
    const newUser = {
      id: '3' as unknown as ColumnType<string, string | undefined, string>,
      email: 'test2@example.com',
      login: 'tester2',
      password: 'hashed2',
    };
    const user = await service.update(newUser);
    expect(user).toBeDefined();
    expect(dbMock.updateTable).toHaveBeenCalledWith('users');
  });

  it('should delete user', async () => {
    await service.delete('1');
    expect(dbMock.deleteFrom).toHaveBeenCalledWith('users');
  });
});
