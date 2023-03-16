import { TransactionRepository } from "../repository/transaction.repository";

export class BlockchainService {
  public constructor(transactionRepository: TransactionRepository) {}

  async getCurrentBlock(): Promise<number> {
    return Promise.resolve(1);
  }

  async processUpcomingBlocks(): Promise<void> {}

  async catchupMissedBlocks({
    from,
    to,
  }: {
    from: number;
    to: number;
  }): Promise<void> {}
}
