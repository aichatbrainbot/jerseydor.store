'use client';

import Image from 'next/image';
import { Check, ChevronDown, Globe2 } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { DEFAULT_MARKET_CODE, getFlagUrl, getMarketByCode, markets } from '@/data/currency';
import { cn } from '@/lib/utils';

const MARKET_KEY = 'jersey-rail-market';
const MARKET_EVENT = 'jersey-rail-market-updated';

function getStoredMarketCode() {
  if (typeof window === 'undefined') return DEFAULT_MARKET_CODE;
  return window.localStorage.getItem(MARKET_KEY) ?? DEFAULT_MARKET_CODE;
}

function subscribeToMarket(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(MARKET_EVENT, callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(MARKET_EVENT, callback);
  };
}

export function setMarketCode(code: string) {
  window.localStorage.setItem(MARKET_KEY, code);
  window.dispatchEvent(new Event(MARKET_EVENT));
}

export function useMarket() {
  const code = useSyncExternalStore(subscribeToMarket, getStoredMarketCode, () => DEFAULT_MARKET_CODE);
  return getMarketByCode(code);
}

export function CurrencySelector({
  compact = false,
  align = 'left',
  className,
}: {
  compact?: boolean;
  align?: 'left' | 'right';
  className?: string;
}) {
  const market = useMarket();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn('relative min-w-0', className)}>
      <button
        type="button"
        aria-label="Select country and currency"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full min-w-0 items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-2 text-left text-sm backdrop-blur-md transition hover:border-primary/50"
      >
        <Globe2 className="size-4 shrink-0 text-primary" />
        <Image
          src={getFlagUrl(market.code)}
          alt={`${market.country} flag`}
          width={24}
          height={16}
          className="h-4 w-6 shrink-0 rounded-[2px] object-cover"
        />
        <span className="min-w-0 flex-1 truncate font-display text-xs font-semibold text-foreground">
          {compact ? `${market.code} / ${market.currencyCode}` : `${market.country} (${market.currencyLabel})`}
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition', isOpen && 'rotate-180')} />
      </button>

      <div
        aria-hidden={!isOpen}
        className={cn(
          'absolute top-[calc(100%+0.5rem)] z-[70] max-h-80 w-[min(340px,calc(100vw-2rem))] overflow-y-auto rounded-md border border-border/70 bg-background/98 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl transition duration-200',
          align === 'right' ? 'right-0' : 'left-0',
          isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
        )}
      >
        {markets.map((item) => (
          <button
            key={item.code}
            type="button"
            tabIndex={isOpen ? 0 : -1}
            onClick={() => {
              setMarketCode(item.code);
              setIsOpen(false);
            }}
            className={cn(
              'flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition',
              item.code === market.code ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:bg-card hover:text-foreground'
            )}
          >
            <Image
              src={getFlagUrl(item.code)}
              alt={`${item.country} flag`}
              width={24}
              height={16}
              className="h-4 w-6 shrink-0 rounded-[2px] object-cover"
            />
            <span className="min-w-0 flex-1 truncate font-display text-sm font-semibold">
              {item.country}
            </span>
            <span className="shrink-0 font-display text-xs">
              {item.currencyLabel}
            </span>
            {item.code === market.code && <Check className="size-4 shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}
