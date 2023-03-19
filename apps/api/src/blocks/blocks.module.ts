import { Module } from '@nestjs/common';
import { RepositoryModule } from '@src/repository/repository.module';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';

@Module({
  imports: [RepositoryModule],
  controllers: [BlocksController],
  providers: [BlocksService],
})
export class BlocksModule {}
