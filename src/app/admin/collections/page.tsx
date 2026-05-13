import type { Metadata } from 'next';
import Image from 'next/image';
import { Layers3, Edit3, Plus } from 'lucide-react';
import { collections as defaultCollections } from '@/data/collections';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';
import { getAdminCollections, saveAdminCollection } from '@/lib/admin-settings-db';

export const metadata: Metadata = {
  title: 'Collections | JerseyDor Admin',
  robots: { index: false, follow: false },
};

export default async function AdminCollectionsPage() {
  const storageMode = getAdminProductOverrideStorageMode();
  let dbCollections = await getAdminCollections();

  // Seed default collections if database is completely empty
  if (dbCollections.length === 0) {
    for (const c of defaultCollections) {
      await saveAdminCollection({
        slug: c.slug,
        title: c.title,
        description: c.description,
        image: c.image,
      });
    }
    dbCollections = await getAdminCollections();
  }

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
            className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-full border border-primary px-4 font-display text-xs font-bold uppercase text-primary hover:bg-primary hover:text-primary-foreground transition"
          >
            <Plus className="size-4" />
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
              {dbCollections.map((collection) => (
                <tr key={collection.slug} className="transition hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded border border-border/70 bg-background/70 flex items-center justify-center">
                        {collection.image ? (
                          <Image src={collection.image} alt={collection.title} fill sizes="48px" className="object-cover" />
                        ) : (
                          <Layers3 className="size-5 text-muted-foreground/50" />
                        )}
                      </div>
                      <div>
                        <p className="font-heading text-sm font-bold">{collection.title}</p>
                        <p className="font-display text-[10px] text-muted-foreground">/{collection.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-muted-foreground line-clamp-2 max-w-lg">{collection.description || 'No description provided.'}</p>
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
