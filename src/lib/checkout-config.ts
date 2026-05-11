export type CheckoutProvider = 'mock' | 'stripe' | 'shopify';

export type CheckoutProviderConfig = {
  provider: CheckoutProvider;
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  shopifyStoreDomain?: string;
  shopifyStorefrontToken?: string;
};

function normalizeProvider(value: string | undefined): CheckoutProvider {
  if (value === 'stripe' || value === 'shopify' || value === 'mock') return value;
  return 'mock';
}

function optionalEnv(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function getCheckoutProviderConfig(): CheckoutProviderConfig {
  return {
    provider: normalizeProvider(optionalEnv(process.env.CHECKOUT_PROVIDER)),
    stripeSecretKey: optionalEnv(process.env.STRIPE_SECRET_KEY),
    stripePublishableKey: optionalEnv(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    shopifyStoreDomain: optionalEnv(process.env.SHOPIFY_STORE_DOMAIN),
    shopifyStorefrontToken: optionalEnv(process.env.SHOPIFY_STOREFRONT_TOKEN),
  };
}
