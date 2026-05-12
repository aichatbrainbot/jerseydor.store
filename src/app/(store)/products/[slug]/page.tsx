import { notFound } from 'next/navigation';
import { Check, RotateCcw, Ruler, ShieldCheck, Truck } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { AddToBagForm } from '@/components/AddToBagForm';
import { ProductGallery } from '@/components/ProductGallery';
import { Price } from '@/components/Price';
import type { Product } from '@/data/products';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { getPublishedProductBySlug, getPublishedProducts } from '@/lib/catalog';

const SITE_URL = 'https://jerseydor.store';

type Props = {
  params: Promise<{ slug: string }>;
};

function getSchemaAvailability(inventoryStatus: Product['inventoryStatus']) {
  return inventoryStatus === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock';
}

function getSchemaCondition(condition: Product['condition']) {
  if (condition === 'used') return 'https://schema.org/UsedCondition';
  if (condition === 'refurbished') return 'https://schema.org/RefurbishedCondition';
  return 'https://schema.org/NewCondition';
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const product = getPublishedProductBySlug(resolvedParams.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const description = product.description.slice(0, 160).replace(/#/g, '').trim();

  return {
    title: product.title,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: product.title,
      description,
      images: [product.image || 'https://jerseydor.store/og-image.png'],
      url: `/products/${product.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: [product.image || 'https://jerseydor.store/og-image.png'],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  const product = getPublishedProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  let relatedProducts = getPublishedProducts()
    .filter(p => p.collectionSlug === product.collectionSlug)
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  if (relatedProducts.length < 4) {
    const fallbackProducts = getPublishedProducts()
      .filter(p => p.id !== product.id && !relatedProducts.some(r => r.id === p.id))
      .slice(0, 4 - relatedProducts.length);
    relatedProducts = [...relatedProducts, ...fallbackProducts];
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: [product.image, ...product.gallery],
    description: product.description.slice(0, 160).replace(/#/g, '').trim(),
    brand: product.brand
      ? {
          '@type': 'Brand',
          name: product.brand,
        }
      : undefined,
    sku: product.sku,
    mpn: product.mpn,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      itemCondition: getSchemaCondition(product.condition),
      availability: getSchemaAvailability(product.inventoryStatus),
    },
  };
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
        name: product.title,
        item: `${SITE_URL}/products/${product.slug}`,
      },
    ],
  };

  return (
    <div className="w-full pb-36 md:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <section className="brand-container grid gap-5 py-4 md:gap-6 md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,480px)] lg:items-start lg:gap-8">
        <ProductGallery
          title={product.title}
          images={[product.image, ...product.gallery]}
          collectionLabel={product.collectionSlug.replaceAll('-', ' ')}
        />

        <aside className="rounded-lg border border-border/70 bg-card/45 p-5 shadow-2xl shadow-black/30 backdrop-blur-sm md:p-7 lg:sticky lg:top-24 lg:h-fit">
          <div className="mb-6 flex flex-wrap gap-2">
            {product.badges.map((badge) => (
              <span key={badge} className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-display text-xs uppercase text-primary">
                {badge}
              </span>
            ))}
          </div>

          <h1 className="font-heading text-3xl font-black leading-tight md:text-6xl">{product.title}</h1>
          <Price amount={product.price} className="mt-5 block font-display text-2xl font-semibold text-primary" />
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Real catalog photography, selectable sizing, and optional name and number details where available.
          </p>

          <AddToBagForm
            product={{
              slug: product.slug,
              title: product.title,
              price: product.price,
              image: product.image,
              isCustomizable: product.isCustomizable,
            }}
          />

          <div className="mt-6 grid gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-sm border border-border/60 bg-background/40 p-3">
              <Truck className="size-4 text-primary" />
              <span>Free shipping over $150</span>
            </div>
            <div className="flex items-center gap-3 rounded-sm border border-border/60 bg-background/40 p-3">
              <Ruler className="size-4 text-primary" />
              <span>Streetwear fit guide</span>
            </div>
            <div className="flex items-center gap-3 rounded-sm border border-border/60 bg-background/40 p-3">
              <RotateCcw className="size-4 text-primary" />
              <span>Easy size support</span>
            </div>
            <div className="flex items-center gap-3 rounded-sm border border-border/60 bg-background/40 p-3">
              <ShieldCheck className="size-4 text-primary" />
              <span>Real product imagery</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="brand-container border-y border-border/60 py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Fit note', copy: 'Choose your usual streetwear size for a relaxed look, or size down for a closer matchday fit.' },
            { title: 'Customization', copy: product.isCustomizable ? 'Name and number are saved with your bag item before checkout.' : 'This item is sold without name and number customization.' },
            { title: 'Delivery', copy: 'Shipping is calculated at checkout, with free shipping shown for larger orders.' },
          ].map((item) => (
            <div key={item.title} className="brand-card p-5">
              <p className="font-display text-xs font-semibold uppercase text-primary">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="brand-container grid gap-10 py-14 md:grid-cols-[0.75fr_1.25fr] md:py-20">
        <div>
          <p className="brand-eyebrow mb-4">Product story</p>
          <h2 className="font-heading text-3xl font-black md:text-5xl">Designed like a garment, not a souvenir.</h2>
        </div>
        <div className="prose prose-invert max-w-none prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
          <ReactMarkdown>{product.description}</ReactMarkdown>
        </div>
      </section>

      <section className="brand-container py-14 md:py-20">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {product.features.map((feature) => (
            <div key={feature} className="brand-card flex items-center gap-3 p-4">
              <Check className="size-4 text-primary" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="border-t border-border/60 bg-card/25 py-16 md:py-24">
          <div className="brand-container">
            <div className="mb-10">
              <p className="brand-eyebrow mb-4">Complete the rail</p>
              <h2 className="font-heading text-3xl font-black md:text-5xl">Related pieces</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
