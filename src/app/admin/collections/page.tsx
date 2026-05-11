import type { Metadata } from 'next';
import Image from 'next/image';
import { Layers3, Edit3 } from 'lucide-react';
import { collections } from '@/data/collections';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';

export const metadata: Metadata = {
  title: 'Collections | JerseyDor Admin',
  robots: { index: false, follow: false },
};

export default function AdminCollectionsPage() {
  const storageMode = getAdminProductOverrideStorageMode();

  return (
    <AdminDashboardLayout storageMode={storageMode}>
      <header className="brand-panel mb-4 overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-border/60 bg-card/60 p-4 lg:flex-row lg:items-center">
          <div>
            <p className="brand-eyebrow mb-2 inline-flex items-center gap-2">
              <Layers3 className="size-4" />
              Collections Management
            </p>
            <h1 className="font-heading text-2xl font-black md:text-3xl">Store Collections</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage your product categories, promotional groupings, and navigation sections.
            </p>
          </div>
          <button
            type="button"
            disabled
            className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-full border border-primary/30 px-3 font-display text-xs font-bold uppercase text-primary/70"
            title="Create new collection requires database backing."
          >
            Create New
          </button>
        </div>
      </header>

      <div className="brand-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="border-b border-border/70 bg-card/70 font-display text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Collection</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold w-[100px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {collections.map((collection) => (
                <tr key={collection.slug} className="transition hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded border border-border/70 bg-background/70">
                        <Image src={collection.image} alt="" fill sizes="48px" className="object-cover" />
                      </div>
                      <div>
                        <p className="font-heading text-sm font-bold">{collection.title}</p>
                        <p className="font-display text-[10px] text-muted-foreground">/{collection.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-muted-foreground line-clamp-2 max-w-lg">{collection.description}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex h-7 items-center justify-center gap-1 rounded-full border border-primary/35 px-2 font-display text-[10px] font-bold uppercase text-primary transition hover:bg-primary hover:text-primary-foreground">
                      <Edit3 className="size-3" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
