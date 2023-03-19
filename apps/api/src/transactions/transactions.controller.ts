import { BadRequestException, Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { Transaction } from 'cci-database';
import { ApiDataOutput, PaginationOutput } from 'src/types';
import { TransactionsService } from './transactions.service';
import { isAddress } from 'web3-utils';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetTransactionsForAddressParamsDto, GetTransactionsForAddressQueryDto } from './input.dto';
import { ZodValidationPipe } from '../validation.pipe';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @Get('/infos/:address')
  @ApiParam({ name: 'address', description: 'Blockchain address' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', description: 'Page size', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of transactions',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array'},
        page: { type: 'integer' },
        pageSize: { type: 'integer' },
        total: { type: 'integer' },
      },
    },
  })
  @UsePipes(new ZodValidationPipe(GetTransactionsForAddressQueryDto))
  public async getTransactionsForAddress(
    @Param() params: GetTransactionsForAddressParamsDto,
    @Query() query: GetTransactionsForAddressQueryDto,
  ): Promise<PaginationOutput<Transaction[]>> {
    const { address } = params;
    const { page, pageSize } = query;

    if (!isAddress(address)) {
      throw new BadRequestException(`Provided address must be a valid address`);
    }

    // zod is not able to validate a query and param pipe
    const transactions = await this.transactionService.getTransactionsByAddress(address, page!, pageSize!);

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
    const transactions = await this.transactionService.getLargestAddressBalances();

    return { data: transactions };
  }
}
