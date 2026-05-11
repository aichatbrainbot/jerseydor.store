import type { Product } from '@/data/products';
import { getPublishedProductBySlug } from '@/lib/catalog';

export const CHECKOUT_CURRENCY = 'USD';

export type ShopifyCheckoutCartInput = {
  items: ShopifyCheckoutCartItemInput[];
};

export type ShopifyCheckoutCartItemInput = {
  slug: string;
  quantity: number;
  size?: string;
  customName?: string;
  customNumber?: string;
};

export type PlannedShopifyCartLine = {
  merchandiseId: string;
  quantity: number;
  attributes: Array<{
    key: string;
    value: string;
  }>;
  product: {
    id: string;
    slug: string;
    title: string;
    sku?: string;
  };
};

export type ShopifyCheckoutPlanErrorCode =
  | 'invalid_quantity'
  | 'unpublished_product'
  | 'missing_shopify_variant'
  | 'missing_size_variant';

export type ShopifyCheckoutPlanError = {
  slug: string;
  code: ShopifyCheckoutPlanErrorCode;
  message: string;
};

export type ShopifyCheckoutPlan = {
  currency: typeof CHECKOUT_CURRENCY;
  lines: PlannedShopifyCartLine[];
  errors: ShopifyCheckoutPlanError[];
  ready: boolean;
};

function hasText(value: string | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function hasShopifyCheckoutMapping(product: Product) {
  return hasText(product.shopifyVariantId) || Object.keys(product.shopifyVariantMap ?? {}).length > 0;
}

function getShopifyVariantId(product: Product, size: string | undefined) {
  if (product.shopifyVariantMap && Object.keys(product.shopifyVariantMap).length > 0) {
    if (!hasText(size)) return undefined;
    return product.shopifyVariantMap[size.toLowerCase()] ?? product.shopifyVariantMap[size.toUpperCase()] ?? product.shopifyVariantMap[size];
  }

  return product.shopifyVariantId;
}

function getLineAttributes(item: ShopifyCheckoutCartItemInput) {
  return [
    item.size ? { key: 'Size', value: item.size.toUpperCase() } : undefined,
    item.customName ? { key: 'Custom name', value: item.customName } : undefined,
    item.customNumber ? { key: 'Custom number', value: item.customNumber } : undefined,
  ].filter((attribute): attribute is { key: string; value: string } => Boolean(attribute));
}

export function buildShopifyCheckoutPlan(input: ShopifyCheckoutCartInput): ShopifyCheckoutPlan {
  const lines: PlannedShopifyCartLine[] = [];
  const errors: ShopifyCheckoutPlanError[] = [];

  input.items.forEach((item) => {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      errors.push({
        slug: item.slug,
        code: 'invalid_quantity',
        message: 'Cart item quantity must be a positive integer.',
      });
      return;
    }

    const product = getPublishedProductBySlug(item.slug);

    if (!product) {
      errors.push({
        slug: item.slug,
        code: 'unpublished_product',
        message: 'Product is not published or does not exist.',
      });
      return;
    }

    if (!hasShopifyCheckoutMapping(product)) {
      errors.push({
        slug: item.slug,
        code: 'missing_shopify_variant',
        message: 'Product is missing a Shopify variant mapping.',
      });
      return;
    }

    const merchandiseId = getShopifyVariantId(product, item.size);

    if (!merchandiseId) {
      errors.push({
        slug: item.slug,
        code: 'missing_size_variant',
        message: 'Product is missing a Shopify variant mapping for the selected size.',
      });
      return;
    }

    lines.push({
      merchandiseId,
      quantity: item.quantity,
      attributes: getLineAttributes(item),
      product: {
        id: product.id,
        slug: product.slug,
        title: product.title,
        sku: product.sku,
      },
    });
  });

  return {
    currency: CHECKOUT_CURRENCY,
    lines,
    errors,
    ready: errors.length === 0,
  };
}
