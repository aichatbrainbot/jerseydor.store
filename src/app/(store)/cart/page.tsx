'use client';

import { useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Price } from '@/components/Price';
import { CheckoutButton } from '@/components/CheckoutButton';
import {
  calculateCartSubtotal,
  readStoredCartItems,
  removeCartItem,
  saveStoredCartItems,
  subscribeToCart,
  updateCartItemQuantity,
  type CartItem,
} from '@/lib/cart';

let lastRawCart = '';
let lastCartSnapshot: CartItem[] = [];

function readCartSnapshot() {
  if (typeof window === 'undefined') return [];

  const raw = JSON.stringify(readStoredCartItems());

  if (raw === lastRawCart) {
    return lastCartSnapshot;
  }

  try {
    lastRawCart = raw;
    lastCartSnapshot = JSON.parse(raw) as CartItem[];
    return lastCartSnapshot;
  } catch {
    lastRawCart = '[]';
    lastCartSnapshot = [];
    return lastCartSnapshot;
  }
}

export default function CartPage() {
  const cartItems = useSyncExternalStore(
    subscribeToCart,
    readCartSnapshot,
    () => []
  );

  function saveCart(nextItems: CartItem[]) {
    saveStoredCartItems(nextItems);
  }

  function updateQuantity(id: string, quantity: number) {
    saveCart(updateCartItemQuantity(cartItems, id, quantity));
  }

  const subtotal = useMemo(
    () => calculateCartSubtotal(cartItems),
    [cartItems]
  );

  return (
    <div className="brand-container min-h-[70vh] py-12 md:py-20">
      <div className="mb-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="brand-eyebrow mb-4">Bag</p>
          <h1 className="font-heading text-4xl font-black md:text-6xl">Your selected pieces.</h1>
        </div>
        <Link href="/products" className="font-display text-sm font-semibold text-primary hover:text-accent">
          Continue shopping
        </Link>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <article key={item.id} className="brand-card grid gap-5 p-4 sm:grid-cols-[132px_1fr]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
                  <Image src={item.image} alt={item.title} fill className="object-cover" sizes="132px" />
                </div>
                <div className="flex flex-col justify-between gap-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-heading text-2xl font-black transition-colors hover:text-primary">
                        <Link href={`/products/${item.slug}`}>{item.title}</Link>
                      </h2>
                      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                        <p>Size: {item.size.toUpperCase()}</p>
                        {item.customName && <p>Name: {item.customName}</p>}
                        {item.customNumber && <p>Number: {item.customNumber}</p>}
                      </div>
                    </div>
                    <Price amount={item.price * item.quantity} className="font-display text-lg font-semibold text-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-border/70 bg-background/50 p-1">
                      <button
                        className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-9 text-center font-display text-sm font-semibold">{item.quantity}</span>
                      <button
                        className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <button
                      className="flex items-center gap-2 font-display text-sm text-muted-foreground transition hover:text-destructive"
                      onClick={() => saveCart(removeCartItem(cartItems, item.id))}
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="brand-panel h-fit space-y-6 p-6 lg:sticky lg:top-24">
            <div>
              <p className="brand-eyebrow mb-3">Summary</p>
              <h2 className="font-heading text-2xl font-black">Order details</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <Price amount={subtotal} className="font-display" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-display">{subtotal >= 150 ? 'Free' : 'Calculated at checkout'}</span>
              </div>
              <div className="editorial-rule" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <Price amount={subtotal} className="font-display" />
              </div>
            </div>

            <CheckoutButton items={cartItems} />
            <p className="text-center text-xs leading-5 text-muted-foreground">
              Checkout is provider-driven. Mock mode works without credentials; Stripe and Shopify activate through environment configuration.
            </p>
          </aside>
        </div>
      ) : (
        <div className="brand-panel py-20 text-center">
          <p className="text-xl text-muted-foreground">Your bag is empty.</p>
          <Link
            href="/products"
            className={cn(buttonVariants({ size: 'lg' }), 'mt-8')}
          >
            Shop the Drop
          </Link>
        </div>
      )}
    </div>
  );
}
