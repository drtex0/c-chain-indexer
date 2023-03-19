import Web3 from 'web3';
import { fromWei } from 'web3-utils';

import { BlockTransactionObject } from 'web3-eth';
import { throttleAll } from 'promise-throttle-all';
import { pick } from 'lodash';

import type { Block, Transaction } from 'cci-database';

import { IndexerRepository } from '../repository/indexer.repository';
import { readFromEnv } from '../utils/env';

import { BlockDto } from '../dto/block.dto';
import { TransactionDto } from '../dto/transaction.dto';

const MAX_CONCURRENCY = 50;

type TransactionDtoWithBalance = TransactionDto & {
  fromBalance: string;
  toBalance: string | null;
};

export class IndexerService {
  private web3: Web3;

  public constructor(private readonly indexerRepository: IndexerRepository) {
    this.web3 = new Web3(readFromEnv('RPC_ENDPOINT_URL'));
  }

  async getLastMinedBlockNumber(): Promise<number> {
    return this.web3.eth.getBlockNumber();
  }

  processUpcomingBlocks(): void {
    let previousSavedBlockNumber: number | undefined;

    setInterval(async () => {
      const lastMinedBlock = await this.getLastMinedBlockNumber();

      if (previousSavedBlockNumber !== lastMinedBlock) {
        const insertedBlock = await this.createBlockWithTransactions(lastMinedBlock);

        if (insertedBlock) {
          previousSavedBlockNumber = insertedBlock.number;
        }
      }
    }, 100);
  }

  async catchupMissedBlocks(blockIndexRange: number): Promise<void> {
    const currentBlockNumber = await this.getLastMinedBlockNumber();
    const lastSavedBlockNumber = await this.indexerRepository.getLastInsertedBlockNumber();

    let blockStart = lastSavedBlockNumber ?? currentBlockNumber - blockIndexRange;

    if (blockStart < 0) {
      blockStart = 1; // first minted block is 1
    }

    const rangeLength = currentBlockNumber - blockStart + 1;
    const promises = Array.from(
      { length: rangeLength },
      (_, i) => () => this.createBlockWithTransactions(blockStart + i),
    );

    await throttleAll(MAX_CONCURRENCY, promises);
  }

  protected async createBlockWithTransactions(blockNumber: number): Promise<BlockTransactionObject | undefined> {
    const block = await this.web3.eth.getBlock(blockNumber, true);
    try {
      const verifiedBlock = BlockDto.parse(block);

      const transactionsWithBalances = [];

      for (const transaction of verifiedBlock.transactions) {
        const fromBalance = await this.web3.eth.getBalance(transaction.from);
        const toBalance = transaction.to ? await this.web3.eth.getBalance(transaction.to) : null;

        transactionsWithBalances.push({ ...transaction, fromBalance, toBalance });
      }

      await this.indexerRepository.createBlockAndTransaction(
        this.mapBlockToPrismaBlock(verifiedBlock),
        transactionsWithBalances.map(this.mapTransactionToPrismaTransaction),
      );
      return block;
    } catch (err) {
      // TODO: need to handle prisma errors
      console.log(JSON.stringify(block));
      console.log('Error on insert', err);
    }
  }

  protected mapBlockToPrismaBlock(block: BlockDto): Omit<Block, 'id'> {
    return {
      ...pick(block, ['hash', 'parentHash', 'gasUsed', 'gasLimit']),
      difficulty: Number(block.difficulty),
      number: Number(block.totalDifficulty),
      timestamp: new Date(block.timestamp * 1000),
    };
  }

  protected mapTransactionToPrismaTransaction(
    transaction: TransactionDtoWithBalance,
  ): Omit<Transaction, 'id' | 'blockId'> {
    const computedValue = Number(fromWei(transaction.value, 'ether'));
    const fromBalance = Number(fromWei(transaction.fromBalance, 'ether'));
    const toBalance =transaction.toBalance ?  Number(fromWei(transaction.toBalance, 'ether')) : null;

    return {
      ...pick(transaction, ['blockNumber', 'from', 'to', 'gas', 'gasPrice', 'hash', 'transactionIndex', 'value']),
      computedValue,
      fromBalance,
      toBalance,
    };
  }
}
