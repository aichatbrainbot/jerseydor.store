import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { collections } from '@/data/collections';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { getPublishedProducts } from '@/lib/catalog';

const productsMetadata = {
  title: 'All Products',
  description: 'Explore football shirts and kits including lamine yamal 7 year old jersey, socceroos jersey, chelsea shirts for sale, arsenal jersey, and crystal palace kit searches.',
  keywords: [
    'lamine yamal 7 year old jersey',
    'socceroos jersey',
    'chelsea shirts for sale',
    'arsenal jersey',
    'crystal palace kit',
  ],
} satisfies Metadata;

type ProductSearchParams = {
  page?: string;
  query?: string;
  q?: string;
  collection?: string;
  category?: string;
  price?: string;
  sort?: string;
  color?: string;
  size?: string;
};

type Props = {
  searchParams: Promise<ProductSearchParams>;
};

const PAGE_SIZE = 48;
const PRODUCT_NOINDEX_PARAMS = ['q', 'query', 'sort', 'page', 'color', 'size', 'category', 'collection', 'price'] as const;

function hasSearchParam(searchParams: ProductSearchParams, keys: readonly (keyof ProductSearchParams)[]) {
  return keys.some((key) => {
    const value = searchParams[key];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const shouldNoindex = hasSearchParam(resolvedSearchParams, PRODUCT_NOINDEX_PARAMS);

  return {
    ...productsMetadata,
    alternates: {
      canonical: '/products',
    },
    robots: shouldNoindex
      ? {
          index: false,
          follow: true,
        }
      : undefined,
  };
}

function normalizeQuery(value?: string) {
  return decodeURIComponent(value ?? '')
    .replaceAll('-', ' ')
    .toLowerCase()
    .trim();
}

function matchesQuery(title: string, query: string) {
  if (!query) return true;
  const normalizedTitle = title.toLowerCase();
  const ignoredWords = new Set(['for', 'sale', 'old', 'year', 'jersey', 'jerseys', 'shirt', 'shirts', 'kit', 'kits']);
  const words = query
    .split(/\s+/)
    .map((word) => (word === 'socceroos' ? 'australia' : word))
    .filter((word) => word.length > 1 && !(/^\d+$/.test(word) && Number(word) < 10) && !ignoredWords.has(word));
  return words.every((word) => normalizedTitle.includes(word));
}

function matchesPrice(price: number, priceFilter: string) {
  if (priceFilter === 'under-40') return price < 40;
  if (priceFilter === '40-70') return price >= 40 && price <= 70;
  if (priceFilter === '70-plus') return price > 70;
  return true;
}

export default async function ProductsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const query = normalizeQuery(resolvedSearchParams.query);
  const activeCollection = resolvedSearchParams.collection ?? '';
  const activePrice = resolvedSearchParams.price ?? '';
  const activeSort = resolvedSearchParams.sort ?? 'featured';
  const filteredProducts = getPublishedProducts()
    .filter((product) => matchesQuery(product.title, query))
    .filter((product) => !activeCollection || product.collectionSlug === activeCollection)
    .filter((product) => matchesPrice(product.price, activePrice));
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (activeSort === 'price-asc') return a.price - b.price;
    if (activeSort === 'price-desc') return b.price - a.price;
    if (activeSort === 'name') return a.title.localeCompare(b.title);
    return 0;
  });
  const currentPage = Math.max(1, Number(resolvedSearchParams.page ?? '1') || 1);
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const visibleProducts = sortedProducts.slice(start, start + PAGE_SIZE);

  function productsHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (query) params.set('query', query.replaceAll(' ', '-'));
    if (activeCollection) params.set('collection', activeCollection);
    if (activePrice) params.set('price', activePrice);
    if (activeSort !== 'featured') params.set('sort', activeSort);

    Object.entries(overrides).forEach(([key, value]) => {
      if (!value || value === 'featured') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.delete('page');
    const value = params.toString();
    return value ? `/products?${value}` : '/products';
  }

  function pageHref(pageNumber: number) {
    const params = new URLSearchParams();
    if (query) params.set('query', query.replaceAll(' ', '-'));
    if (activeCollection) params.set('collection', activeCollection);
    if (activePrice) params.set('price', activePrice);
    if (activeSort !== 'featured') params.set('sort', activeSort);
    params.set('page', String(pageNumber));
    return `/products?${params.toString()}`;
  }

  const filterGroups = [
    {
      title: 'Category',
      items: [
        { label: 'All categories', href: productsHref({ collection: undefined }), active: !activeCollection },
        ...collections.map((collection) => ({
          label: collection.title,
          href: productsHref({ collection: collection.slug }),
          active: activeCollection === collection.slug,
        })),
      ],
    },
    {
      title: 'Price',
      items: [
        { label: 'All prices', href: productsHref({ price: undefined }), active: !activePrice },
        { label: 'Under $40', href: productsHref({ price: 'under-40' }), active: activePrice === 'under-40' },
        { label: '$40 - $70', href: productsHref({ price: '40-70' }), active: activePrice === '40-70' },
        { label: '$70+', href: productsHref({ price: '70-plus' }), active: activePrice === '70-plus' },
      ],
    },
    {
      title: 'Sort',
      items: [
        { label: 'Featured', href: productsHref({ sort: 'featured' }), active: activeSort === 'featured' },
        { label: 'Price low to high', href: productsHref({ sort: 'price-asc' }), active: activeSort === 'price-asc' },
        { label: 'Price high to low', href: productsHref({ sort: 'price-desc' }), active: activeSort === 'price-desc' },
        { label: 'Name A-Z', href: productsHref({ sort: 'name' }), active: activeSort === 'name' },
      ],
    },
  ];

  return (
    <div className="brand-container py-14 md:py-24">
      <header className="mb-12 grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-end">
        <div>
          <p className="brand-eyebrow mb-5">Shop</p>
          <h1 className="brand-title">All products</h1>
        </div>
        <p className="brand-subtitle">
          Browse {filteredProducts.length.toLocaleString('en-US')} catalog products{query ? ` for "${query}"` : ''}. Use category, price, and sort filters to find the right shirt faster.
        </p>
      </header>

      <section className="mb-10 space-y-6 rounded-lg border border-border/60 bg-card/35 p-4 md:p-5">
        <div className="grid gap-5 lg:grid-cols-3">
          {filterGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {group.title}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'rounded-full border px-3 py-2 font-display text-xs font-semibold transition',
                      item.active
                        ? 'border-primary/70 bg-primary/15 text-primary'
                        : 'border-border/70 text-muted-foreground hover:border-primary/50 hover:text-primary'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border/60 pt-5">
          <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Popular searches
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              'lamine yamal 7 year old jersey',
              'socceroos jersey',
              'chelsea shirts for sale',
              'arsenal jersey',
              'crystal palace kit',
            ].map((keyword) => (
              <Link
                key={keyword}
                href={`/products?query=${keyword.replaceAll(' ', '-')}`}
                className="rounded-full border border-border/70 px-3 py-2 text-center font-display text-xs font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-primary"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="brand-panel py-20 text-center text-muted-foreground">
          No products found for this keyword yet.
        </div>
      )}

      <nav className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
        <p className="font-display text-sm text-muted-foreground">
          Page {page.toLocaleString('en-US')} of {totalPages.toLocaleString('en-US')}
        </p>
        <div className="flex gap-3">
          <Link
            href={pageHref(Math.max(1, page - 1))}
            className={cn(buttonVariants({ variant: 'outline' }), page === 1 && 'pointer-events-none opacity-40')}
          >
            Previous
          </Link>
          <Link
            href={pageHref(Math.min(totalPages, page + 1))}
            className={cn(buttonVariants(), page === totalPages && 'pointer-events-none opacity-40')}
          >
            Next
          </Link>
        </div>
      </nav>
    </div>
  );
}
