'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CartItem } from '@/lib/cart';

type CheckoutButtonProps = {
  items: CartItem[];
};

type CheckoutResponse = {
  checkoutUrl?: string;
  error?: string;
};

export function CheckoutButton({ items }: CheckoutButtonProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleCheckout() {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            slug: item.slug,
            quantity: item.quantity,
            size: item.size,
            customName: item.customName,
            customNumber: item.customNumber,
          })),
        }),
      });
      const payload = (await response.json()) as CheckoutResponse;

      if (!response.ok || !payload.checkoutUrl) {
        setError(payload.error ?? 'Checkout is not available yet.');
        return;
      }

      window.location.href = payload.checkoutUrl;
    } catch {
      setError('Checkout could not be started. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button type="button" size="lg" className="w-full" disabled={isLoading || items.length === 0} onClick={handleCheckout}>
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
        {isLoading ? 'Preparing checkout' : 'Checkout'}
      </Button>
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs leading-5 text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
