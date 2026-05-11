import type { Metadata } from 'next';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';

export const metadata: Metadata = {
  title: 'Orders | JerseyDor Admin',
  robots: { index: false, follow: false },
};

export default function AdminOrdersPage() {
  const storageMode = getAdminProductOverrideStorageMode();
  const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || 'your-store.myshopify.com';

  return (
    <AdminDashboardLayout storageMode={storageMode}>
      <header className="brand-panel mb-4 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-border/60 bg-card/60 p-4 lg:flex-row lg:items-center">
          <div>
            <p className="brand-eyebrow mb-2 inline-flex items-center gap-2">
              <ShoppingBag className="size-4" />
              Orders Management
            </p>
            <h1 className="font-heading text-2xl font-black md:text-3xl">Shopify Orders</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              JerseyDor uses Shopify as a headless backend for processing payments, fulfilling orders, and managing customer carts.
            </p>
          </div>
          <a
            href={`https://admin.shopify.com/store/${shopifyDomain.replace('.myshopify.com', '')}/orders`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-full bg-primary px-4 font-display text-xs font-bold uppercase text-primary-foreground transition hover:bg-primary/90"
          >
            Open Shopify
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </header>

      <div className="grid min-h-[40vh] place-items-center rounded-xl border border-border/70 bg-card/40 p-8 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
            <ShoppingBag className="size-8" />
          </div>
          <h2 className="font-heading text-xl font-black">Headless Fulfillment</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            To view detailed order status, manage refunds, or see customer shipping addresses, please log in to your Shopify admin dashboard. Local order caching is currently disabled.
          </p>
          <a
            href={`https://admin.shopify.com/store/${shopifyDomain.replace('.myshopify.com', '')}/orders`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-6 font-display text-sm font-bold text-background transition hover:bg-foreground/90"
          >
            Go to Shopify Admin
          </a>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
