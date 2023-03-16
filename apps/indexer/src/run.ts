// Ajouter prisma
// Ajouter zod

// 1 - Faire un script qui récupère le dernier bloc de la DB
// 2 - Récupérer le block actuel

import { PrismaClient } from "database";
import { TransactionRepository } from "./repository/transaction.repository";
import { BlockchainService } from "./services/blockchain.service";

const BLOCK_MAX_HISTORY = 10_000;

(async () => {
  const transactionRepository = new TransactionRepository();
  const latestBlock = transactionRepository.getLastBlockNumber();
  const blockchainService = new BlockchainService(transactionRepository);
  const currentBlock = await blockchainService.getCurrentBlock();

  let blockStart = currentBlock - BLOCK_MAX_HISTORY;

  if (blockStart <= 0) {
    blockStart = 1; // firstBlock is 1
  }

  if (latestBlock === null) {
    blockStart = currentBlock - BLOCK_MAX_HISTORY;
  }

  blockchainService.processUpcomingBlocks();

  blockchainService.catchupMissedBlocks({ from: blockStart, to: currentBlock });
})();

export const run = async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
  } finally {
    await prisma.$disconnect();
  }
};
