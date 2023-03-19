import { Block, PrismaClient, Transaction } from 'cci-database';

type BlockInput = Omit<Block, 'id'>;
type TransactionInputWithoutBlockId = Omit<Transaction, 'id' | 'blockId'>;

export class IndexerRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async getLastInsertedBlockNumber(): Promise<number | null> {
    const block = await this.prismaClient.block.findFirst({
      orderBy: { number: 'desc' },
    });

    if (block === null) return null;

    return block.number;
  }

  async createBlockAndTransaction(
    blockInput: BlockInput,
    transactionsInput: TransactionInputWithoutBlockId[],
  ): Promise<{ block: Block; createdTransactions: Transaction[] }> {
    return this.prismaClient.$transaction(async (client) => {
      const block = await client.block.create({ data: blockInput });

      const createdTransactions = await Promise.all(
        transactionsInput.map((tx) => {
          const data = {
            ...tx,
            blockId: block.id,
          };

          return client.transaction.create({ data });
        }),
      );

      return { block, createdTransactions };
    });
  }
}
