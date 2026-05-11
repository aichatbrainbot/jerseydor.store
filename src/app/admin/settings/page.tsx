import type { Metadata } from 'next';
import { Settings, Save } from 'lucide-react';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';

export const metadata: Metadata = {
  title: 'Settings | JerseyDor Admin',
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  const storageMode = getAdminProductOverrideStorageMode();
  
  const fromEmail = process.env.STORE_EMAIL_FROM || '';
  const supportEmail = process.env.STORE_SUPPORT_EMAIL || '';

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

      <div className="brand-panel p-5 max-w-4xl">
        <form className="space-y-6">
          <div className="space-y-4">
            <h2 className="font-heading text-lg font-bold border-b border-border/60 pb-2">Store Profile</h2>
            
            <div className="space-y-1.5">
              <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Store Name</label>
              <input 
                type="text" 
                defaultValue="JerseyDor"
                disabled
                className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground opacity-70" 
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">System Email (From)</label>
                <input 
                  type="email" 
                  defaultValue={fromEmail}
                  disabled
                  className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground opacity-70" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Support Email</label>
                <input 
                  type="email" 
                  defaultValue={supportEmail}
                  disabled
                  className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground opacity-70" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="font-heading text-lg font-bold border-b border-border/60 pb-2">Localization</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Primary Language</label>
                <select disabled className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground opacity-70">
                  <option>English</option>
                  <option>Arabic</option>
                  <option>French</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Store Currency</label>
                <select disabled className="flex h-10 w-full items-center rounded-md border border-border/70 bg-background/70 px-3 text-sm text-foreground opacity-70">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-border/60">
            <button 
              type="button" 
              disabled
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-6 font-display text-sm font-bold text-primary-foreground opacity-50 cursor-not-allowed"
            >
              <Save className="size-4" />
              Save Settings
            </button>
          </div>
          <p className="text-right text-xs text-muted-foreground">Saving requires API database integration.</p>
        </form>
      </div>
    </AdminDashboardLayout>
  );
}
