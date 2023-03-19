import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../repository/prisma.service';
import { RepositoryModule } from '../repository/repository.module';
import { TransactionsService } from './transactions.service';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from 'cci-database';

const address = '0x123456789abcdef';
const mockTransactions = [
  {
    id: '1',
    blockNumber: 123,
    transactionIndex: 0,
    hash: '0x11111',
    from: '0x1111111111111111',
    fromBalance: 1.1,
    to: address,
    toBalance: null,
    value: '1000000000000000000',
    gas: 21000,
    gasPrice: 500000000,
    nonce: 0,
    timestamp: 1647744941,
    computedValue: 1.1,
    blockId: '123-0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('TransactionsService', () => {
  let transactionsService: TransactionsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionsService, PrismaService],
      imports: [RepositoryModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    transactionsService = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getTransactionsByAddress', () => {
    it('returns the transactions by address and page', async () => {
      const page = 1;
      const pageSize = 10;
      const totalCount = 20;
      const totalPages = 2;

      jest.spyOn(prismaService.transaction, 'findMany').mockResolvedValue(mockTransactions);
      jest.spyOn(prismaService.transaction, 'count').mockResolvedValue(totalCount);

      const result = await transactionsService.getTransactionsByAddress(address, page, pageSize);

      expect(result).toEqual({
        data: mockTransactions,
        page,
        pageSize,
        totalCount,
        totalPages,
      });
    });
  });

  describe('getTransactionCountForAddress', () => {
    it('returns the transactions by address', async () => {
      jest.spyOn(prismaService.transaction, 'count').mockResolvedValue(10);
      const address = '0x123456789abcdef';

      const result = await transactionsService.getTransactionCountForAddress(address);

      expect(result).toEqual(10);
    });
  });

  describe('getTransactionsSortedByValue', () => {
    it('returns the transactions by value', async () => {
      jest.spyOn(prismaService.transaction, 'findMany').mockResolvedValue(mockTransactions);

      const result = await transactionsService.getTransactionsSortedByValue(10);

      expect(result).toEqual(mockTransactions);
    });
  });
});
