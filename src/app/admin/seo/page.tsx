import type { Metadata } from 'next';
import { FileSearch, Save } from 'lucide-react';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { getSeoSettings, saveSeoSettings } from '@/lib/admin-settings-db';
import { consumeRateLimit } from '@/lib/admin-rate-limit';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

export const metadata: Metadata = {
  title: 'SEO | JerseyDor Admin',
  robots: { index: false, follow: false },
};

export default async function AdminSeoPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const storageMode = getAdminProductOverrideStorageMode();
  const settings = await getSeoSettings();

  async function handleSave(formData: FormData) {
    'use server';
    const reqHeaders = await headers();
    const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0] || reqHeaders.get('x-real-ip') || 'local';
    const limit = consumeRateLimit(`save-seo:${ip}`, 10, 60000);
    
    if (!limit.allowed) {
      redirect(`/admin/seo?error=rate_limit`);
    }

    await saveSeoSettings({
      globalSiteTitle: formData.get('globalSiteTitle') as string,
      globalMetaDescription: formData.get('globalMetaDescription') as string,
      defaultOgImage: formData.get('defaultOgImage') as string,
    });

    revalidatePath('/', 'layout');
    redirect('/admin/seo?success=1');
  }

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

      {searchParams.success && (
        <div className="mb-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400 font-medium">
          SEO Configuration saved successfully.
        </div>
      )}
      {searchParams.error === 'rate_limit' && (
        <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium">
          You are saving too fast. Please wait a moment.
        </div>
      )}

      <div className="brand-panel p-5 max-w-4xl">
        <form action={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold border-b border-border/60 pb-2">Default Meta Tags</h2>
            
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Global Site Title Format</label>
              <input 
                name="globalSiteTitle"
                type="text" 
                defaultValue={settings.globalSiteTitle}
                required
                className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
              />
              <p className="text-[10px] text-muted-foreground">This format is used on the home page and appended to other pages.</p>
            </div>
            
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Global Meta Description</label>
              <textarea 
                name="globalMetaDescription"
                rows={3}
                defaultValue={settings.globalMetaDescription}
                required
                className="flex w-full rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="font-heading text-lg font-bold border-b border-border/60 pb-2">Social Sharing (Open Graph)</h2>
            
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Default OG Image URL</label>
              <input 
                name="defaultOgImage"
                type="url" 
                defaultValue={settings.defaultOgImage}
                required
                className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
              />
              <p className="text-[10px] text-muted-foreground">Image shown when sharing the store link on X, WhatsApp, or Facebook.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-border/60">
            <button 
              type="submit" 
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-6 font-display text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
            >
              <Save className="size-4" />
              Save SEO Configuration
            </button>
          </div>
        </form>
      </div>
    </AdminDashboardLayout>
  );
}
