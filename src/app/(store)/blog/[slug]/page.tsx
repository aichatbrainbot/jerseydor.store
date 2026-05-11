import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getBlogPostBySlug, blogPosts } from '@/data/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ProductEmbed } from '@/components/ProductEmbed';
import { QuoteEmbed } from '@/components/mdx/QuoteEmbed';
import { EditorialImage } from '@/components/mdx/EditorialImage';
import { ReadingProgress } from '@/components/mdx/ReadingProgress';
import Link from 'next/link';
import { ChevronRight, CalendarDays, Clock, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.image, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.date,
      authors: [post.author],
      siteName: 'JerseyDor',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

const components = { ProductEmbed, QuoteEmbed, EditorialImage };

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.image,
    datePublished: post.date,
    author: { '@type': 'Organization', name: post.author },
    description: post.excerpt,
    publisher: {
      '@type': 'Organization',
      name: 'JerseyDor',
      url: 'https://jerseydor.store',
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://jerseydor.store/blog/${post.slug}` },
  };

  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Reading progress bar */}
      <ReadingProgress />

      <article className="w-full">

        {/* ════════════════════════════════════════════════════════════
            HERO — Full bleed cinematic image with text overlay
        ════════════════════════════════════════════════════════════ */}
        <div className="relative w-full overflow-hidden" style={{ height: 'min(85vh, 720px)' }}>
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Dark gradient overlay from bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          {/* Subtle left vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />

          {/* Hero content sitting on top of image */}
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="brand-container pb-12 md:pb-16">
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-white/50">
                <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href="/blog" className="hover:text-white/80 transition-colors">Journal</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-white/30 truncate max-w-[160px]">{post.title}</span>
              </nav>

              {/* Meta */}
              <div className="mb-5 flex flex-wrap items-center gap-4 text-xs uppercase tracking-widest text-white/50 font-display">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3" />
                  <time dateTime={post.date}>{formattedDate}</time>
                </span>
                <span className="h-px w-5 bg-white/20 inline-block" />
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {readingTime} min read
                </span>
                <span className="h-px w-5 bg-white/20 inline-block" />
                <span className="text-primary/80">{post.author}</span>
              </div>

              {/* Title — large, punchy, white */}
              <h1 className="max-w-4xl font-heading text-[2.2rem] font-black leading-[1.05] tracking-tight text-white md:text-5xl lg:text-[3.5rem]">
                {post.title}
              </h1>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            EXCERPT DECK — Summary card below the hero
        ════════════════════════════════════════════════════════════ */}
        <div className="brand-container">
          <div className="relative -mt-1 border-t border-border/50 pt-10 pb-0">
            <p className="max-w-[680px] text-xl leading-[1.7] text-foreground/70 md:text-2xl md:leading-[1.65] font-light">
              {post.excerpt}
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            ARTICLE BODY — Two column layout (content + sidebar)
        ════════════════════════════════════════════════════════════ */}
        <div className="brand-container mt-14 pb-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_260px] xl:gap-20">

            {/* ── Left: Main prose content ─── */}
            <div className="min-w-0">
              <div className="prose prose-lg md:prose-xl prose-invert max-w-none
                prose-headings:font-heading
                prose-headings:tracking-tight
                prose-headings:text-foreground

                prose-h2:text-[1.6rem]
                prose-h2:font-black
                prose-h2:mt-16
                prose-h2:mb-5
                prose-h2:leading-tight
                prose-h2:border-t
                prose-h2:border-border/40
                prose-h2:pt-10

                prose-h3:text-xl
                prose-h3:font-bold
                prose-h3:mt-10
                prose-h3:mb-4
                prose-h3:text-foreground/90

                prose-p:text-foreground/72
                prose-p:leading-[1.9]
                prose-p:text-[1.05rem]
                prose-p:my-5

                prose-li:text-foreground/72
                prose-li:leading-[1.8]
                prose-li:my-1.5

                prose-ol:my-7
                prose-ul:my-7

                prose-a:text-primary
                prose-a:no-underline
                prose-a:font-medium
                hover:prose-a:underline
                prose-a:underline-offset-4

                prose-strong:text-foreground
                prose-strong:font-semibold

                prose-blockquote:border-l-2
                prose-blockquote:border-primary
                prose-blockquote:pl-5
                prose-blockquote:text-foreground/60
                prose-blockquote:not-italic

                prose-img:rounded-xl
                prose-img:border
                prose-img:border-border/30
              ">
                <MDXRemote source={post.content} components={components} />
              </div>
            </div>

            {/* ── Right: Sticky Sidebar ─── */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                {/* Author card */}
                <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm">
                  <p className="mb-4 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Written by</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/25 font-heading text-lg font-black text-primary uppercase">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-heading text-sm font-bold text-foreground leading-snug">{post.author}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">JerseyDor Journal</p>
                    </div>
                  </div>
                </div>

                {/* Article info */}
                <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm space-y-4">
                  <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">Article Info</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Published</span>
                      <span className="text-foreground font-medium">{formattedDate}</span>
                    </div>
                    <div className="h-px bg-border/40" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Read time</span>
                      <span className="text-foreground font-medium">{readingTime} min</span>
                    </div>
                    <div className="h-px bg-border/40" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Words</span>
                      <span className="text-foreground font-medium">{wordCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Back button */}
                <Link
                  href="/blog"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Journal
                </Link>
              </div>
            </aside>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            FOOTER — Author card + navigation
        ════════════════════════════════════════════════════════════ */}
        <div className="brand-container pb-20 lg:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-border/40 pt-10">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 font-heading text-xl font-black text-primary uppercase">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Written by</p>
                <p className="font-heading text-sm font-bold text-foreground">{post.author}</p>
              </div>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Journal
            </Link>
          </div>
        </div>

      </article>
    </>
  );
}
