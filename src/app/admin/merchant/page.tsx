import type { Metadata } from 'next';
import { ShieldCheck, CheckCircle2, CircleOff, Key, Globe2, CreditCard, Activity } from 'lucide-react';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { getStoreSettings, saveStoreSettings } from '@/lib/admin-settings-db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export const metadata: Metadata = {
  title: 'Merchant | JerseyDor Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminMerchantPage() {
  const storageMode = getAdminProductOverrideStorageMode();
  const settings = await getStoreSettings();
  
  const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || '';
  const shopifyToken = process.env.SHOPIFY_STOREFRONT_TOKEN || '';
  const isShopifyConfigured = Boolean(shopifyDomain && shopifyToken);
  
  const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
  const stripePublic = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  const isStripeConfigured = Boolean(stripeSecret && stripePublic);

  const activeProvider = settings.checkoutProvider || process.env.CHECKOUT_PROVIDER || 'shopify';

  async function updateProvider(formData: FormData) {
    'use server';
    const provider = formData.get('provider') as string;
    if (provider && ['shopify', 'stripe', 'mock'].includes(provider)) {
      await saveStoreSettings({
        storeName: settings.storeName,
        fromEmail: settings.fromEmail,
        supportEmail: settings.supportEmail,
        primaryLanguage: settings.primaryLanguage,
        storeCurrency: settings.storeCurrency,
        checkoutProvider: provider,
      });
      revalidatePath('/admin/merchant');
      revalidatePath('/api/checkout');
      redirect('/admin/merchant?updated=1');
    }
  }

  return (
    <AdminDashboardLayout storageMode={storageMode}>
      <header className="brand-panel mb-6 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-border/60 bg-card/60 p-4 lg:flex-row lg:items-center">
          <div>
            <p className="brand-eyebrow mb-2 inline-flex items-center gap-2">
              <ShieldCheck className="size-4" />
              Merchant & Gateway
            </p>
            <h1 className="font-heading text-2xl font-black md:text-3xl">Integration Status</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Monitor your headless commerce connections and toggle your active payment gateway.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        <section className="brand-panel p-5">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold">
            <Activity className="size-5 text-primary" />
            Active Checkout Provider
          </h2>
          <form action={updateProvider} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <label className={`cursor-pointer rounded-xl border p-4 transition ${activeProvider === 'shopify' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border/70 bg-card/40 hover:bg-muted/10'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold"><Globe2 className="size-4" /> Shopify</div>
                  <input type="radio" name="provider" value="shopify" defaultChecked={activeProvider === 'shopify'} className="size-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Headless checkout via Storefront API. Best for global reach.</p>
              </label>

              <label className={`cursor-pointer rounded-xl border p-4 transition ${activeProvider === 'stripe' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border/70 bg-card/40 hover:bg-muted/10'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold"><Key className="size-4" /> Stripe</div>
                  <input type="radio" name="provider" value="stripe" defaultChecked={activeProvider === 'stripe'} className="size-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Direct checkout via Stripe Checkout. Fast and simple.</p>
              </label>

              <label className={`cursor-pointer rounded-xl border p-4 transition ${activeProvider === 'mock' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border/70 bg-card/40 hover:bg-muted/10'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold"><CreditCard className="size-4" /> Local Mock</div>
                  <input type="radio" name="provider" value="mock" defaultChecked={activeProvider === 'mock'} className="size-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Bypasses real payments. For local development only.</p>
              </label>
            </div>
            <div className="flex justify-end pt-2">
              <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-6 font-display text-xs font-bold text-primary-foreground transition hover:bg-primary/90">
                <CheckCircle2 className="size-4" /> Save Provider
              </button>
            </div>
          </form>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="brand-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
                <Globe2 className="size-5 text-primary" />
                Shopify Environment
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
                <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Store Domain (.env)</label>
                <div className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground">
                  {shopifyDomain || 'Not set in .env'}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Storefront Token (.env)</label>
                <div className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 font-mono text-sm text-foreground">
                  {shopifyToken ? '••••••••••••••••••••••••••••' : 'Not set in .env'}
                </div>
              </div>
            </div>
          </div>

          <div className="brand-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
                <Key className="size-5 text-primary" />
                Stripe Environment
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
                <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Publishable Key (.env)</label>
                <div className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 font-mono text-sm text-foreground">
                  {stripePublic ? `${stripePublic.slice(0, 8)}...` : 'Not set'}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Secret Key (.env)</label>
                <div className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 font-mono text-sm text-foreground">
                  {stripeSecret ? '••••••••••••••••••••••••••••' : 'Not set'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
