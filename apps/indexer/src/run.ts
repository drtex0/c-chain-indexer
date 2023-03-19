import { PrismaClient } from 'cci-database';
import { isNumber } from 'lodash';

import { IndexerRepository } from './repository/indexer.repository';
import { IndexerService } from './services/indexer.service';
import { readFromEnv } from './utils/env';

function assertIsInteger(input: unknown): asserts input is number {
  if (!isNumber(input)) {
    throw new Error(`${input} is not a numeric value`);
  }
}

const BLOCK_MAX_INDEX_HISTORY = readFromEnv('INDEXER_MAX_HISTORY');
assertIsInteger(BLOCK_MAX_INDEX_HISTORY);

export const run = async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const indexerRepository = new IndexerRepository(prisma);
    const indexerService = new IndexerService(indexerRepository);

    await Promise.all([
      indexerService.processUpcomingBlocks(),
      indexerService.catchupMissedBlocks(BLOCK_MAX_INDEX_HISTORY),
    ]);
  } finally {
    await prisma.$disconnect();
  }
};
