import { Injectable } from '@nestjs/common';
import { PrismaService } from '../repository/prisma.service';

@Injectable()
export class BlocksService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTotalBlocks(): Promise<number> {
    const totalBlocks = await this.prismaService.block.count();

    return totalBlocks;
  }
}
