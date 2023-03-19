import { hexToNumber } from 'web3-utils';
import { z } from 'zod';
import { TransactionDto } from './transaction.dto';

export const BlockDto = z.object({
  baseFeePerGas: z
    .string()
    .optional()
    .transform((value: string | undefined) => {
      if (!value) return undefined;
      return hexToNumber(value);
    }),
  blockExtraData: z.string().optional(),
  difficulty: z.string().transform(hexToNumber),
  extDataGasUsed: z.string().optional(),
  extDataHash: z.string().optional(),
  extraData: z.string().optional(),
  gasLimit: z.string().transform(hexToNumber),
  gasUsed: z.string().transform(hexToNumber),
  hash: z.string(),
  logsBloom: z.string(),
  miner: z.string(),
  number: z.string().transform(hexToNumber),
  mixHash: z.string(),
  nonce: z.string(),
  parentHash: z.string(),
  receiptsRoot: z.string(),
  sha3Uncles: z.string(),
  size: z.string().transform(hexToNumber),
  stateRoot: z.string(),
  timestamp: z.string().transform(hexToNumber),
  totalDifficulty: z.coerce.number(),
  transactions: z.array(TransactionDto),
  transactionsRoot: z.string(),
});

export type BlockDto = z.infer<typeof BlockDto>;
