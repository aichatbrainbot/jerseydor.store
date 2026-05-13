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

import { prisma } from '@/lib/db';

export async function getCheckoutProviderConfig(): Promise<CheckoutProviderConfig> {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: 'global' },
    select: { checkoutProvider: true }
  });

  const dbProvider = settings?.checkoutProvider;
  const activeProvider = normalizeProvider(dbProvider || optionalEnv(process.env.CHECKOUT_PROVIDER));

  return {
    provider: activeProvider,
    stripeSecretKey: optionalEnv(process.env.STRIPE_SECRET_KEY),
    stripePublishableKey: optionalEnv(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    shopifyStoreDomain: optionalEnv(process.env.SHOPIFY_STORE_DOMAIN),
    shopifyStorefrontToken: optionalEnv(process.env.SHOPIFY_STOREFRONT_TOKEN),
  };
}
