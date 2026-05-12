import { MetadataRoute } from 'next';
import { collections } from '@/data/collections';
import { blogPosts } from '@/data/blog';
import { legalPages } from '@/data/legal';
import { getIndexableProducts, getPublishedProducts } from '@/lib/catalog';

const MIN_INDEXABLE_COLLECTION_PRODUCTS = 4;

function isThinCollection(collectionSlug: string) {
  return getPublishedProducts().filter((product) => product.collectionSlug === collectionSlug).length < MIN_INDEXABLE_COLLECTION_PRODUCTS;
}

export default function sitemap(): MetadataRoute.Sitemap {
const baseUrl = 'https://jerseydor.store';

  const productUrls = getIndexableProducts().map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const collectionUrls = collections
    .filter((collection) => !isThinCollection(collection.slug))
    .map((collection) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const legalUrls = legalPages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(page.updated),
    changeFrequency: 'yearly' as const,
    priority: 0.4,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...collectionUrls,
    ...productUrls,
    ...blogUrls,
    ...legalUrls,
  ];
}
