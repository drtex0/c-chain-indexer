import { z } from 'zod';
import { TransactionDto } from './transaction.dto';

export const BlockDto = z.object({
  baseFeePerGas: z.number().positive().optional(),
  blockExtraData: z.string().nonempty(),
  difficulty: z.coerce.number(),
  extDataGasUsed: z.string().optional(),
  extDataHash: z.string(),
  extraData: z.string(),
  gasLimit: z.number(),
  gasUsed: z.number(),
  hash: z.string(),
  logsBloom: z.string(),
  miner: z.string(),
  mixHash: z.string(),
  nonce: z.string(),
  parentHash: z.string(),
  receiptsRoot: z.string(),
  sha3Uncles: z.string(),
  size: z.number(),
  stateRoot: z.string(),
  timestamp: z.number(),
  totalDifficulty: z.coerce.number(),
  transactions: z.array(TransactionDto),
  transactionsRoot: z.string(),
});

export type BlockDto = z.infer<typeof BlockDto>;
