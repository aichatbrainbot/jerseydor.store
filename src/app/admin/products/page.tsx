import type { Metadata } from 'next';
import Image from 'next/image';
import {
  CheckCircle2,
  CircleOff,
  Database,
  Edit3,
  FileSearch,
  Globe2,
  Layers3,
  LogOut,
  Package,
  PanelLeft,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
} from 'lucide-react';
import { collections } from '@/data/collections';
import { getAdminProductOverrideStorageMode } from '@/lib/admin-product-overrides';
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout';

export const metadata: Metadata = {
  title: 'Products | JerseyDor Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

type AdminSearchParams = {
  q?: string;
  status?: string;
  featured?: string;
  stock?: string;
  era?: string;
  collection?: string;
  page?: string;
  edit?: string;
  updated?: string;
  bulk?: string;
  error?: string;
};

type Props = {
  searchParams: Promise<AdminSearchParams>;
};

const ADMIN_PAGE_SIZE = 25;
const ADMIN_ROW_ESTIMATED_HEIGHT = 52;
const MIN_SEARCH_LENGTH = 2;
const fieldClass =
  'h-9 rounded-md border border-border/70 bg-background/70 px-2.5 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';



function normalizeText(value: string | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function parsePage(value: string | undefined) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getCollectionTitle(slug: string) {
  return collections.find((collection) => collection.slug === slug)?.title ?? slug;
}

function getStockStatus(product: { inventoryStatus?: 'in_stock' | 'out_of_stock' }) {
  return product.inventoryStatus === 'out_of_stock' ? 'out_of_stock' : 'in_stock';
}

function buildAdminHref(params: AdminSearchParams, updates: Partial<AdminSearchParams>) {
  const search = new URLSearchParams();
  const nextParams = {
    ...params,
    ...updates,
  };

  Object.entries(nextParams).forEach(([key, value]) => {
    if (value && value !== 'all' && key !== 'updated' && key !== 'bulk' && key !== 'error') {
      search.set(key, value);
    }
  });

  return `/admin/products${search.toString() ? `?${search.toString()}` : ''}`;
}

function getCompactDescription(description: string) {
  const text = normalizeText(description.replace(/[#*_>`]/g, ' '));

  return text.length > 86 ? `${text.slice(0, 86)}...` : text;
}

function getBulkMessage(value: string | undefined) {
  if (value === 'none') return 'Select products and a valid bulk action first.';
  if (value === 'invalid_collection') return 'Choose a valid collection before assigning products.';
  if (value) return `Bulk update applied to ${value} selected product${value === '1' ? '' : 's'}.`;

  return undefined;
}

function getActiveFilterLabels(params: AdminSearchParams) {
  const labels: string[] = [];

  if (params.q) labels.push(`Search: ${params.q}`);
  if (params.status && params.status !== 'all') labels.push(params.status);
  if (params.featured && params.featured !== 'all') labels.push(params.featured.replace('_', ' '));
  if (params.stock && params.stock !== 'all') labels.push(params.stock.replaceAll('_', ' '));
  if (params.era && params.era !== 'all') labels.push(params.era);
  if (params.collection && params.collection !== 'all') labels.push(getCollectionTitle(params.collection));

  return labels;
}

function StatusPill({
  tone,
  children,
}: {
  tone: 'green' | 'gold' | 'muted' | 'red';
  children: React.ReactNode;
}) {
  const toneClass = {
    green: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
    gold: 'border-primary/35 bg-primary/10 text-primary',
    muted: 'border-border/70 bg-muted/35 text-muted-foreground',
    red: 'border-destructive/35 bg-destructive/10 text-destructive',
  }[tone];

  return (
    <span className={`inline-flex h-6 items-center gap-1 rounded-full border px-2 font-display text-[10px] uppercase ${toneClass}`}>
      {children}
    </span>
  );
}

async function loadCatalogWindow(params: AdminSearchParams, hasSearch: boolean) {
  if (!hasSearch && !params.edit) {
    return {
      productPage: undefined,
      selectedProduct: undefined,
      isPublishedProduct: undefined,
    };
  }

  const catalog = await import('@/lib/catalog');
  const productPage = hasSearch
    ? catalog.getCatalogProductPage({
        search: params.q,
        status: params.status === 'published' || params.status === 'unpublished' ? params.status : 'all',
        featured: params.featured === 'featured' || params.featured === 'not_featured' ? params.featured : 'all',
        stock: params.stock === 'in_stock' || params.stock === 'out_of_stock' ? params.stock : 'all',
        era: params.era === 'retro' || params.era === 'new' ? params.era : 'all',
        collectionSlug: params.collection,
        page: parsePage(params.page),
        pageSize: ADMIN_PAGE_SIZE,
      })
    : undefined;
  const selectedProduct = params.edit ? catalog.getProductBySlug(params.edit) : undefined;

  return {
    productPage,
    selectedProduct,
    isPublishedProduct: catalog.isPublishedProduct,
  };
}

export default async function AdminPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const query = normalizeText(resolvedSearchParams.q);
  const hasSearch = query.length >= MIN_SEARCH_LENGTH;
  const storageMode = getAdminProductOverrideStorageMode();
  const { productPage, selectedProduct, isPublishedProduct } = await loadCatalogWindow(resolvedSearchParams, hasSearch);
  const visibleProducts = productPage?.items ?? [];
  const currentPage = productPage?.page ?? 1;
  const totalPages = productPage?.totalPages ?? 1;
  const currentPath = buildAdminHref(resolvedSearchParams, { page: String(currentPage) });
  const bulkMessage = getBulkMessage(resolvedSearchParams.bulk);
  const activeFilters = getActiveFilterLabels(resolvedSearchParams);
  const firstVisibleItem = productPage && productPage.total > 0 ? (currentPage - 1) * productPage.pageSize + 1 : 0;
  const lastVisibleItem = productPage ? Math.min(currentPage * productPage.pageSize, productPage.total) : 0;

  return (
    <AdminDashboardLayout storageMode={storageMode}>
          <header className="brand-panel mb-4 overflow-hidden">
            <div className="flex flex-col justify-between gap-4 border-b border-border/60 bg-card/60 p-4 lg:flex-row lg:items-center">
              <div>
                <p className="brand-eyebrow mb-2 inline-flex items-center gap-2">
                  <PanelLeft className="size-4" />
                  Fast catalog radar
                </p>
                <h1 className="font-heading text-2xl font-black md:text-3xl">Search, inspect, edit</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  This admin view does not render the full catalog. Type a product name or slug to open a small editable window.
                </p>
              </div>

              <button
                type="button"
                disabled
                className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-full border border-primary/30 px-3 font-display text-xs font-bold uppercase text-primary/70"
                title="Requires database-backed product creation before it can be enabled safely."
              >
                Add locked
              </button>
            </div>

            <section className="grid gap-px bg-border/50 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Default load', value: 'No full table', icon: Package },
                { label: 'Search window', value: `${ADMIN_PAGE_SIZE} rows`, icon: Search },
                { label: 'Shopify media', value: 'Later', icon: ShieldCheck },
                { label: 'Source', value: storageMode.mode, icon: Database },
              ].map((stat) => {
                const Icon = stat.icon;

                return (
                  <div key={stat.label} className="bg-card/80 px-3 py-2.5">
                    <p className="flex items-center gap-2 font-display text-[10px] uppercase text-muted-foreground">
                      <Icon className="size-3.5 text-primary" />
                      {stat.label}
                    </p>
                    <p className="mt-1 font-display text-lg font-bold">{stat.value}</p>
                  </div>
                );
              })}
            </section>
          </header>

          <p className="mb-3 rounded-md border border-border/70 bg-card/40 px-3 py-2 text-xs leading-5 text-muted-foreground">
            {storageMode.detail}
          </p>

          {resolvedSearchParams.updated && (
            <p className="mb-3 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              JerseyDor catalog update saved for {resolvedSearchParams.updated}.
            </p>
          )}

          {bulkMessage && (
            <p className="mb-3 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {bulkMessage}
            </p>
          )}

          <div className="sticky top-0 z-30 mb-3 rounded-lg border border-border/70 bg-background/95 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <form className="grid gap-2 lg:grid-cols-[minmax(280px,1.4fr)_repeat(5,minmax(112px,1fr))_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="q"
                  type="search"
                  defaultValue={resolvedSearchParams.q ?? ''}
                  placeholder="Type product name, slug, SKU, team, league, year"
                  className={`${fieldClass} w-full pl-8`}
                />
              </div>
              <select name="status" defaultValue={resolvedSearchParams.status ?? 'all'} className={fieldClass}>
                <option value="all">All status</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
              <select name="featured" defaultValue={resolvedSearchParams.featured ?? 'all'} className={fieldClass}>
                <option value="all">All spotlight</option>
                <option value="featured">Featured</option>
                <option value="not_featured">Not featured</option>
              </select>
              <select name="stock" defaultValue={resolvedSearchParams.stock ?? 'all'} className={fieldClass}>
                <option value="all">All stock</option>
                <option value="in_stock">In stock</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
              <select name="era" defaultValue={resolvedSearchParams.era ?? 'all'} className={fieldClass}>
                <option value="all">Retro/new</option>
                <option value="retro">Retro</option>
                <option value="new">New</option>
              </select>
              <select name="collection" defaultValue={resolvedSearchParams.collection ?? 'all'} className={fieldClass}>
                <option value="all">All collections</option>
                {collections.map((collection) => (
                  <option key={collection.slug} value={collection.slug}>
                    {collection.title}
                  </option>
                ))}
              </select>
              <button className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-primary px-4 font-display text-xs font-bold text-primary-foreground">
                <Search className="size-3.5" />
                Search
              </button>
            </form>

            <div className="mt-2 flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
              {hasSearch ? (
                <form id="admin-bulk-form" action="/api/admin/products/bulk" method="post" className="flex flex-wrap gap-2">
                  <input type="hidden" name="returnTo" value={currentPath} />
                  <select name="bulkAction" className={fieldClass}>
                    <option value="">Bulk action</option>
                    <option value="publish">Publish selected</option>
                    <option value="unpublish">Unpublish selected</option>
                    <option value="feature">Mark featured</option>
                    <option value="unfeature">Remove featured</option>
                    <option value="assign_collection">Assign collection</option>
                  </select>
                  <select name="collectionSlug" className={fieldClass}>
                    <option value="">Collection</option>
                    {collections.map((collection) => (
                      <option key={collection.slug} value={collection.slug}>
                        {collection.title}
                      </option>
                    ))}
                  </select>
                  <button className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-primary/40 px-4 font-display text-xs font-bold uppercase text-primary transition hover:bg-primary hover:text-primary-foreground">
                    <CheckCircle2 className="size-3.5" />
                    Apply
                  </button>
                </form>
              ) : (
                <p className="text-xs leading-5 text-muted-foreground">
                  Write at least {MIN_SEARCH_LENGTH} characters. The catalog table stays closed until you search.
                </p>
              )}

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {activeFilters.length > 0 ? (
                  activeFilters.map((filter) => (
                    <span key={filter} className="rounded-full border border-primary/25 bg-primary/10 px-2 py-1 font-display text-[10px] uppercase text-primary">
                      {filter}
                    </span>
                  ))
                ) : (
                  <span>Fast mode active</span>
                )}
                {activeFilters.length > 0 && (
                  <a href="/admin/products" className="font-display text-[10px] uppercase text-primary underline-offset-4 hover:underline">
                    Clear
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className={selectedProduct ? 'grid gap-3 2xl:grid-cols-[minmax(0,1fr)_380px]' : ''}>
            <section className="brand-panel min-w-0 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-card/70 px-3 py-2">
                <p className="font-display text-xs font-semibold uppercase text-muted-foreground">
                  {productPage
                    ? `${firstVisibleItem.toLocaleString('en-US')}-${lastVisibleItem.toLocaleString('en-US')} of ${productPage.total.toLocaleString('en-US')} matches`
                    : 'No catalog rows rendered'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {productPage
                    ? `Page ${currentPage.toLocaleString('en-US')} of ${totalPages.toLocaleString('en-US')} · source ${productPage.source} · window ${productPage.pageSize}`
                    : 'Search is required before loading product rows.'}
                </p>
              </div>

              {!hasSearch && (
                <div className="grid min-h-[260px] place-items-center p-8 text-center">
                  <div className="max-w-md">
                    <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                      <Search className="size-5" />
                    </div>
                    <h2 className="font-heading text-xl font-black">Search one product first</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      This keeps admin fast on a 16k+ catalog. Use the search box for product edits, then connect Shopify media checks in a later phase.
                    </p>
                  </div>
                </div>
              )}

              {hasSearch && visibleProducts.length === 0 && (
                <div className="grid min-h-[220px] place-items-center p-8 text-center">
                  <div className="max-w-md">
                    <h2 className="font-heading text-xl font-black">No product found</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Try a team name, exact slug, SKU, league, or year.
                    </p>
                  </div>
                </div>
              )}

              {hasSearch && visibleProducts.length > 0 && (
                <>
                  <div className="max-h-[68vh] overflow-auto" data-virtualization-ready="true" data-row-height={ADMIN_ROW_ESTIMATED_HEIGHT}>
                    <table className="w-full min-w-[1120px] table-fixed border-collapse text-left text-xs">
                      <thead className="sticky top-0 z-10 bg-background/95 font-display text-[10px] uppercase text-muted-foreground backdrop-blur">
                        <tr>
                          <th className="w-[44px] px-2 py-2">Sel</th>
                          <th className="w-[330px] px-2 py-2">Product</th>
                          <th className="w-[140px] px-2 py-2">Catalog</th>
                          <th className="w-[78px] px-2 py-2">Price</th>
                          <th className="w-[104px] px-2 py-2">Stock</th>
                          <th className="w-[108px] px-2 py-2">Visibility</th>
                          <th className="w-[96px] px-2 py-2">Feature</th>
                          <th className="px-2 py-2">Content</th>
                          <th className="w-[72px] px-2 py-2">Edit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleProducts.map((product) => {
                          const isPublished = isPublishedProduct?.(product) ?? false;
                          const isInStock = getStockStatus(product) === 'in_stock';
                          const isEditing = selectedProduct?.slug === product.slug;

                          return (
                            <tr
                              key={product.slug}
                              className={`h-[52px] border-t border-border/50 align-middle transition hover:bg-muted/20 ${isEditing ? 'bg-primary/5' : ''}`}
                            >
                              <td className="px-2 py-1">
                                <input form="admin-bulk-form" name="slugs" type="checkbox" value={product.slug} className="size-3.5" />
                              </td>
                              <td className="px-2 py-1">
                                <div className="flex min-w-0 items-center gap-2">
                                  <div className="relative size-9 shrink-0 overflow-hidden rounded border border-border/70 bg-background/70">
                                    <Image src={product.image} alt="" fill sizes="36px" className="object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate font-heading text-xs font-bold leading-4">{product.title}</p>
                                    <p className="truncate font-display text-[10px] text-muted-foreground">
                                      {product.slug} · SKU {product.sku ?? product.id}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="truncate px-2 py-1 text-[11px] text-muted-foreground">
                                {getCollectionTitle(product.collectionSlug)}
                              </td>
                              <td className="px-2 py-1 font-display text-xs font-bold">${product.price.toFixed(2)}</td>
                              <td className="px-2 py-1">
                                <StatusPill tone={isInStock ? 'green' : 'red'}>
                                  {isInStock ? <Truck className="size-3" /> : <CircleOff className="size-3" />}
                                  {isInStock ? 'Stock' : 'Out'}
                                </StatusPill>
                              </td>
                              <td className="px-2 py-1">
                                <StatusPill tone={isPublished ? 'green' : 'muted'}>
                                  {isPublished ? <Globe2 className="size-3" /> : <CircleOff className="size-3" />}
                                  {isPublished ? 'Live' : 'Hidden'}
                                </StatusPill>
                              </td>
                              <td className="px-2 py-1">
                                <StatusPill tone={product.featured ? 'gold' : 'muted'}>
                                  <Star className="size-3" />
                                  {product.featured ? 'Hero' : 'Std'}
                                </StatusPill>
                              </td>
                              <td className="truncate px-2 py-1 text-[11px] leading-4 text-muted-foreground">
                                {getCompactDescription(product.description)}
                              </td>
                              <td className="px-2 py-1">
                                <a
                                  href={buildAdminHref(resolvedSearchParams, { edit: product.slug })}
                                  className="inline-flex h-7 items-center justify-center gap-1 rounded-full border border-primary/35 px-2 font-display text-[10px] font-bold uppercase text-primary transition hover:bg-primary hover:text-primary-foreground"
                                >
                                  <Edit3 className="size-3" />
                                  Edit
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-card/70 p-3">
                    <a
                      href={buildAdminHref(resolvedSearchParams, { page: String(Math.max(1, currentPage - 1)), edit: undefined })}
                      className="inline-flex h-8 items-center gap-2 rounded-full border border-border/70 px-3 font-display text-[10px] font-semibold uppercase text-muted-foreground transition hover:border-primary/50 hover:text-primary"
                    >
                      Previous
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {firstVisibleItem.toLocaleString('en-US')}-{lastVisibleItem.toLocaleString('en-US')} of{' '}
                      {productPage?.total.toLocaleString('en-US')}
                    </p>
                    <a
                      href={buildAdminHref(resolvedSearchParams, { page: String(Math.min(totalPages, currentPage + 1)), edit: undefined })}
                      className="inline-flex h-8 items-center gap-2 rounded-full border border-border/70 px-3 font-display text-[10px] font-semibold uppercase text-muted-foreground transition hover:border-primary/50 hover:text-primary"
                    >
                      Next
                    </a>
                  </div>
                </>
              )}
            </section>

            {selectedProduct && (
              <aside className="brand-panel h-fit p-4 2xl:sticky 2xl:top-[116px]">
                <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/60 pb-3">
                  <div>
                    <p className="brand-eyebrow mb-2">Quick edit</p>
                    <h2 className="line-clamp-2 font-heading text-xl font-black">{selectedProduct.title}</h2>
                    <p className="mt-1 break-all font-display text-[11px] text-muted-foreground">{selectedProduct.slug}</p>
                  </div>
                  <a
                    href={buildAdminHref(resolvedSearchParams, { edit: undefined })}
                    className="grid size-8 place-items-center rounded-full border border-border/70 text-muted-foreground transition hover:border-primary/50 hover:text-primary"
                    aria-label="Close editor"
                  >
                    <X className="size-4" />
                  </a>
                </div>

                <form action={`/api/admin/products/${selectedProduct.slug}`} method="post" className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Title</label>
                    <input name="title" defaultValue={selectedProduct.title} className={`${fieldClass} w-full font-heading font-bold`} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Price</label>
                      <input name="price" type="number" min="0" step="0.01" defaultValue={selectedProduct.price} className={`${fieldClass} w-full`} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Stock</label>
                      <select name="inventoryStatus" defaultValue={getStockStatus(selectedProduct)} className={`${fieldClass} w-full`}>
                        <option value="in_stock">In stock</option>
                        <option value="out_of_stock">Out of stock</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Collection</label>
                      <select name="collectionSlug" defaultValue={selectedProduct.collectionSlug} className={`${fieldClass} w-full`}>
                        {collections.map((collection) => (
                          <option key={collection.slug} value={collection.slug}>
                            {collection.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Shopify Variant ID</label>
                      <input name="shopifyVariantId" defaultValue={selectedProduct.shopifyVariantId || ''} placeholder="e.g. 4501239" className={`${fieldClass} w-full`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-md border border-border/70 bg-background/45 p-3">
                    <label className="flex items-center gap-2 font-display text-xs text-muted-foreground">
                      <input name="published" type="checkbox" defaultChecked={isPublishedProduct?.(selectedProduct) ?? false} className="size-4" />
                      Live
                    </label>
                    <label className="flex items-center gap-2 font-display text-xs text-muted-foreground">
                      <input name="featured" type="checkbox" defaultChecked={selectedProduct.featured === true} className="size-4" />
                      Hero pick
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-display text-[10px] font-semibold uppercase text-muted-foreground">Product story</label>
                    <textarea
                      name="description"
                      defaultValue={selectedProduct.description}
                      rows={8}
                      className="w-full rounded-md border border-border/70 bg-background/70 px-3 py-2 text-xs leading-5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 font-display text-xs font-bold text-primary-foreground">
                    <CheckCircle2 className="size-4" />
                    Save product
                  </button>
                </form>
              </aside>
            )}
          </div>
    </AdminDashboardLayout>
  );
}
