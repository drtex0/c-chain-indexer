import { fromWei } from 'web3-utils';

import { throttleAll } from 'promise-throttle-all';
import { pick } from 'lodash';

import type { Block, Transaction } from 'cci-database';

import { IndexerRepository } from '../repository/indexer.repository';

import { BlockDto } from '../dto/block.dto';
import { TransactionDto } from '../dto/transaction.dto';
import { getAddressBalance, getBlockNumber, getBlockWithTransactions } from '../http';

const MAX_CONCURRENCY = 30;

type TransactionDtoWithBalance = TransactionDto & {
  fromBalance: number;
  toBalance: number | null;
};

export class IndexerService {
  public constructor(private readonly indexerRepository: IndexerRepository) {}

  async processUpcomingBlocks(): Promise<void> {
    while (true) {
      await this.processCurrentBlock();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  protected async processCurrentBlock(): Promise<void> {
    let previousSavedBlockNumber: number | undefined;

    const lastMinedBlock = await getBlockNumber();

    console.info('------processing', lastMinedBlock);

    if (previousSavedBlockNumber !== lastMinedBlock) {
      const insertedBlock = await this.createBlockWithTransactions(lastMinedBlock);

      console.info('-------------inserting', lastMinedBlock);
      if (insertedBlock) {
        previousSavedBlockNumber = insertedBlock.number;
      }
    }
  }

  async catchupMissedBlocks(blockIndexRange: number): Promise<void> {
    const currentBlockNumber = await getBlockNumber();
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

  protected async createBlockWithTransactions(blockNumber: number): Promise<Block | undefined> {
    try {
      const block = await getBlockWithTransactions(blockNumber);

      const transactionsWithBalances = [];

      for (const transaction of block.transactions) {
        const fromBalance = await getAddressBalance(transaction.from, block.number);
        const toBalance = transaction.to ? await getAddressBalance(transaction.to, block.number) : null;

        transactionsWithBalances.push({ ...transaction, fromBalance, toBalance });
      }

      const result = await this.indexerRepository.createBlockAndTransaction(
        this.mapBlockToPrismaBlock(block),
        transactionsWithBalances.map(this.mapTransactionToPrismaTransaction),
      );

      console.info('Created block', result.block.number);
      return result.block;
    } catch (err) {
      // Don't block prisma errors
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

    return {
      ...pick(transaction, [
        'blockNumber',
        'from',
        'to',
        'gas',
        'gasPrice',
        'hash',
        'transactionIndex',
        'value',
        'fromBalance',
        'toBalance',
      ]),
      computedValue,
    };
  }
}
