import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TransactionsModule } from './transactions/transactions.module';
import { RepositoryModule } from './repository/repository.module';
import { BlocksModule } from './blocks/blocks.module';

@Module({
  imports: [TransactionsModule, RepositoryModule, BlocksModule],
  controllers: [AppController],
})
export class AppModule {}
