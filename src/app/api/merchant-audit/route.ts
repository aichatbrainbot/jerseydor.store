import { getPublishedProducts } from '@/lib/catalog';
import { summarizeMissingFields, validateProductForMerchant } from '@/lib/merchant-validation';

export const dynamic = 'force-dynamic';

// Internal readiness audit only. This is not the production Google Merchant feed.
export async function GET() {
  const publishedProducts = getPublishedProducts();
  const validationResults = publishedProducts.map(validateProductForMerchant);
  const invalidProducts = validationResults.filter((result) => !result.isValid);

  return Response.json({
    totalPublished: publishedProducts.length,
    validForMerchant: validationResults.length - invalidProducts.length,
    invalidForMerchant: invalidProducts.length,
    missingFields: summarizeMissingFields(validationResults),
    invalidProducts: invalidProducts.slice(0, 20).map((result) => ({
      id: result.product.id,
      title: result.product.title,
      slug: result.product.slug,
      canonicalUrl: result.canonicalUrl,
      missingFields: result.missingFields,
    })),
  });
}
