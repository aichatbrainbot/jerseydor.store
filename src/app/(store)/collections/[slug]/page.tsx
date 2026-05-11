import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCollectionBySlug, collections } from '@/data/collections';
import { ProductCard } from '@/components/ProductCard';
import type { Metadata } from 'next';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPublishedProducts } from '@/lib/catalog';

const SITE_URL = 'https://jerseydor.store';
const MIN_INDEXABLE_COLLECTION_PRODUCTS = 4;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CollectionSearchParams>;
};

type CollectionSearchParams = {
  page?: string;
  sort?: string;
  color?: string;
  size?: string;
  category?: string;
};

const PAGE_SIZE = 48;
const COLLECTION_NOINDEX_PARAMS = ['page', 'sort', 'color', 'size', 'category'] as const;

function hasCollectionSearchParam(searchParams: CollectionSearchParams) {
  return COLLECTION_NOINDEX_PARAMS.some((key) => {
    const value = searchParams[key];
    return typeof value === 'string' && value.trim().length > 0;
  });
}

function isThinCollection(collectionSlug: string) {
  return getPublishedProducts().filter((product) => product.collectionSlug === collectionSlug).length < MIN_INDEXABLE_COLLECTION_PRODUCTS;
}

export async function generateMetadata(
  { params, searchParams }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const collection = getCollectionBySlug(resolvedParams.slug);

  if (!collection) {
    return {
      title: 'Collection Not Found',
    };
  }

  return {
    title: collection.title,
    description: collection.seoDescription,
    alternates: {
      canonical: `/collections/${collection.slug}`,
    },
    robots: hasCollectionSearchParam(resolvedSearchParams) || isThinCollection(collection.slug)
      ? {
          index: false,
          follow: true,
        }
      : undefined,
    openGraph: {
      title: collection.title,
      description: collection.seoDescription,
      images: [collection.image],
    },
  };
}

export async function generateStaticParams() {
  return collections.map((collection) => ({
    slug: collection.slug,
  }));
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const collection = getCollectionBySlug(resolvedParams.slug);

  if (!collection) {
    notFound();
  }

  const products = getPublishedProducts().filter((product) => product.collectionSlug === collection.slug);
  const currentPage = Math.max(1, Number(resolvedSearchParams.page ?? '1') || 1);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const visibleProducts = products.slice(start, start + PAGE_SIZE);
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${SITE_URL}/products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: collection.title,
        item: `${SITE_URL}/collections/${collection.slug}`,
      },
    ],
  };

  return (
    <div className="w-full pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header className="relative min-h-[56svh] overflow-hidden border-b border-border/60">
        <Image
          src={collection.image}
          alt={collection.title}
          fill
          className="object-cover opacity-52"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,12,0.92),rgba(5,7,12,0.42))]" />
        <div className="brand-container relative z-10 flex min-h-[56svh] items-end pb-12 pt-24">
          <div className="max-w-3xl">
            <p className="brand-eyebrow mb-5">Collection / {products.length} pieces</p>
            <h1 className="brand-title">{collection.title}</h1>
            <p className="brand-subtitle mt-6">{collection.seoDescription}</p>
          </div>
        </div>
      </header>

      <section className="brand-container py-14 md:py-20">
        <div className="mb-8 grid gap-4 border-y border-border/60 py-5 font-display text-xs uppercase text-muted-foreground sm:grid-cols-3">
          <p>Original graphics</p>
          <p>Streetwear fit</p>
          <p>Limited seasonal drops</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="brand-panel py-24 text-center text-muted-foreground">
            No products found in this collection.
          </div>
        )}

        {products.length > PAGE_SIZE && (
          <nav className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
            <p className="font-display text-sm text-muted-foreground">
              Page {page.toLocaleString('en-US')} of {totalPages.toLocaleString('en-US')}
            </p>
            <div className="flex gap-3">
              <Link
                href={`/collections/${collection.slug}?page=${Math.max(1, page - 1)}`}
                className={cn(buttonVariants({ variant: 'outline' }), page === 1 && 'pointer-events-none opacity-40')}
              >
                Previous
              </Link>
              <Link
                href={`/collections/${collection.slug}?page=${Math.min(totalPages, page + 1)}`}
                className={cn(buttonVariants(), page === totalPages && 'pointer-events-none opacity-40')}
              >
                Next
              </Link>
            </div>
          </nav>
        )}
      </section>
    </div>
  );
}
