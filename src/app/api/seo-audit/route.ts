import { getPublishedProducts } from '@/lib/catalog';
import { auditProductSeoQuality, auditThinCollections, getDuplicateCounts } from '@/lib/seo-quality';

export const dynamic = 'force-dynamic';

// Internal SEO/product quality audit only. This route does not rewrite content,
// expose unpublished products, or change indexation behavior.
export async function GET() {
  const publishedProducts = getPublishedProducts();
  const titleCounts = getDuplicateCounts(publishedProducts, 'title');
  const slugCounts = getDuplicateCounts(publishedProducts, 'slug');
  const productAudits = publishedProducts.map((product) => auditProductSeoQuality(product, titleCounts, slugCounts));
  const duplicateTitleCount = productAudits.filter((audit) => audit.issues.includes('duplicate_title')).length;
  const shortDescriptionCount = productAudits.filter((audit) => audit.issues.includes('short_description')).length;
  const missingImageCount = productAudits.filter((audit) => audit.issues.includes('missing_image')).length;
  const missingAltCount = productAudits.filter((audit) => audit.issues.includes('missing_alt')).length;

  return Response.json({
    totalPublishedProducts: publishedProducts.length,
    duplicateTitleCount,
    shortDescriptionCount,
    missingImageCount,
    missingAltCount,
    weakMetadataCount: productAudits.filter((audit) => audit.issues.includes('weak_metadata')).length,
    duplicateSlugCount: productAudits.filter((audit) => audit.issues.includes('duplicate_slug')).length,
    oversizedImageCandidateCount: productAudits.filter((audit) => audit.issues.includes('oversized_image_candidate')).length,
    missingStructuredDataFieldsCount: productAudits.filter((audit) => audit.issues.includes('missing_structured_data_fields')).length,
    canonicalMismatchCount: productAudits.filter((audit) => audit.issues.includes('canonical_mismatch')).length,
    topWeakestProducts: [...productAudits]
      .sort((a, b) => a.score - b.score || a.title.localeCompare(b.title))
      .slice(0, 20),
    thinCollections: auditThinCollections(publishedProducts),
  });
}
