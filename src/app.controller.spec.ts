import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DEFAULT_NAMESPACE } from './constants/database.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockKysely = {
      selectFrom: jest.fn().mockReturnThis(),
      selectAll: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue('[]'),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: `KyselyModuleConnectionToken_${DEFAULT_NAMESPACE}`,
          useValue: mockKysely,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "[]"', async () => {
      expect(await appController.getHello()).toBe('[]');
    });
  });
});
