import { BadRequestException, Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Transaction } from 'cci-database';
import { ApiDataOutput, PaginationOutput } from 'src/types';
import { TransactionsService } from './transactions.service';
import { isAddress } from 'web3-utils';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Get('/infos/:address')
  public async getTransactionsForAddress(
    @Param('address') address: string,
    @Query('page', ParseIntPipe) page = 1,
    @Query('pageSize', ParseIntPipe) pageSize = 10,
  ): Promise<PaginationOutput<Transaction[]>> {
    if (page <= 0 || pageSize < 0) {
      throw new BadRequestException(`page and pageSize must be positive`);
    }

    if (!isAddress(address)) {
      throw new BadRequestException(`Provided address must be a valid address`);
    }

    const transactions = await this.transactionService.getTransactionsByAddress(address, page, pageSize);

    return transactions;
  }

  @Get('/:address/count')
  public async getTransactionCountForAddress(
    @Param('address') address: string,
  ): Promise<ApiDataOutput<{ count: number }>> {
    if (!isAddress(address)) {
      throw new BadRequestException(`Provided address must be a valid address`);
    }

    const count = await this.transactionService.getTransactionCountForAddress(address);

    return { data: { count } };
  }

  @Get('/')
  public async getTransactions(@Query('limit') limit?: string): Promise<ApiDataOutput<Transaction[]>> {
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    if (isNaN(parsedLimit)) {
      throw new BadRequestException('Parameter limit must be positive');
    }

    const transactions = await this.transactionService.getTransactionsSortedByValue(parsedLimit);

    return { data: transactions };
  }

  @Get('/largest-balances')
  public async getLargestBalancesAddresses(): Promise<ApiDataOutput<{ address: string; balance: number }[]>> {
    console.log('here');
    const transactions = await this.transactionService.getLargestAddressBalances();

    return { data: transactions };
  }
}
