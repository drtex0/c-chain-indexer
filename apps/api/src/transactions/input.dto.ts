import { z } from 'zod';

export const GetTransactionsForAddressParamsDto = z.object({
  address: z.string(),
});

export const GetTransactionsForAddressQueryDto = z.object({
  address: z.string().optional(),
  page: z.coerce.number().default(1).optional(),
  pageSize: z.coerce.number().int().default(10).optional(),
});

export type GetTransactionsForAddressParamsDto = z.infer<typeof GetTransactionsForAddressParamsDto>;
export type GetTransactionsForAddressQueryDto = z.infer<typeof GetTransactionsForAddressQueryDto>;
