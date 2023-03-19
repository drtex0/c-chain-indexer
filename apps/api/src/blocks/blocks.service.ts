import { Injectable } from '@nestjs/common';
import { PrismaService } from '../repository/prisma.service';

@Injectable()
export class BlocksService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTotalBlocks(): Promise<number> {
    const totalBlocks = await this.prismaService.block.count();

    const dups = await this.prismaService.$runCommandRaw({
      aggregate: 'Block',
      pipeline: [
        {
          $group: {
            _id: '$id',
            count: { $sum: 1 },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
        {
          $project: {
            blockId: '$_id',
            count: 1,
            _id: 0,
          },
        },
      ],
      cursor: {},
    });

    console.log(JSON.stringify(dups));

    return totalBlocks;
  }
}
