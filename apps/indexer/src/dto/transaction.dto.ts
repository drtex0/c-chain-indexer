import { z } from 'zod';
import { isAddress, hexToNumber } from 'web3-utils';

const Address = z.string().refine((value) => {
  return (
    isAddress(value),
    {
      message: 'Invalid Address',
    }
  );
});

export const TransactionDto = z.object({
  blockHash: z.string(),
  blockNumber: z.string().transform(hexToNumber),
  chainId: z.string().transform(hexToNumber),
  from: Address,
  gas: z.string().transform(hexToNumber),
  gasPrice: z.coerce.number(),
  hash: z.string(),
  input: z.string(),
  nonce: z.string().transform(hexToNumber),
  to: Address.nullable(),
  transactionIndex: z.string().transform(hexToNumber),
  type: z.string().transform(hexToNumber),
  value: z.string(),
});

export type TransactionDto = z.infer<typeof TransactionDto>;
