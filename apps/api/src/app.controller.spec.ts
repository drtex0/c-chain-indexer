import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

const mockPrisma = {
  block: { count: () => Promise.resolve(1) },
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('returns the block count', async () => {
      await expect(appController.getBlocksCount()).resolves.toEqual({
        count: 1,
      });
    });
  });
});
