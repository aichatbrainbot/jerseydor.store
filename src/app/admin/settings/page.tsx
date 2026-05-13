import type { Metadata } from 'next';
import { Settings, Save } from 'lucide-react';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { getStoreSettings, saveStoreSettings } from '@/lib/admin-settings-db';
import { consumeRateLimit } from '@/lib/admin-rate-limit';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

export const metadata: Metadata = {
  title: 'Settings | JerseyDor Admin',
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const storageMode = getAdminProductOverrideStorageMode();
  const settings = await getStoreSettings();

  async function handleSave(formData: FormData) {
    'use server';
    const reqHeaders = await headers();
    const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0] || reqHeaders.get('x-real-ip') || 'local';
    const limit = consumeRateLimit(`save-settings:${ip}`, 10, 60000);
    
    if (!limit.allowed) {
      redirect(`/admin/settings?error=rate_limit`);
    }

    await saveStoreSettings({
      storeName: formData.get('storeName') as string,
      fromEmail: formData.get('fromEmail') as string,
      supportEmail: formData.get('supportEmail') as string,
      primaryLanguage: formData.get('primaryLanguage') as string,
      storeCurrency: formData.get('storeCurrency') as string,
      checkoutProvider: settings.checkoutProvider,
    });

    revalidatePath('/', 'layout');
    redirect('/admin/settings?success=1');
  }

  return (
    <AdminDashboardLayout storageMode={storageMode}>
      <header className="brand-panel mb-4 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-border/60 bg-card/60 p-4 lg:flex-row lg:items-center">
          <div>
            <p className="brand-eyebrow mb-2 inline-flex items-center gap-2">
              <Settings className="size-4" />
              Store Settings
            </p>
            <h1 className="font-heading text-2xl font-black md:text-3xl">General Settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Configure your basic store details, contact emails, and localization preferences.
            </p>
          </div>
        </div>
      </header>

      {searchParams.success && (
        <div className="mb-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-400 font-medium">
          Settings saved successfully.
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
            <h2 className="font-heading text-lg font-bold border-b border-border/60 pb-2">Store Profile</h2>
            
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Store Name</label>
              <input 
                name="storeName"
                type="text" 
                defaultValue={settings.storeName}
                required
                className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">System Email (From)</label>
                <input 
                  name="fromEmail"
                  type="email" 
                  defaultValue={settings.fromEmail}
                  required
                  className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Support Email</label>
                <input 
                  name="supportEmail"
                  type="email" 
                  defaultValue={settings.supportEmail}
                  required
                  className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="font-heading text-lg font-bold border-b border-border/60 pb-2">Localization</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Primary Language</label>
                <select name="primaryLanguage" defaultValue={settings.primaryLanguage} className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Store Currency</label>
                <select name="storeCurrency" defaultValue={settings.storeCurrency} className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-border/60">
            <button 
              type="submit" 
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-6 font-display text-sm font-bold text-primary-foreground hover:bg-primary/90 transition"
            >
              <Save className="size-4" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </AdminDashboardLayout>
  );
}
