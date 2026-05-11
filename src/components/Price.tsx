'use client';

import { formatMarketPrice } from '@/data/currency';
import { useMarket } from '@/components/CurrencySelector';

export function Price({ amount, className }: { amount: number; className?: string }) {
  const market = useMarket();

  return (
    <span className={className}>
      {formatMarketPrice(amount, market)}
    </span>
  );
}
