import { IndexerRepository } from '../repository/indexer.repository';
import { IndexerService } from './indexer.service';

import { mocked } from 'jest-mock';

import { PARSED_BLOCK_MOCK } from '../../tests/mocks';

import * as JsonRpcModule from '../http';

jest.mock('../http');
jest.mock('../repository/indexer.repository.ts');

const indexerRepositoryMock = mocked(IndexerRepository);

class TestIndexerService extends IndexerService {
  public createBlockWithTransactions(
    ...args: Parameters<IndexerService['createBlockWithTransactions']>
  ): ReturnType<IndexerService['createBlockWithTransactions']> {
    return super.createBlockWithTransactions(...args);
  }

  public processCurrentBlock(
    ...args: Parameters<IndexerService['processCurrentBlock']>
  ): ReturnType<IndexerService['processCurrentBlock']> {
    return super.processCurrentBlock(...args);
  }
}

describe('IndexerService', () => {
  let indexerRepository: IndexerRepository;
  const blockNumber = 1_000;
  beforeEach(() => {
    indexerRepository = new IndexerRepository(null as any);
  });

  afterEach(() => {
    indexerRepositoryMock.mockReset();
  });

  describe('processCurrentBlock', () => {
    beforeAll(() => {
      jest.spyOn(JsonRpcModule, 'getBlockWithTransactions').mockResolvedValue(PARSED_BLOCK_MOCK as any);
      jest.spyOn(JsonRpcModule, 'getAddressBalance').mockResolvedValue(10);
    });

    afterAll(() => {
      jest.resetModules();
    });

    it('processeses the block', async () => {
      const getBlockNumberSpy = jest.spyOn(JsonRpcModule, 'getBlockNumber').mockResolvedValue(blockNumber);
      const createBlockMock = jest
        .spyOn(IndexerRepository.prototype, 'createBlockAndTransaction')
        .mockResolvedValue({ block: { number: blockNumber } } as any);

      const indexerService = new TestIndexerService(indexerRepository as any);

      await indexerService.processCurrentBlock();

      expect(getBlockNumberSpy).toHaveBeenCalledTimes(1);
      expect(createBlockMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('createBlockWithTransactions', () => {
    it('creates the entries in the database', async () => {
      const createBlockAndTransactionMock = jest.fn().mockResolvedValue({});

      indexerRepositoryMock.mockImplementation((): any => ({
        createBlockAndTransaction: createBlockAndTransactionMock,
      }));

      const service = new TestIndexerService(indexerRepository as any);

      const result = await service.createBlockWithTransactions(10);

      expect(result).toEqual({ number: blockNumber });
      expect(indexerRepositoryMock.mock.instances[0].createBlockAndTransaction).toHaveBeenCalled();
    });
  });

  describe('#catchupMissedBlocks', () => {
    it('catchs up the blocks', async () => {
      indexerRepositoryMock.mockImplementation((): any => ({
        createBlockAndTransaction: jest.fn().mockResolvedValue({}),
      }));
      const spy = jest.spyOn(TestIndexerService.prototype, 'createBlockWithTransactions').mockResolvedValue(undefined);

      const service = new TestIndexerService(indexerRepository);

      await service.catchupMissedBlocks(10);

      expect(spy).toHaveBeenCalledTimes(11); // 10 times + the current block
    });
  });
});
