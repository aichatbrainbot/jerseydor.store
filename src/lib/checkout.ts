import { getPublishedProductBySlug } from '@/lib/catalog';
import { buildShopifyCheckoutPlanWithStorefront } from '@/lib/shopify-checkout';
import { getCheckoutProviderConfig, type CheckoutProvider } from '@/lib/checkout-config';
import type { CartItem } from '@/lib/cart';

export type CheckoutCartLineInput = Pick<CartItem, 'slug' | 'quantity' | 'size' | 'customName' | 'customNumber'>;

export type CheckoutSessionResult = {
  ok: boolean;
  provider: CheckoutProvider;
  checkoutUrl?: string;
  error?: string;
  statusCode?: number;
};

type ServerCheckoutLine = {
  slug: string;
  quantity: number;
  size: string;
  customName?: string;
  customNumber?: string;
  product: {
    id: string;
    title: string;
    price: number;
    image: string;
    sku?: string;
  };
};

function getBaseUrl(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function normalizeQuantity(value: number) {
  return Number.isInteger(value) && value > 0 && value <= 20 ? value : undefined;
}

function buildServerCheckoutLines(items: CheckoutCartLineInput[]): CheckoutSessionResult | ServerCheckoutLine[] {
  const lines: ServerCheckoutLine[] = [];

  for (const item of items) {
    const quantity = normalizeQuantity(item.quantity);

    if (!quantity) {
      return {
        ok: false,
        provider: getCheckoutProviderConfig().provider,
        error: 'Cart contains an invalid quantity.',
        statusCode: 400,
      };
    }

    const product = getPublishedProductBySlug(item.slug);

    if (!product) {
      return {
        ok: false,
        provider: getCheckoutProviderConfig().provider,
        error: 'Cart contains an unpublished or unavailable product.',
        statusCode: 400,
      };
    }

    if (product.inventoryStatus === 'out_of_stock') {
      return {
        ok: false,
        provider: getCheckoutProviderConfig().provider,
        error: `${product.title} is currently out of stock.`,
        statusCode: 400,
      };
    }

    lines.push({
      slug: product.slug,
      quantity,
      size: item.size,
      customName: item.customName,
      customNumber: item.customNumber,
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        sku: product.sku,
      },
    });
  }

  if (lines.length === 0) {
    return {
      ok: false,
      provider: getCheckoutProviderConfig().provider,
      error: 'Cart is empty.',
      statusCode: 400,
    };
  }

  return lines;
}

function buildMockCheckoutSession(request: Request): CheckoutSessionResult {
  return {
    ok: true,
    provider: 'mock',
    checkoutUrl: `${getBaseUrl(request)}/checkout?status=mock`,
  };
}

async function buildStripeCheckoutSession(request: Request, lines: ServerCheckoutLine[]): Promise<CheckoutSessionResult> {
  const config = getCheckoutProviderConfig();

  if (!config.stripeSecretKey) {
    return {
      ok: false,
      provider: 'stripe',
      error: 'Stripe checkout is selected but STRIPE_SECRET_KEY is not configured.',
      statusCode: 503,
    };
  }

  const baseUrl = getBaseUrl(request);
  const body = new URLSearchParams({
    mode: 'payment',
    success_url: `${baseUrl}/checkout?status=success&provider=stripe`,
    cancel_url: `${baseUrl}/cart?checkout=cancelled`,
    allow_promotion_codes: 'true',
  });

  lines.forEach((line, index) => {
    body.set(`line_items[${index}][quantity]`, String(line.quantity));
    body.set(`line_items[${index}][price_data][currency]`, 'usd');
    body.set(`line_items[${index}][price_data][unit_amount]`, String(Math.round(line.product.price * 100)));
    body.set(`line_items[${index}][price_data][product_data][name]`, line.product.title);
    body.set(`line_items[${index}][price_data][product_data][images][0]`, line.product.image);
    body.set(`line_items[${index}][price_data][product_data][metadata][slug]`, line.slug);
    body.set(`line_items[${index}][price_data][product_data][metadata][size]`, line.size);
    if (line.customName) body.set(`line_items[${index}][price_data][product_data][metadata][custom_name]`, line.customName);
    if (line.customNumber) body.set(`line_items[${index}][price_data][product_data][metadata][custom_number]`, line.customNumber);
  });

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const payload = (await response.json()) as { url?: string; error?: { message?: string } };

  if (!response.ok || !payload.url) {
    return {
      ok: false,
      provider: 'stripe',
      error: payload.error?.message ?? 'Stripe checkout session could not be created.',
      statusCode: 502,
    };
  }

  return {
    ok: true,
    provider: 'stripe',
    checkoutUrl: payload.url,
  };
}

async function buildShopifyCheckoutSession(lines: ServerCheckoutLine[]): Promise<CheckoutSessionResult> {
  const config = getCheckoutProviderConfig();

  if (!config.shopifyStoreDomain || !config.shopifyStorefrontToken) {
    return {
      ok: false,
      provider: 'shopify',
      error: 'Shopify checkout is selected but SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_TOKEN is not configured.',
      statusCode: 503,
    };
  }

  const plan = await buildShopifyCheckoutPlanWithStorefront(
    {
      items: lines.map((line) => ({
        slug: line.slug,
        quantity: line.quantity,
        size: line.size,
        customName: line.customName,
        customNumber: line.customNumber,
      })),
    },
    {
      shopifyStoreDomain: config.shopifyStoreDomain,
      shopifyStorefrontToken: config.shopifyStorefrontToken,
    }
  );

  if (!plan.ready) {
    return {
      ok: false,
      provider: 'shopify',
      error: plan.errors[0]?.message ?? 'Cart is missing Shopify variant mappings.',
      statusCode: 400,
    };
  }

  const response = await fetch(`https://${config.shopifyStoreDomain}/api/2026-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.shopifyStorefrontToken,
    },
    body: JSON.stringify({
      query: `
        mutation CartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart { checkoutUrl }
            userErrors { field message }
          }
        }
      `,
      variables: {
        input: {
          lines: plan.lines.map((line) => ({
            merchandiseId: line.merchandiseId,
            quantity: line.quantity,
            attributes: line.attributes,
          })),
        },
      },
    }),
  });

  const payload = (await response.json()) as {
    data?: { cartCreate?: { cart?: { checkoutUrl?: string }; userErrors?: Array<{ message: string }> } };
  };
  const checkoutUrl = payload.data?.cartCreate?.cart?.checkoutUrl;
  const userError = payload.data?.cartCreate?.userErrors?.[0]?.message;

  if (!response.ok || !checkoutUrl || userError) {
    return {
      ok: false,
      provider: 'shopify',
      error: userError ?? 'Shopify checkout URL could not be created.',
      statusCode: 502,
    };
  }

  return {
    ok: true,
    provider: 'shopify',
    checkoutUrl,
  };
}

export async function createCheckoutSession(request: Request, items: CheckoutCartLineInput[]): Promise<CheckoutSessionResult> {
  const config = getCheckoutProviderConfig();
  const serverLines = buildServerCheckoutLines(items);

  if (!Array.isArray(serverLines)) {
    return serverLines;
  }

  if (config.provider === 'stripe') {
    return buildStripeCheckoutSession(request, serverLines);
  }

  if (config.provider === 'shopify') {
    return buildShopifyCheckoutSession(serverLines);
  }

  return buildMockCheckoutSession(request);
}
