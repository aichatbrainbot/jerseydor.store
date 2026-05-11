import type { Metadata } from 'next';
import { FileSearch, Save } from 'lucide-react';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';

export const metadata: Metadata = {
  title: 'SEO | JerseyDor Admin',
  robots: { index: false, follow: false },
};

export default function AdminSeoPage() {
  const storageMode = getAdminProductOverrideStorageMode();

  return (
    <AdminDashboardLayout storageMode={storageMode}>
      <header className="brand-panel mb-4 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-border/60 bg-card/60 p-4 lg:flex-row lg:items-center">
          <div>
            <p className="brand-eyebrow mb-2 inline-flex items-center gap-2">
              <FileSearch className="size-4" />
              Search Engine Optimization
            </p>
            <h1 className="font-heading text-2xl font-black md:text-3xl">Global SEO Settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage how your store appears on Google, social media, and other search engines.
            </p>
          </div>
        </div>
      </header>

      <div className="brand-panel p-5 max-w-4xl">
        <form className="space-y-6">
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold border-b border-border/60 pb-2">Default Meta Tags</h2>
            
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Global Site Title Format</label>
              <input 
                type="text" 
                defaultValue="JerseyDor | The Best Retro & Modern Football Jerseys"
                disabled
                className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground opacity-70" 
              />
              <p className="text-[10px] text-muted-foreground">This format is used on the home page and appended to other pages.</p>
            </div>
            
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Global Meta Description</label>
              <textarea 
                rows={3}
                defaultValue="Discover premium retro football shirts, player-issue kits, and modern jerseys at JerseyDor."
                disabled
                className="flex w-full rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm text-foreground opacity-70" 
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="font-heading text-lg font-bold border-b border-border/60 pb-2">Social Sharing (Open Graph)</h2>
            
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Default OG Image URL</label>
              <input 
                type="text" 
                defaultValue="https://cdn.shopify.com/s/files/1/0684/9783/4240/files/og-image.jpg"
                disabled
                className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground opacity-70" 
              />
              <p className="text-[10px] text-muted-foreground">Image shown when sharing the store link on X, WhatsApp, or Facebook.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-border/60">
            <button 
              type="button" 
              disabled
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-6 font-display text-sm font-bold text-primary-foreground opacity-50 cursor-not-allowed"
            >
              <Save className="size-4" />
              Save SEO Configuration
            </button>
          </div>
          <p className="text-right text-xs text-muted-foreground">Saving requires API database integration.</p>
        </form>
      </div>
    </AdminDashboardLayout>
  );
}
