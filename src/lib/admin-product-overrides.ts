import fs from 'node:fs';
import path from 'node:path';
import type { Product } from '@/data/products';

export type AdminProductOverride = {
  slug: string;
  title?: string;
  description?: string;
  price?: number;
  inventoryStatus?: Product['inventoryStatus'];
  published?: boolean;
  featured?: boolean;
  collectionSlug?: string;
  updatedAt?: string;
};

export type AdminProductOverrideInput = Omit<AdminProductOverride, 'slug' | 'updatedAt'>;
export type AdminProductOverrideStorageMode = {
  mode: 'local-json';
  productionSafe: boolean;
  detail: string;
};

const overridesPath = path.join(process.cwd(), 'DATA', 'admin-product-overrides.json');

function ensureOverridesFile() {
  const directory = path.dirname(overridesPath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(overridesPath)) {
    fs.writeFileSync(overridesPath, '{}\n');
  }
}

function normalizeOverride(value: AdminProductOverride): AdminProductOverride {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined && fieldValue !== '')
  ) as AdminProductOverride;
}

export function getAdminProductOverrides() {
  ensureOverridesFile();

  try {
    return JSON.parse(fs.readFileSync(overridesPath, 'utf8')) as Record<string, AdminProductOverride>;
  } catch {
    return {};
  }
}

export function getAdminProductOverride(slug: string) {
  return getAdminProductOverrides()[slug];
}

export function applyAdminProductOverride(product: Product, override = getAdminProductOverride(product.slug)): Product {
  if (!override) return product;

  return {
    ...product,
    title: override.title ?? product.title,
    description: override.description ?? product.description,
    price: override.price ?? product.price,
    inventoryStatus: override.inventoryStatus ?? product.inventoryStatus,
    published: override.published ?? product.published,
    featured: override.featured ?? product.featured,
    collectionSlug: override.collectionSlug ?? product.collectionSlug,
  };
}

export function updateAdminProductOverride(slug: string, input: AdminProductOverrideInput) {
  const overrides = getAdminProductOverrides();
  const nextOverride = normalizeOverride({
    ...overrides[slug],
    ...input,
    slug,
    updatedAt: new Date().toISOString(),
  });

  overrides[slug] = nextOverride;
  fs.writeFileSync(overridesPath, `${JSON.stringify(overrides, null, 2)}\n`);

  return nextOverride;
}

export function getAdminProductOverrideStorageMode(): AdminProductOverrideStorageMode {
  return {
    mode: 'local-json',
    productionSafe: process.env.NODE_ENV !== 'production',
    detail:
      process.env.NODE_ENV === 'production'
        ? 'Local JSON overrides are not durable on serverless production. Move this model to Prisma/PostgreSQL before relying on admin edits in production.'
        : 'Local JSON fallback is active for development without database credentials.',
  };
}
