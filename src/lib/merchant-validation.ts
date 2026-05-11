import type { Product } from '@/data/products';

export const MERCHANT_BASE_URL = 'https://jerseydor.store';

export type MerchantMissingField =
  | 'id'
  | 'title'
  | 'slug'
  | 'description'
  | 'price'
  | 'image'
  | 'inventoryStatus'
  | 'condition'
  | 'brandOrIdentifier'
  | 'canonicalUrl';

export type MerchantValidationResult = {
  product: Product;
  canonicalUrl: string;
  missingFields: MerchantMissingField[];
  isValid: boolean;
};

function hasText(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasValidUrl(value: string | undefined) {
  if (!hasText(value)) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function getCanonicalProductUrl(product: Product) {
  return `${MERCHANT_BASE_URL}/products/${product.slug}`;
}

export function validateProductForMerchant(product: Product): MerchantValidationResult {
  const missingFields: MerchantMissingField[] = [];

  if (!hasText(product.id)) missingFields.push('id');
  if (!hasText(product.title)) missingFields.push('title');
  if (!hasText(product.slug)) missingFields.push('slug');
  if (!hasText(product.description)) missingFields.push('description');
  if (!Number.isFinite(product.price) || product.price <= 0) missingFields.push('price');
  if (!hasValidUrl(product.image)) missingFields.push('image');
  if (!product.inventoryStatus) missingFields.push('inventoryStatus');
  if (!product.condition) missingFields.push('condition');
  if (!hasText(product.brand) && !hasText(product.mpn) && !hasText(product.gtin)) {
    missingFields.push('brandOrIdentifier');
  }

  const canonicalUrl = getCanonicalProductUrl(product);

  if (!hasValidUrl(canonicalUrl)) {
    missingFields.push('canonicalUrl');
  }

  return {
    product,
    canonicalUrl,
    missingFields,
    isValid: missingFields.length === 0,
  };
}

export function summarizeMissingFields(results: MerchantValidationResult[]) {
  return results.reduce<Record<MerchantMissingField, number>>((summary, result) => {
    result.missingFields.forEach((field) => {
      summary[field] = (summary[field] ?? 0) + 1;
    });

    return summary;
  }, {} as Record<MerchantMissingField, number>);
}
