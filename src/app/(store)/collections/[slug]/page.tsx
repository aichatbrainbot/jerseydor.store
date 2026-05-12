import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCollectionBySlug, collections } from '@/data/collections';
import { ProductCard } from '@/components/ProductCard';
import type { Metadata } from 'next';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPublishedProducts } from '@/lib/catalog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
      images: [collection.image || 'https://jerseydor.store/og-image.png'],
      url: `/collections/${collection.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: collection.title,
      description: collection.seoDescription,
      images: [collection.image || 'https://jerseydor.store/og-image.png'],
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.seoDescription,
    url: `${SITE_URL}/collections/${collection.slug}`,
    image: collection.image,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/products/${product.slug}`,
      })),
    },
  };

  return (
    <div className="w-full pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          sizes="100vw"
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

      {collection.content && (
        <section className="brand-container pt-14 md:pt-20">
          <div className="max-w-3xl prose prose-invert prose-p:text-muted-foreground prose-p:leading-loose prose-p:text-lg font-light">
            <h2 className="sr-only">About {collection.title}</h2>
            <p>{collection.content}</p>
          </div>
        </section>
      )}

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

      {collection.faqs && collection.faqs.length > 0 && (
        <section className="border-t border-border/60 bg-card/25 py-16 md:py-24">
          <div className="brand-container grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="brand-eyebrow mb-4">Questions</p>
              <h2 className="font-heading text-3xl font-black md:text-5xl">{collection.title} FAQs</h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground">Common details about sizing, fit, and styles in this collection.</p>
            </div>
            <Accordion className="space-y-3">
              {collection.faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="rounded-lg border border-border/70 bg-background/50 px-5">
                  <AccordionTrigger className="py-5 text-left font-heading text-lg font-bold hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="pb-5 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {collections.filter(c => c.slug !== collection.slug).length > 0 && (
        <section className="border-t border-border/60 bg-card/25 py-16 md:py-24">
          <div className="brand-container">
            <div className="mb-10">
              <p className="brand-eyebrow mb-4">Keep browsing</p>
              <h2 className="font-heading text-3xl font-black md:text-5xl">Explore other collections</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collections
                .filter(c => c.slug !== collection.slug)
                .slice(0, 3)
                .map((c) => (
                <Link key={c.slug} href={`/collections/${c.slug}`} className="group relative min-h-[280px] overflow-hidden rounded-lg border border-border/60 bg-muted">
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    className="object-cover opacity-75 transition duration-700 group-hover:scale-[1.035]"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,7,12,0.88),rgba(5,7,12,0.14))]" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-display text-xs uppercase text-primary">Collection</p>
                    <h3 className="mt-2 font-heading text-2xl font-black">{c.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{c.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
