'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CurrencySelector } from '@/components/CurrencySelector';
import { getCartItemCount, readStoredCartItems, subscribeToCart } from '@/lib/cart';

const categoryLinks = [
  { href: '/products', label: 'All Products', description: 'Full catalog' },
  { href: '/collections/football-shirts', label: 'Football Shirts', description: 'Home, away, third' },
  { href: '/collections/player-version', label: 'Player Version', description: 'Athletic fit' },
  { href: '/collections/womens-shirts', label: 'Women Shirts', description: 'Women-fit products' },
  { href: '/collections/kids-kits', label: 'Kids Kits', description: 'Youth and kids sets' },
  { href: '/collections/training-and-apparel', label: 'Training & Apparel', description: 'Pants, jackets, caps' },
];

function readCartCount() {
  if (typeof window === 'undefined') return 0;
  return getCartItemCount(readStoredCartItems());
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

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
    setIsOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/86 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="brand-container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3" aria-label="JerseyDor Home">
            <span className="flex size-9 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-display text-xs font-bold text-primary shadow-[0_0_24px_rgba(205,176,112,0.1)]">
              JD
            </span>
            <span className="font-heading text-lg font-black text-foreground">
              JerseyDor
            </span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            <div className="group relative">
              <Link
                href="/products"
                className="flex items-center gap-1.5 font-display text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Category
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
              </Link>
              <div className="invisible absolute left-1/2 top-full z-50 w-[420px] -translate-x-1/2 pt-5 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="grid grid-cols-2 gap-2 rounded-sm border border-border/70 bg-background/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
                  {categoryLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-sm border border-transparent px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary/10"
                    >
                      <span className="block font-display text-sm font-semibold text-foreground">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/collections/football-shirts" className="font-display text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Shirts
            </Link>
            <Link href="/blog" className="font-display text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Journal
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CurrencySelector compact align="right" className="hidden w-[178px] lg:block" />
          <Link
            href="/products?query=2025-26"
            className="hidden rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-display text-xs font-semibold uppercase text-accent transition-colors hover:border-accent/60 hover:bg-accent/15 md:inline-flex"
          >
            New Drop
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            aria-label={isSearchOpen ? 'Close search' : 'Search'}
            aria-expanded={isSearchOpen}
            onClick={() => setIsSearchOpen((open) => !open)}
          >
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
          <Link href="/cart" className="relative hidden md:block">
            <Button variant="ghost" size="icon" aria-label="Shopping Bag">
              <ShoppingBag className="h-5 w-5" />
            </Button>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full border border-background bg-primary px-1.5 font-display text-[10px] font-black leading-5 text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>
          <Button variant="ghost" size="icon" className="hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t border-border/60 bg-background/96 py-3 shadow-2xl shadow-black/20">
          <form onSubmit={handleSearchSubmit} className="brand-container flex items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              name="query"
              type="search"
              placeholder="Search Arsenal, Chelsea, retro, kids..."
              className="h-11 flex-1 bg-transparent font-display text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="sm" className="rounded-full px-5">
              Search
            </Button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-b border-border/60 bg-background/96 px-4 py-6 shadow-2xl md:hidden">
          <div className="space-y-5">
            <CurrencySelector className="w-full" />
            <Link
              href="/products?query=2025-26"
              className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-display text-xs font-semibold uppercase text-accent"
              onClick={() => setIsOpen(false)}
            >
              New Drop
            </Link>
            <div className="space-y-3">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Category
              </p>
              <div className="grid grid-cols-1 gap-2">
                {categoryLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-sm border border-border/60 bg-card/40 px-3 py-3"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="block font-display text-sm font-semibold text-foreground">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/collections/football-shirts" className="block font-display text-sm font-medium text-foreground hover:text-primary" onClick={() => setIsOpen(false)}>
              Shirts
            </Link>
            <Link href="/blog" className="block font-display text-sm font-medium text-foreground hover:text-primary" onClick={() => setIsOpen(false)}>
              Journal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
