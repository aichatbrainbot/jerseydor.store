import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, RotateCcw, Shirt, Star, Truck } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { buttonVariants } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { Price } from '@/components/Price';
import { collections } from '@/data/collections';
import type { Product } from '@/data/products';
import { getPublishedProducts } from '@/lib/catalog';
import { cn } from '@/lib/utils';

function uniqueProducts(items: Product[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

function byQuery(products: Product[], queries: string[], limit: number) {
  const normalized = queries.map((query) => query.toLowerCase());
  return uniqueProducts(
    products.filter((product) => {
      const title = product.title.toLowerCase();
      return normalized.some((query) => title.includes(query));
    })
  ).slice(0, limit);
}

function byCollection(products: Product[], collectionSlug: string, limit: number) {
  return products.filter((product) => product.collectionSlug === collectionSlug).slice(0, limit);
}

const keywordLinks = [
  { label: 'club football shirts', href: '/collections/football-shirts' },
  { label: 'retro jerseys', href: '/collections/retro-archive' },
  { label: 'player version shirts', href: '/collections/player-version' },
  { label: 'kids football kits', href: '/collections/kids-kits' },
  { label: 'training apparel', href: '/collections/training-and-apparel' },
];

const trustItems = [
  { icon: Truck, title: 'Fast dispatch', copy: 'Catalog-ready products with clear pricing and real images.' },
  { icon: Shirt, title: 'Name & number', copy: 'Customizable shirt options stay visible on product pages.' },
  { icon: RotateCcw, title: 'Easy browsing', copy: 'Collections, search links, and pagination make a large catalog usable.' },
];

export default function Home() {
  const products = getPublishedProducts();
  const heroProducts = byQuery(products, ['barcelona', 'arsenal', 'france 2026', 'portugal 2026'], 4);
  const worldCupProducts = byQuery(products, ['2026', 'world cup', 'france 2026', 'portugal 2026', 'argentina 2026', 'scotland 2026'], 4);
  const topSellingProducts = byQuery(products, ['lamine', 'arsenal', 'barcelona', 'portugal', 'napoli', 'france', 'chelsea', 'bayern'], 4);
  const newAdditions = products.filter((product) => /shirt|jersey|kit/i.test(product.title)).slice(0, 4);
  const retroProducts = byCollection(products, 'retro-archive', 4);
  const trainingProducts = byCollection(products, 'training-and-apparel', 4);
  const playerVersionProducts = byCollection(products, 'player-version', 4);
  const featuredHero = heroProducts[0] ?? products[0];

  return (
    <div className="w-full overflow-hidden">
      <section className="border-b border-border/60 bg-primary text-primary-foreground">
        <div className="brand-container flex min-h-10 flex-wrap items-center justify-center gap-x-8 gap-y-2 py-2 font-display text-xs font-bold uppercase">
          <span>Buy 2 get 1 free</span>
          <span>Custom name & number</span>
          <span>Real catalog images</span>
          <span>{products.length.toLocaleString('en-US')} products</span>
        </div>
      </section>

      <section className="brand-container grid gap-4 py-4 md:gap-6 md:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <div className="brand-panel order-2 flex min-h-[420px] flex-col justify-end overflow-hidden p-5 md:min-h-[480px] md:p-10 lg:order-1">
          <p className="brand-eyebrow mb-5">Football shirts / full catalog / 2026 edits</p>
          <h1 className="font-heading text-4xl font-black leading-[0.92] md:text-7xl">
            The store for football shirts that look good off pitch.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
            JerseyDor is the store for football shirts built for off-pitch style, with real product images across
            World Cup 26 shirts, club jerseys, retro jerseys, kids kits, women shirts, and player version products.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
            {['Dark retail', 'Real images', 'Global prices'].map((item) => (
              <span key={item} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-center font-display text-[10px] font-semibold uppercase text-primary">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto')}>
              Shop All Products
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/collections/football-shirts" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'w-full sm:w-auto')}>
              Browse Shirts
            </Link>
          </div>
        </div>

        <div className="order-1 grid min-h-[560px] gap-3 sm:grid-cols-2 md:min-h-[480px] lg:order-2">
          <Link href={`/products/${featuredHero.slug}`} className="group relative min-h-[560px] overflow-hidden rounded-lg border border-border/60 bg-muted sm:row-span-2 md:min-h-0">
            <Image
              src={featuredHero.image}
              alt={featuredHero.title}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.035]"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,7,12,0.82),rgba(5,7,12,0.08))]" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-display text-xs uppercase text-primary">Featured product</p>
              <h2 className="mt-2 font-heading text-2xl font-black">{featuredHero.title}</h2>
              <Price amount={featuredHero.price} className="mt-1 block font-display text-sm text-muted-foreground" />
            </div>
          </Link>
          {heroProducts.slice(1, 4).map((product) => (
            <Link key={product.slug} href={`/products/${product.slug}`} className="group relative hidden min-h-[150px] overflow-hidden rounded-lg border border-border/60 bg-muted sm:block">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,7,12,0.82),rgba(5,7,12,0.05))]" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-heading text-lg font-black">{product.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="brand-container pb-12">
        <div className="grid gap-3 md:grid-cols-3">
          {trustItems.map((item) => (
            <div key={item.title} className="brand-card flex gap-4 p-4">
              <item.icon className="mt-1 size-5 text-primary" />
              <div>
                <h2 className="font-heading text-lg font-bold">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProductSection
        eyebrow="World Cup 26"
        title="World Cup 26 shirts and national team edits."
        href="/collections/football-shirts"
        products={worldCupProducts}
      />

      <ProductSection
        eyebrow="Top selling"
        title="Products people search for first."
        href="/products"
        products={topSellingProducts}
        shaded
      />

      <section className="brand-container py-16 md:py-24">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="brand-eyebrow mb-4">Shop by category</p>
            <h2 className="font-heading text-3xl font-black md:text-5xl">Collections built for search and browsing.</h2>
          </div>
          <Link href="/products" className="font-display text-sm font-semibold text-primary hover:text-accent">
            View catalog
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link key={collection.slug} href={`/collections/${collection.slug}`} className="group relative min-h-[280px] overflow-hidden rounded-lg border border-border/60 bg-muted">
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                className="object-cover opacity-75 transition duration-700 group-hover:scale-[1.035]"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,7,12,0.88),rgba(5,7,12,0.14))]" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-display text-xs uppercase text-primary">Collection</p>
                <h3 className="mt-2 font-heading text-2xl font-black">{collection.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{collection.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ProductSection
        eyebrow="New additions"
        title="Fresh catalog products with real product imagery."
        href="/products"
        products={newAdditions}
      />

      <section className="brand-container py-16 md:py-24">
        <div className="relative min-h-[460px] overflow-hidden rounded-lg border border-border/60 bg-muted">
          {retroProducts[0] && (
            <Image
              src={retroProducts[0].image}
              alt={retroProducts[0].title}
              fill
              className="object-cover opacity-70"
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,12,0.94),rgba(5,7,12,0.34))]" />
          <div className="absolute bottom-0 left-0 max-w-2xl p-6 md:p-10">
            <p className="brand-eyebrow mb-4">Retro jerseys</p>
            <h2 className="font-heading text-4xl font-black leading-tight md:text-6xl">Archive shirts for people who care about the details.</h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Give search engines and buyers a clear retro destination: older seasons, reissues, anniversary pieces, and nostalgic shirt designs.
            </p>
            <Link href="/collections/retro-archive" className={cn(buttonVariants({ size: 'lg' }), 'mt-8')}>
              Shop Retro Jerseys
            </Link>
          </div>
        </div>
      </section>

      <ProductSection
        eyebrow="Retro products"
        title="Archive pieces from the catalog."
        href="/collections/retro-archive"
        products={retroProducts}
      />

      <section className="border-y border-border/60 bg-card/25 py-16 md:py-24">
        <div className="brand-container grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="brand-eyebrow mb-4">Buyer guide</p>
            <h2 className="font-heading text-3xl font-black leading-tight md:text-5xl">Replica vs player version, explained clearly.</h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Competitors rank because they educate buyers. We add a clean guide so shoppers understand fit, fabric, and price before choosing.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="brand-panel p-5">
              <p className="font-display text-xs font-semibold uppercase text-primary">Replica / Fan version</p>
              <h3 className="mt-4 font-heading text-2xl font-black">Relaxed and everyday.</h3>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="size-4 text-primary" /> Easier fit for casual wear</li>
                <li className="flex gap-2"><CheckCircle2 className="size-4 text-primary" /> Lower price point</li>
                <li className="flex gap-2"><CheckCircle2 className="size-4 text-primary" /> Best for most buyers</li>
              </ul>
            </div>
            <div className="brand-panel p-5">
              <p className="font-display text-xs font-semibold uppercase text-primary">Player version</p>
              <h3 className="mt-4 font-heading text-2xl font-black">Slimmer and sharper.</h3>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="size-4 text-primary" /> Closer athletic fit</li>
                <li className="flex gap-2"><CheckCircle2 className="size-4 text-primary" /> Premium construction details</li>
                <li className="flex gap-2"><CheckCircle2 className="size-4 text-primary" /> Best for collectors</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ProductSection
        eyebrow="Player version"
        title="Sharper fit products for collectors."
        href="/collections/player-version"
        products={playerVersionProducts}
      />

      <ProductSection
        eyebrow="Training & apparel"
        title="Pants, jackets, caps, shorts, and off-pitch pieces."
        href="/collections/training-and-apparel"
        products={trainingProducts}
        shaded
      />

      <section className="brand-container py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="brand-eyebrow mb-4">Popular searches</p>
            <h2 className="font-heading text-3xl font-black leading-tight md:text-5xl">SEO paths with real product intent.</h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              These category hubs link directly into crawlable football shirt collections instead of parameter-based search URLs.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {keywordLinks.map((item) => (
              <Link key={item.label} href={item.href} className="brand-card flex items-center justify-between gap-4 p-4">
                <span className="font-display text-sm font-semibold text-foreground">{item.label}</span>
                <ArrowRight className="size-4 text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/25 py-16 md:py-24">
        <div className="brand-container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="brand-eyebrow mb-4">Reviews</p>
            <h2 className="font-heading text-3xl font-black md:text-5xl">Add social proof before the footer.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {['Clean product images and easy browsing.', 'Found the shirt by team search fast.', 'The category pages make the catalog feel organized.'].map((copy, index) => (
              <div key={copy} className="brand-card p-5">
                <div className="mb-4 flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{copy}</p>
                <p className="mt-5 font-display text-xs uppercase text-foreground">Customer {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-container py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="brand-eyebrow mb-4">FAQs</p>
            <h2 className="font-heading text-3xl font-black md:text-5xl">Answer the questions that block checkout.</h2>
          </div>
          <Accordion className="space-y-3">
            <AccordionItem value="item-1" className="rounded-lg border border-border/70 bg-background/50 px-5">
              <AccordionTrigger className="py-5 text-left font-heading text-lg font-bold hover:no-underline">Can I add a custom name and number?</AccordionTrigger>
              <AccordionContent className="pb-5 text-muted-foreground">
                Yes. Products marked as customizable include name and number fields on the product page.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="rounded-lg border border-border/70 bg-background/50 px-5">
              <AccordionTrigger className="py-5 text-left font-heading text-lg font-bold hover:no-underline">How is the catalog organized?</AccordionTrigger>
              <AccordionContent className="pb-5 text-muted-foreground">
                Products are grouped into football shirts, retro jerseys, player version, women shirts, kids kits, and training apparel.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="rounded-lg border border-border/70 bg-background/50 px-5">
              <AccordionTrigger className="py-5 text-left font-heading text-lg font-bold hover:no-underline">Why so many product pages?</AccordionTrigger>
              <AccordionContent className="pb-5 text-muted-foreground">
                Large catalogs need clear collection pages, keyword paths, and paginated product grids so buyers and search engines can navigate them.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

    </div>
  );
}

function ProductSection({
  eyebrow,
  title,
  href,
  products: sectionProducts,
  shaded = false,
}: {
  eyebrow: string;
  title: string;
  href: string;
  products: Product[];
  shaded?: boolean;
}) {
  if (sectionProducts.length === 0) return null;

  return (
    <section className={cn(shaded && 'border-y border-border/60 bg-card/25', 'py-16 md:py-24')}>
      <div className="brand-container">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="brand-eyebrow mb-4">{eyebrow}</p>
            <h2 className="font-heading text-3xl font-black md:text-5xl">{title}</h2>
          </div>
          <Link href={href} className="font-display text-sm font-semibold text-primary hover:text-accent">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sectionProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
