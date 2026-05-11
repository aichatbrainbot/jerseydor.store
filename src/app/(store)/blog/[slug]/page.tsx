import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getBlogPostBySlug, blogPosts } from '@/data/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ProductEmbed } from '@/components/ProductEmbed';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    }
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

const components = {
  ProductEmbed,
};

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.image,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    description: post.excerpt,
  };

  return (
    <article className="w-full pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="brand-container py-12 text-center md:py-16">
        <div className="mb-6 flex items-center justify-center gap-4 font-display text-xs uppercase text-muted-foreground">
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
          <span>/</span>
          <span>{post.author}</span>
        </div>
        <h1 className="mx-auto max-w-4xl font-heading text-4xl font-black leading-tight md:text-6xl">
          {post.title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          {post.excerpt}
        </p>
      </header>

      <div className="brand-container mb-12">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border/70 md:aspect-[21/9]">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="brand-container">
        <div className="mx-auto max-w-3xl border-y border-border/60 py-10">
          <div className="prose prose-lg prose-invert max-w-none prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary prose-strong:text-foreground">
            <MDXRemote source={post.content} components={components} />
          </div>
        </div>
      </div>
    </article>
  );
}
