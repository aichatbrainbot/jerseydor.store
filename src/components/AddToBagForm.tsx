'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Price } from '@/components/Price';
import { createCartItem, readStoredCartItems, saveStoredCartItems, upsertCartItem, type CartProduct } from '@/lib/cart';

export function AddToBagForm({ product }: { product: CartProduct }) {
  const [size, setSize] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!size) {
      setError('Choose a size before adding to bag.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const customName = String(formData.get('name') ?? '').trim().toUpperCase();
    const customNumber = String(formData.get('number') ?? '').trim();
    const nextItem = createCartItem({
      product,
      size,
      customName,
      customNumber,
    });

    saveStoredCartItems(upsertCartItem(readStoredCartItems(), nextItem));
    router.push('/cart');
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-6 border-t border-border/60 pt-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="size" className="font-display text-xs uppercase text-muted-foreground">Size</Label>
          <span className="font-display text-xs text-primary">Fit guide below</span>
        </div>
        <Select value={size} onValueChange={(value) => {
          setSize(value ?? '');
          setError('');
        }}>
          <SelectTrigger id="size" className="h-12 rounded-md border-border/70 bg-background/70">
            <SelectValue placeholder="Select a size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="s">Small</SelectItem>
            <SelectItem value="m">Medium</SelectItem>
            <SelectItem value="l">Large</SelectItem>
            <SelectItem value="xl">X-Large</SelectItem>
            <SelectItem value="xxl">XX-Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {product.isCustomizable && (
        <div className="space-y-4 border-t border-border/60 pt-5">
          <div>
            <h2 className="font-display text-xs font-semibold uppercase text-muted-foreground">Customization</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Add a name and number for a matchday-ready shirt.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="YAMAL" maxLength={12} className="h-12 rounded-md bg-background/70" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Number</Label>
              <Input id="number" name="number" type="number" placeholder="19" min={0} max={99} className="h-12 rounded-md bg-background/70" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full">
        Add to Bag
        <ArrowRight className="size-4" />
      </Button>

      <div className="fixed inset-x-0 bottom-[5.75rem] z-40 border-y border-border/70 bg-background/92 px-4 py-3 shadow-[0_-20px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-display text-[10px] font-semibold uppercase text-muted-foreground">
              Ready to add
            </p>
            <Price amount={product.price} className="mt-0.5 block font-display text-sm font-bold text-primary" />
          </div>
          <Button type="submit" className="h-11 rounded-full px-5">
            Add to Bag
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
