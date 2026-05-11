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
  | 'missing_size_variant'
  | 'shopify_product_not_found'
  | 'shopify_variant_lookup_failed';

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

export type ShopifyStorefrontLookupConfig = {
  shopifyStoreDomain: string;
  shopifyStorefrontToken: string;
};

type ShopifyVariantNode = {
  id: string;
  sku?: string;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
};

type ShopifyProductByHandlePayload = {
  data?: {
    product?: {
      id: string;
      title: string;
      variants: {
        nodes: ShopifyVariantNode[];
      };
    } | null;
    products?: {
      nodes: Array<{
        id: string;
        title: string;
        variants: {
          nodes: ShopifyVariantNode[];
        };
      }>;
    };
  };
  errors?: Array<{ message?: string }>;
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

function normalizeShopifyStoreDomain(domain: string) {
  return domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function normalizeOptionValue(value: string | undefined) {
  return value?.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ') ?? '';
}

function getSizeAliases(size: string | undefined) {
  const normalizedSize = normalizeOptionValue(size);

  if (normalizedSize === 's') return ['s', 'small', 'small adults'];
  if (normalizedSize === 'm') return ['m', 'medium', 'medium adults'];
  if (normalizedSize === 'l') return ['l', 'large', 'large adults'];
  if (normalizedSize === 'xl') return ['xl', 'x large', 'x-large', 'xl adults'];
  if (normalizedSize === 'xxl') return ['xxl', '2xl', 'xx large', 'xx-large', 'xxl adults'];

  return normalizedSize ? [normalizedSize] : [];
}

function variantMatchesSize(variant: ShopifyVariantNode, size: string | undefined) {
  const aliases = getSizeAliases(size).map(normalizeOptionValue);

  if (aliases.length === 0) return true;

  return variant.selectedOptions.some((option) => {
    const optionName = normalizeOptionValue(option.name);
    const optionValue = normalizeOptionValue(option.value);

    if (optionName && !['size', 'option 1'].includes(optionName)) return false;

    return aliases.includes(optionValue);
  });
}

async function fetchShopifyProductVariants(
  config: ShopifyStorefrontLookupConfig,
  product: Product
): Promise<ShopifyVariantNode[] | undefined> {
  const endpoint = `https://${normalizeShopifyStoreDomain(config.shopifyStoreDomain)}/api/2026-01/graphql.json`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': config.shopifyStorefrontToken,
  };
  const handleResponse = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `
        query ProductByHandle($handle: String!) {
          product(handle: $handle) {
            id
            title
            variants(first: 100) {
              nodes {
                id
                sku
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      `,
      variables: { handle: product.slug },
    }),
  });

  if (!handleResponse.ok) return undefined;

  const handlePayload = (await handleResponse.json()) as ShopifyProductByHandlePayload;

  if (handlePayload.errors?.length) return undefined;

  const handleVariants = handlePayload.data?.product?.variants.nodes;

  if (handleVariants) return handleVariants;

  const titleQuery = `title:"${product.title.replace(/["\\]/g, ' ')}"`;
  const titleResponse = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: `
        query ProductByTitle($query: String!) {
          products(first: 10, query: $query) {
            nodes {
              id
              title
              variants(first: 100) {
                nodes {
                  id
                  sku
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      `,
      variables: { query: titleQuery },
    }),
  });

  if (!titleResponse.ok) return undefined;

  const titlePayload = (await titleResponse.json()) as ShopifyProductByHandlePayload;

  if (titlePayload.errors?.length) return undefined;

  return titlePayload.data?.products?.nodes.find((node) => node.title.toLowerCase() === product.title.toLowerCase())?.variants.nodes;
}

async function getShopifyVariantIdWithStorefront(
  product: Product,
  size: string | undefined,
  config: ShopifyStorefrontLookupConfig
) {
  const mappedVariantId = getShopifyVariantId(product, size);

  if (mappedVariantId) return mappedVariantId;

  const variants = await fetchShopifyProductVariants(config, product);

  if (!variants) return undefined;

  return variants.find((variant) => variantMatchesSize(variant, size))?.id;
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

export async function buildShopifyCheckoutPlanWithStorefront(
  input: ShopifyCheckoutCartInput,
  config: ShopifyStorefrontLookupConfig
): Promise<ShopifyCheckoutPlan> {
  const lines: PlannedShopifyCartLine[] = [];
  const errors: ShopifyCheckoutPlanError[] = [];

  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      errors.push({
        slug: item.slug,
        code: 'invalid_quantity',
        message: 'Cart item quantity must be a positive integer.',
      });
      continue;
    }

    const product = getPublishedProductBySlug(item.slug);

    if (!product) {
      errors.push({
        slug: item.slug,
        code: 'unpublished_product',
        message: 'Product is not published or does not exist.',
      });
      continue;
    }

    const merchandiseId = await getShopifyVariantIdWithStorefront(product, item.size, config);

    if (!merchandiseId) {
      errors.push({
        slug: item.slug,
        code: 'shopify_variant_lookup_failed',
        message: 'Product is not imported in Shopify yet, or its selected size could not be matched.',
      });
      continue;
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
  }

  return {
    currency: CHECKOUT_CURRENCY,
    lines,
    errors,
    ready: errors.length === 0,
  };
}
