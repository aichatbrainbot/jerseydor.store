import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { blogPosts } from '@/data/blog';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal & Editorials',
  description: 'Football fashion editorials, styling guides, and streetwear culture from JerseyDor.',
  openGraph: {
    title: 'Journal & Editorials',
    description: 'Football fashion editorials, styling guides, and streetwear culture from JerseyDor.',
    url: '/blog',
    images: ['https://jerseydor.store/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Journal & Editorials',
    description: 'Football fashion editorials, styling guides, and streetwear culture from JerseyDor.',
    images: ['https://jerseydor.store/og-image.png'],
  },
};

export default function BlogIndexPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <div className="w-full pb-20">
      <header className="brand-container py-14 md:py-24">
        <p className="brand-eyebrow mb-5">Journal</p>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <h1 className="brand-title">Shirts, styling, and streetwear notes.</h1>
          <p className="brand-subtitle">
          Editorial notes on retro silhouettes, oversized shirts, product styling, and the visual identity behind JerseyDor.
          </p>
        </div>
      </header>

      {featured && (
        <section className="brand-container pb-12 md:pb-20">
          <Link href={`/blog/${featured.slug}`} className="group grid overflow-hidden rounded-lg border border-border/60 bg-card/45 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[360px]">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition duration-700 group-hover:scale-[1.025]"
                priority
              />
            </div>
            <div className="flex flex-col justify-between p-6 md:p-10">
              <div>
                <div className="mb-6 flex items-center gap-4 font-display text-xs uppercase text-muted-foreground">
                  <time dateTime={featured.date}>{new Date(featured.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
                  <span>/</span>
                  <span>{featured.author}</span>
                </div>
                <h2 className="font-heading text-3xl font-black leading-tight md:text-5xl">{featured.title}</h2>
                <p className="mt-5 text-base leading-7 text-muted-foreground">{featured.excerpt}</p>
              </div>
              <div className="mt-8 flex items-center gap-2 font-display text-sm font-semibold text-primary">
                Read feature <ArrowUpRight className="size-4" />
              </div>
            </div>
          </Link>
        </section>
      )}

      <section className="brand-container">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {rest.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group brand-card overflow-hidden p-2">
              <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-muted">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.025]"
                />
              </div>
              <div className="p-4">
                <div className="mb-3 flex items-center gap-3 font-display text-xs uppercase text-muted-foreground">
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                  <span>/</span>
                  <span>{post.author}</span>
                </div>
                <h2 className="font-heading text-2xl font-black leading-tight transition group-hover:text-primary">{post.title}</h2>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
