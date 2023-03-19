import { fromWei } from 'web3-utils';
import { z } from 'zod';

export const BalanceDto = z.string().transform((value: string) => {
  return Number(fromWei(value, 'ether'));
});

export type BalanceDto = z.infer<typeof BalanceDto>;
