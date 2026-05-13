'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, FileSearch, Layers3, LogOut, Package, Settings, ShieldCheck, ShoppingBag, ShoppingCart, LayoutDashboard, MessageSquare } from 'lucide-react';
import type { AdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';

const adminSections = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
  { label: 'Abandoned', icon: ShoppingCart, href: '/admin/abandoned' },
  { label: 'Products', icon: Package, href: '/admin/products' },
  { label: 'Inbox', icon: MessageSquare, href: '/admin/inbox' },
  { label: 'Collections', icon: Layers3, href: '/admin/collections' },
  { label: 'SEO', icon: FileSearch, href: '/admin/seo' },
  { label: 'Merchant', icon: ShieldCheck, href: '/admin/merchant' },
  { label: 'Settings', icon: Settings, href: '/admin/settings' },
];

export function AdminDashboardLayout({ 
  children, 
  storageMode 
}: { 
  children: React.ReactNode;
  storageMode: AdminProductOverrideStorageMode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen px-3 py-4 md:px-5">
      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="brand-panel h-fit p-3 xl:sticky xl:top-4">
          <div className="mb-4 flex items-center gap-3 border-b border-border/60 pb-3">
            <div className="grid size-9 place-items-center rounded-full border border-primary/30 bg-primary/10 font-display text-xs font-bold text-primary">
              JD
            </div>
            <div>
              <p className="font-heading text-base font-black">JerseyDor</p>
              <p className="text-xs text-muted-foreground">Owner console</p>
            </div>
          </div>

          <nav className="space-y-1" aria-label="Admin sections">
            {adminSections.map((section) => {
              const Icon = section.icon;
              const isActive = pathname === section.href;

              return (
                <Link
                  key={section.label}
                  href={section.href}
                  className={
                    isActive
                      ? 'flex h-9 items-center gap-2 rounded-md bg-primary px-3 font-display text-xs font-bold uppercase text-primary-foreground'
                      : 'flex h-9 items-center gap-2 rounded-md px-3 font-display text-xs font-semibold uppercase text-muted-foreground hover:bg-muted/50 transition'
                  }
                >
                  <Icon className="size-4" />
                  {section.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-md border border-border/70 bg-background/45 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="size-4 text-primary" />
              <span className="font-display font-semibold uppercase">Storage</span>
            </div>
            <p className="mt-1 text-sm font-semibold">{storageMode.mode}</p>
          </div>

          <form action="/api/admin/logout" method="post" className="mt-3">
            <button className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-border/70 px-3 font-display text-xs font-semibold uppercase text-muted-foreground transition hover:border-primary/50 hover:text-primary">
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </aside>

        <main className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
