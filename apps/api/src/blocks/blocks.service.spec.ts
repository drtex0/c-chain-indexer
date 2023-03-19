import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../repository/prisma.service';
import { RepositoryModule } from '../repository/repository.module';
import { BlocksService } from './blocks.service';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from 'cci-database';
describe('BlocksService', () => {
  let blocksService: BlocksService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RepositoryModule],

      providers: [BlocksService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    blocksService = module.get<BlocksService>(BlocksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('#getTotalBlocks', () => {
    it('returns the total blocks', async () => {
      jest.spyOn(prismaService.block, 'count').mockResolvedValue(20);

      const result = await blocksService.getTotalBlocks();

      expect(result).toEqual(20);
    });
  });
});
