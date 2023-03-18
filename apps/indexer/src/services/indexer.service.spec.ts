import { IndexerRepository } from '../repository/indexer.repository';
import { IndexerService } from './indexer.service';

import { mocked } from 'jest-mock';
import Web3 from 'web3';

import { BLOCK_INFO_MOCK } from '../../tests/mocks';

jest.mock('web3', () => {
  return jest.fn().mockImplementation(() => ({
    utils: Web3.utils,
    eth: {
      getBlockNumber: jest.fn().mockResolvedValue(42),
      getBlock: jest.fn(),
    },
  }));
});
jest.mock('../repository/indexer.repository.ts');

const indexerRepositoryMock = mocked(IndexerRepository);
const web3Mock = mocked(Web3);

class TestIndexerService extends IndexerService {
  public createBlockWithTransactions(
    ...args: Parameters<IndexerService['createBlockWithTransactions']>
  ): ReturnType<IndexerService['createBlockWithTransactions']> {
    return super.createBlockWithTransactions(...args);
  }
}

describe('IndexerService', () => {
  let indexerRepository: IndexerRepository;

  beforeEach(() => {
    process.env.RPC_ENDPOINT_URL = 'http://some-url';
    indexerRepository = new IndexerRepository(null as any);
  });

  afterEach(() => {
    indexerRepositoryMock.mockReset();
  });

  describe('#getLastMinedBlockNumber', () => {
    it('returns the latest mined block', async () => {
      const indexerService = new TestIndexerService(indexerRepository);

      const result = await indexerService.getLastMinedBlockNumber();
      expect(result).toBe(42);
    });
  });

  describe('#createBlockWithTransactions', () => {
    it('creates the entries in the database', async () => {
      const getLastInsertedBlockNumberMock = jest.fn().mockResolvedValue(10);
      const getBlockMock = jest.fn().mockResolvedValue(BLOCK_INFO_MOCK);
      const createBlockAndTransactionMock = jest.fn().mockResolvedValue({});

      indexerRepositoryMock.mockImplementation((): any => ({
        getLastInsertedBlockNumber: getLastInsertedBlockNumberMock,
        createBlockAndTransaction: createBlockAndTransactionMock,
      }));
      web3Mock.mockImplementation((): any => ({
        eth: {
          getBlockNumber: jest.fn().mockResolvedValue(42),
          getBlock: getBlockMock,
        },
      }));
      // @ts-ignore
      web3Mock.utils = { isAddress: () => true };

      const service = new TestIndexerService(indexerRepository as any);

      const result = await service.createBlockWithTransactions(10);

      expect(result).toEqual(BLOCK_INFO_MOCK);
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
