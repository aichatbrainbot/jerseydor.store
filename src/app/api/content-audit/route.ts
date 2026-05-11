import { getPublishedProducts } from '@/lib/catalog';
import { auditContentOriginality } from '@/lib/content-originality';

export const dynamic = 'force-dynamic';

// Internal content originality/readability audit only. This route does not
// rewrite product descriptions, expose unpublished products, or call external APIs.
export async function GET() {
  const audit = auditContentOriginality(getPublishedProducts());

  return Response.json({
    totalPublishedProducts: audit.totalPublishedProducts,
    repeatedPatternCount: audit.repeatedPatternCount,
    similarDescriptionClusters: audit.similarDescriptionClusters,
    mostRepeatedPhrases: audit.mostRepeatedPhrases,
    productsNeedingRewrite: audit.productsNeedingRewrite,
    first20FlaggedProducts: audit.flaggedProducts.slice(0, 20),
  });
}
