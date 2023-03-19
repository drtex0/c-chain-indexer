import { Module } from '@nestjs/common';
import { RepositoryModule } from 'src/repository/repository.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [RepositoryModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
