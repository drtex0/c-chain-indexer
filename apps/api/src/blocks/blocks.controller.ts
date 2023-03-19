import { Controller } from '@nestjs/common';
import { ApiDataOutput } from '@src/types';
import { BlocksService } from './blocks.service';

@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  async getTotalBlocks(): Promise<ApiDataOutput<{ count: number }>> {
    const totalBlocks = await this.blocksService.getTotalBlocks();

    return { data: { count: totalBlocks } };
  }
}
