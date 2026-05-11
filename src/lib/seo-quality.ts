import { collections } from '@/data/collections';
import type { Product } from '@/data/products';
import { MERCHANT_BASE_URL } from '@/lib/merchant-validation';

export type SeoProductIssue =
  | 'duplicate_title'
  | 'duplicate_slug'
  | 'short_title'
  | 'long_title'
  | 'short_description'
  | 'missing_image'
  | 'missing_alt'
  | 'weak_metadata'
  | 'canonical_mismatch'
  | 'missing_structured_data_fields'
  | 'oversized_image_candidate';

export type ProductSeoAudit = {
  id: string;
  slug: string;
  title: string;
  collectionSlug: string;
  score: number;
  issues: SeoProductIssue[];
  descriptionLength: number;
  canonicalUrl: string;
};

export type ThinCollectionAudit = {
  slug: string;
  title: string;
  publishedProductCount: number;
  issue: 'too_few_published_products' | 'short_seo_description';
};

function normalizeText(value: string | undefined) {
  return (value ?? '')
    .replaceAll('#', '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasText(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function getCanonicalProductUrl(product: Product) {
  return `${MERCHANT_BASE_URL}/products/${product.slug}`;
}

function isOversizedImageCandidate(image: string | undefined) {
  if (!hasText(image)) return false;

  try {
    const url = new URL(image);
    const width = Number(url.searchParams.get('w'));
    const quality = Number(url.searchParams.get('q'));

    return (Number.isFinite(width) && width > 2400) || (Number.isFinite(quality) && quality > 90);
  } catch {
    return false;
  }
}

export function getDuplicateCounts(products: Product[], key: keyof Pick<Product, 'slug' | 'title'>) {
  return products.reduce<Record<string, number>>((counts, product) => {
    const value = normalizeText(String(product[key] ?? '')).toLowerCase();
    if (!value) return counts;
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

export function auditProductSeoQuality(
  product: Product,
  titleCounts: Record<string, number>,
  slugCounts: Record<string, number>
): ProductSeoAudit {
  const issues: SeoProductIssue[] = [];
  const title = normalizeText(product.title);
  const description = normalizeText(product.description);
  const normalizedTitleKey = title.toLowerCase();
  const normalizedSlugKey = normalizeText(product.slug).toLowerCase();
  const canonicalUrl = getCanonicalProductUrl(product);
  const altText = title;

  if ((titleCounts[normalizedTitleKey] ?? 0) > 1) issues.push('duplicate_title');
  if ((slugCounts[normalizedSlugKey] ?? 0) > 1) issues.push('duplicate_slug');
  if (title.length < 20) issues.push('short_title');
  if (title.length > 90) issues.push('long_title');
  if (description.length < 160) issues.push('short_description');
  if (!hasText(product.image)) issues.push('missing_image');
  if (!hasText(altText)) issues.push('missing_alt');
  if (title.length < 20 || description.length < 120) issues.push('weak_metadata');
  if (canonicalUrl !== `${MERCHANT_BASE_URL}/products/${product.slug}`) issues.push('canonical_mismatch');
  if (!product.brand || !product.sku || !product.mpn || !product.condition || !product.inventoryStatus) {
    issues.push('missing_structured_data_fields');
  }
  if (isOversizedImageCandidate(product.image)) issues.push('oversized_image_candidate');

  const score = Math.max(
    0,
    100
      - (issues.includes('duplicate_title') ? 15 : 0)
      - (issues.includes('duplicate_slug') ? 25 : 0)
      - (issues.includes('short_title') || issues.includes('long_title') ? 10 : 0)
      - (issues.includes('short_description') ? 25 : 0)
      - (issues.includes('missing_image') ? 25 : 0)
      - (issues.includes('missing_alt') ? 10 : 0)
      - (issues.includes('weak_metadata') ? 15 : 0)
      - (issues.includes('missing_structured_data_fields') ? 10 : 0)
      - (issues.includes('oversized_image_candidate') ? 5 : 0)
  );

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    collectionSlug: product.collectionSlug,
    score,
    issues,
    descriptionLength: description.length,
    canonicalUrl,
  };
}

export function auditThinCollections(products: Product[]): ThinCollectionAudit[] {
  return collections.flatMap((collection) => {
    const publishedProductCount = products.filter((product) => product.collectionSlug === collection.slug).length;
    const issues: ThinCollectionAudit[] = [];

    if (publishedProductCount < 4) {
      issues.push({
        slug: collection.slug,
        title: collection.title,
        publishedProductCount,
        issue: 'too_few_published_products',
      });
    }

    if (normalizeText(collection.seoDescription).length < 120) {
      issues.push({
        slug: collection.slug,
        title: collection.title,
        publishedProductCount,
        issue: 'short_seo_description',
      });
    }

    return issues;
  });
}
