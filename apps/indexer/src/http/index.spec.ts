import { BLOCK_INFO_RAW_MOCK } from '../../tests/mocks';
// import { BlockDto } from '../dto/block.dto';
import { getAddressBalance, getBlockNumber, getBlockWithTransactions } from './';

global.fetch = jest.fn();

describe('getBlockNumber', () => {
  beforeEach(() => {
    process.env.RPC_ENDPOINT_URL = 'http://rpc-url.com';
  });

  it('returns the block number', async () => {
    const hexBlockNumber = '0x7b';
    const mockJsonPromise = Promise.resolve({ result: hexBlockNumber });
    const mockFetchPromise = Promise.resolve({
      json: () => mockJsonPromise,
    });
    (global.fetch as jest.Mock).mockImplementation(() => mockFetchPromise);

    const blockNumber = await getBlockNumber();

    expect(blockNumber).toBe(123);
  });
});

describe('getBlockWithTransactions', () => {
  beforeEach(() => {
    process.env.RPC_ENDPOINT_URL = 'http://rpc-url.com';
  });

  it('returns the block with transactions', async () => {
    const mockJsonPromise = Promise.resolve(BLOCK_INFO_RAW_MOCK);
    const mockFetchPromise = Promise.resolve({
      json: () => mockJsonPromise,
    });
    (global.fetch as jest.Mock).mockImplementation(() => mockFetchPromise);

    const block = await getBlockWithTransactions(1000);

    expect(block).toEqual(
      expect.objectContaining({
        number: 27646016,
      }),
    );
  });
});

describe('getAddressBalance', () => {
  beforeEach(() => {
    process.env.RPC_ENDPOINT_URL = 'http://rpc-url.com';
  });

  it('returns the block number', async () => {
    const mockJsonPromise = Promise.resolve({ result: '0x2386F26FC10000' }); // 0.01 AVAX
    const mockFetchPromise = Promise.resolve({
      json: () => mockJsonPromise,
    });
    (global.fetch as jest.Mock).mockImplementation(() => mockFetchPromise);

    const balance = await getAddressBalance('0x0', 0);

    expect(balance).toEqual(0.01);
  });
});
