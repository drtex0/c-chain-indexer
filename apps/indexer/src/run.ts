import { PrismaClient } from 'cci-database';

import { IndexerRepository } from './repository/indexer.repository';
import { IndexerService } from './services/indexer.service';

const BLOCK_MAX_INDEX_HISTORY = 10_000;


export const run = async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
      const indexerRepository = new IndexerRepository(prisma);
  const indexerService = new IndexerService(indexerRepository);

  indexerService.processUpcomingBlocks();

  await indexerService.catchupMissedBlocks(BLOCK_MAX_INDEX_HISTORY);
  } finally {
    await prisma.$disconnect();
  }
};
