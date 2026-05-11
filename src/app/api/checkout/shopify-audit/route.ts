import { getPublishedProducts } from '@/lib/catalog';
import { hasShopifyCheckoutMapping } from '@/lib/shopify-checkout';

export const dynamic = 'force-dynamic';

// Internal readiness audit only. This does not create Shopify carts, redirect to
// Shopify checkout, or create live orders.
export async function GET() {
  const publishedProducts = getPublishedProducts();
  const productsWithShopifyVariant = publishedProducts.filter(hasShopifyCheckoutMapping);
  const productsMissingShopifyVariant = publishedProducts.filter((product) => !hasShopifyCheckoutMapping(product));

  return Response.json({
    currencyPolicy: 'USD-only',
    totalPublishedProducts: publishedProducts.length,
    productsWithShopifyVariant: productsWithShopifyVariant.length,
    productsMissingShopifyVariant: productsMissingShopifyVariant.length,
    first20MissingMappings: productsMissingShopifyVariant.slice(0, 20).map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      sku: product.sku,
    })),
  });
}
