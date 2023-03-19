import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiDataOutput } from '@src/types';
import { BlocksService } from './blocks.service';

@ApiTags('Blocks')
@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get('/')
  @ApiOperation({ summary: 'Get total blocks count' })
  @ApiResponse({
    status: 200,
    description: 'Returns the total number of blocks',
    schema: {
      example: { data: { count: 1000 } },
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            count: { type: 'integer' },
          },
        },
      },
    },
  })
  async getTotalBlocks(): Promise<ApiDataOutput<{ count: number }>> {
    const totalBlocks = await this.blocksService.getTotalBlocks();

    return { data: { count: totalBlocks } };
  }
}
