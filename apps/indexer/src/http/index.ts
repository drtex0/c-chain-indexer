import { hexToNumber, toHex } from 'web3-utils';

import { readFromEnv } from '../utils/env';
import { BlockDto } from '../dto/block.dto';
import { BalanceDto } from '../dto/balance.dto';

type JsonRpcResult = Awaited<{ result: any }>;

export const getBlockNumber = async (): Promise<number> => {
  const data = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_blockNumber',
    params: [],
  };

  const response = await fetch(readFromEnv('RPC_ENDPOINT_URL'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const { result } = (await response.json()) as JsonRpcResult;

  return hexToNumber(result);
};

export const getBlockWithTransactions = async (blockNumber: number): Promise<BlockDto> => {
  const data = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_getBlockByNumber',
    params: [toHex(blockNumber), true],
  };

  const response = await fetch(readFromEnv('RPC_ENDPOINT_URL'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json = (await response.json()) as JsonRpcResult;

  return BlockDto.parse(json.result);
};

export const getAddressBalance = async (address: string, blockNumber: number): Promise<BalanceDto> => {
  const data = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_getBalance',
    params: [address, toHex(blockNumber)],
  };

  const response = await fetch(readFromEnv('RPC_ENDPOINT_URL'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const { result } = (await response.json()) as JsonRpcResult;

  return BalanceDto.parse(result);
};
