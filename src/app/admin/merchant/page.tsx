import type { Metadata } from 'next';
import { ShieldCheck, CheckCircle2, CircleOff, Key, Globe2 } from 'lucide-react';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';

export const metadata: Metadata = {
  title: 'Merchant | JerseyDor Admin',
  robots: { index: false, follow: false },
};

export default function AdminMerchantPage() {
  const storageMode = getAdminProductOverrideStorageMode();
  
  const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || '';
  const shopifyToken = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
  const isShopifyConfigured = Boolean(shopifyDomain && shopifyToken);
  
  const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
  const stripePublic = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  const isStripeConfigured = Boolean(stripeSecret && stripePublic);

  return (
    <AdminDashboardLayout storageMode={storageMode}>
      <header className="brand-panel mb-4 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-border/60 bg-card/60 p-4 lg:flex-row lg:items-center">
          <div>
            <p className="brand-eyebrow mb-2 inline-flex items-center gap-2">
              <ShieldCheck className="size-4" />
              Merchant & Gateway
            </p>
            <h1 className="font-heading text-2xl font-black md:text-3xl">Integration Status</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Monitor your headless commerce connections and payment gateway configurations.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="brand-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
              <Globe2 className="size-5 text-primary" />
              Shopify Headless
            </h2>
            {isShopifyConfigured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 font-display text-[10px] font-bold uppercase text-emerald-300">
                <CheckCircle2 className="size-3" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/35 bg-destructive/10 px-2.5 py-1 font-display text-[10px] font-bold uppercase text-destructive">
                <CircleOff className="size-3" />
                Missing Config
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Store Domain</label>
              <div className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground">
                {shopifyDomain || 'Not set in .env.local'}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Storefront Token</label>
              <div className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 font-mono text-sm text-foreground">
                {shopifyToken ? '••••••••••••••••••••••••••••' : 'Not set in .env.local'}
              </div>
            </div>
            {!isShopifyConfigured && (
              <p className="text-xs text-muted-foreground mt-2">
                You must set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN in your environment variables to enable checkout.
              </p>
            )}
          </div>
        </div>

        <div className="brand-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
              <Key className="size-5 text-primary" />
              Stripe Gateway
            </h2>
            {isStripeConfigured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 font-display text-[10px] font-bold uppercase text-emerald-300">
                <CheckCircle2 className="size-3" />
                Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/35 px-2.5 py-1 font-display text-[10px] font-bold uppercase text-muted-foreground">
                <CircleOff className="size-3" />
                Not Configured
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Publishable Key</label>
              <div className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 font-mono text-sm text-foreground">
                {stripePublic ? `${stripePublic.slice(0, 8)}...` : 'Not set'}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Secret Key</label>
              <div className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 font-mono text-sm text-foreground">
                {stripeSecret ? '••••••••••••••••••••••••••••' : 'Not set'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
