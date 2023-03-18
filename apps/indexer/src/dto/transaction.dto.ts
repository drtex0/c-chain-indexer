import { z } from 'zod';
import web3 from 'web3';

const Address = z.string().refine((value) => {
  return (
    web3.utils.isAddress(value),
    {
      message: 'Invalid Address',
    }
  );
});

export const TransactionDto = z.object({
  blockHash: z.string(),
  blockNumber: z.number(),
  chainId: z.string(),
  from: Address,
  gas: z.number(),
  gasPrice: z.coerce.number(),
  hash: z.string(),
  input: z.string(),
  nonce: z.number(),
  to: Address.nullable(),
  transactionIndex: z.number().min(0),
  value: z.string(),
});

export type TransactionDto = z.infer<typeof TransactionDto>;
