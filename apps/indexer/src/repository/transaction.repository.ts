import { PrismaClient, Block } from "database";

export class TransactionRepository extends PrismaClient {
  async getLastBlockNumber(): Promise<number | null> {
    const block = await this.block.findFirst({
      orderBy: { blockNumber: "desc" },
    });

    if (block === null) return null;

    return block.blockNumber;
  }
}
