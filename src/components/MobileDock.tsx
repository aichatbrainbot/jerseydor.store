'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Menu, Search, ShoppingBag, Store, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { CurrencySelector } from '@/components/CurrencySelector';
import { cn } from '@/lib/utils';
import { getCartItemCount, readStoredCartItems, subscribeToCart } from '@/lib/cart';

const categoryLinks = [
  { href: '/products', label: 'All Products' },
  { href: '/collections/football-shirts', label: 'Football Shirts' },
  { href: '/collections/retro-archive', label: 'Retro Jerseys' },
  { href: '/collections/player-version', label: 'Player Version' },
  { href: '/collections/womens-shirts', label: 'Women Shirts' },
  { href: '/collections/kids-kits', label: 'Kids Kits' },
  { href: '/collections/training-and-apparel', label: 'Training & Apparel' },
];

function readCartCount() {
  return getCartItemCount(readStoredCartItems());
}

export function MobileDock() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const syncCartCount = () => setCartCount(readCartCount());

    syncCartCount();
    return subscribeToCart(syncCartCount);
  }, []);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get('query') ?? '').trim();

    router.push(query ? `/products?query=${encodeURIComponent(query)}` : '/products');
    setIsSearchOpen(false);
    setIsMenuOpen(false);
  }

  const items = [
    { href: '/', label: 'Home', icon: Home, active: pathname === '/' },
    { href: '/products', label: 'Shop', icon: Store, active: pathname.startsWith('/products') || pathname.startsWith('/collections') },
    { label: 'Search', icon: Search, action: () => setIsSearchOpen(true), active: isSearchOpen },
    { href: '/cart', label: 'Bag', icon: ShoppingBag, active: pathname === '/cart', badge: cartCount },
    { label: 'Menu', icon: Menu, action: () => setIsMenuOpen(true), active: isMenuOpen },
  ];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 rounded-[2rem] border border-primary/20 bg-background/88 p-2 shadow-[0_-18px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          {items.map((item) => {
            const Icon = item.icon;
            const content = (
              <span className="relative flex flex-col items-center gap-1">
                <span
                  className={cn(
                    'grid size-9 place-items-center rounded-full border transition',
                    item.active
                      ? 'border-primary/40 bg-primary/15 text-primary'
                      : 'border-transparent text-muted-foreground'
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className={cn('font-display text-[10px] font-semibold', item.active ? 'text-primary' : 'text-muted-foreground')}>
                  {item.label}
                </span>
                {item.badge ? (
                  <span className="absolute right-3 top-0 grid min-w-4 place-items-center rounded-full bg-primary px-1 font-display text-[9px] font-black leading-4 text-primary-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </span>
            );

            if ('href' in item && item.href) {
              return (
                <Link key={item.label} href={item.href} aria-label={item.label}>
                  {content}
                </Link>
              );
            }

            return (
              <button key={item.label} type="button" aria-label={item.label} onClick={item.action}>
                {content}
              </button>
            );
          })}
        </div>
      </nav>

      <div
        aria-hidden={!isSearchOpen}
        className={cn(
          'fixed inset-0 z-[60] bg-background/94 px-4 py-6 backdrop-blur-xl transition duration-200 md:hidden',
          isSearchOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="mx-auto max-w-md">
          <div className="mb-5 flex items-center justify-between">
            <p className="brand-eyebrow">Search</p>
            <button type="button" className="grid size-10 place-items-center rounded-full border border-border/70" onClick={() => setIsSearchOpen(false)}>
              <X className="size-5" />
            </button>
          </div>
          <form onSubmit={handleSearchSubmit} className="rounded-full border border-primary/25 bg-card/60 px-4 py-2">
            <div className="flex items-center gap-3">
              <Search className="size-4 text-primary" />
              <input
                autoFocus={isSearchOpen}
                name="query"
                type="search"
                placeholder="Search Arsenal, Chelsea, retro..."
                className="h-12 flex-1 bg-transparent font-display text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </form>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {[
              { label: 'arsenal jersey', href: '/collections/football-shirts' },
              { label: 'chelsea shirts', href: '/collections/football-shirts' },
              { label: 'retro jerseys', href: '/collections/retro-archive' },
              { label: 'kids kits', href: '/collections/kids-kits' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full border border-border/70 px-3 py-2 text-center font-display text-xs font-semibold text-muted-foreground"
                onClick={() => setIsSearchOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div
        aria-hidden={!isMenuOpen}
        className={cn(
          'fixed inset-0 z-[60] bg-background/94 px-4 py-6 backdrop-blur-xl transition duration-200 md:hidden',
          isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <div className="mx-auto flex h-full max-w-md flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="brand-eyebrow">JerseyDor</p>
              <h2 className="mt-2 font-heading text-3xl font-black">Menu</h2>
            </div>
            <button type="button" className="grid size-10 place-items-center rounded-full border border-border/70" onClick={() => setIsMenuOpen(false)}>
              <X className="size-5" />
            </button>
          </div>

          <CurrencySelector className="mb-5 w-full" />

          <div className="grid gap-2">
            {categoryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-md border border-border/70 bg-card/55 px-4 py-3 font-display text-sm font-semibold text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
                <span className="text-primary">-&gt;</span>
              </Link>
            ))}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
            <Link href="/blog" className="rounded-full border border-border/70 px-4 py-3 text-center font-display text-xs font-semibold uppercase text-muted-foreground" onClick={() => setIsMenuOpen(false)}>
              Journal
            </Link>
            <Link href="/checkout" className="rounded-full border border-border/70 px-4 py-3 text-center font-display text-xs font-semibold uppercase text-muted-foreground" onClick={() => setIsMenuOpen(false)}>
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
