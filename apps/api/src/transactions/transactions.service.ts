import { Injectable } from '@nestjs/common';
import { Transaction } from 'cci-database';
import { PrismaService } from '../repository/prisma.service';
import { PaginationOutput } from '../types';

@Injectable()
export class TransactionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTransactionsByAddress(
    address: string,
    page: number,
    pageSize: number,
  ): Promise<PaginationOutput<Transaction[]>> {
    const skip = (page - 1) * pageSize;

    const transactions = await this.prismaService.transaction.findMany({
      where: {
        OR: [{ from: address }, { to: address }],
      },
      orderBy: [{ blockNumber: 'asc' }, { transactionIndex: 'asc' }],
      skip,
      take: pageSize,
    });

    const totalCount = await this.prismaService.transaction.count({
      where: {
        OR: [{ from: address }, { to: address }],
      },
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    return { data: transactions, page, pageSize, totalCount, totalPages };
  }

  async getTransactionCountForAddress(address: string): Promise<number> {
    const count = await this.prismaService.transaction.count({
      where: {
        OR: [{ from: address }, { to: address }],
      },
    });

    return count;
  }

  async getTransactionsSortedByValue(limit: number): Promise<Transaction[]> {
    const transactions = await this.prismaService.transaction.findMany({
      orderBy: {
        computedValue: 'desc',
      },
      take: limit,
      include: {
        block: true,
      },
    });

    return transactions;
  }

  async getLargestAddressBalances(): Promise<{ address: string; balance: number }[]> {
    const addresses = await this.prismaService.$runCommandRaw({
      aggregate: 'Transaction',
      pipeline: [
        {
          $lookup: {
            from: 'Block',
            localField: 'blockId',
            foreignField: '_id',
            as: 'block',
          },
        },
        { $unwind: '$block' },
        {
          $facet: {
            fromAddresses: [
              {
                $group: {
                  _id: '$from',
                  balance: { $max: '$fromBalance' },
                },
              },
            ],
            toAddresses: [
              {
                $group: {
                  _id: '$to',
                  balance: { $max: '$toBalance' },
                },
              },
            ],
          },
        },
        {
          $project: {
            allAddresses: {
              $concatArrays: ['$fromAddresses', '$toAddresses'],
            },
          },
        },
        { $unwind: '$allAddresses' },
        {
          $group: {
            _id: '$allAddresses._id',
            balance: { $max: '$allAddresses.balance' },
          },
        },
        { $sort: { balance: -1 } },
        { $limit: 100 },
      ],
      cursor: {},
    });

    if (!addresses.cursor) {
      return [];
    }

    return (addresses.cursor as any).firstBatch;
  }
}
