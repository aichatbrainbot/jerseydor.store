import {
  getCatalogSource,
  isPublishedProduct,
  normalizePublishedProduct,
  type CatalogProductQuery,
} from '@/lib/catalog-source';

export { isPublishedProduct, normalizePublishedProduct };

export function getAllProducts() {
  return getCatalogSource().getAllProducts();
}

export function getPublishedProducts() {
  return getCatalogSource().getPublishedProducts();
}

export function getIndexableProducts() {
  return getCatalogSource().getIndexableProducts();
}

export function getMerchantEligibleProducts() {
  return getCatalogSource().getMerchantEligibleProducts();
}

export function getProductBySlug(slug: string) {
  return getCatalogSource().getProductBySlug(slug);
}

export function getPublishedProductBySlug(slug: string) {
  return getCatalogSource().getPublishedProductBySlug(slug);
}

export function getCatalogProductPage(query: CatalogProductQuery) {
  return getCatalogSource().listProducts(query);
}

export function getCatalogOperationalStats() {
  return getCatalogSource().getOperationalStats();
}
