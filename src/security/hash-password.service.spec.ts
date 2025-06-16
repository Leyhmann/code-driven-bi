import { Test, TestingModule } from '@nestjs/testing';
import { HashPasswordService } from './hash-password.service';

describe('HashPasswordService', () => {
  let service: HashPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashPasswordService],
    }).compile();

    service = module.get<HashPasswordService>(HashPasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
