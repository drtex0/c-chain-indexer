import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getBlocksCount(): Promise<any> {
    const blocks = await this.prisma.blocks.count();
    return { count: blocks };
  }
}
