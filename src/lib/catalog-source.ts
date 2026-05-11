import { publishedProductSlugs } from '@/data/published-products';
import { products, type Product } from '@/data/products';
import { applyAdminProductOverride, getAdminProductOverrides } from '@/lib/admin-product-overrides';

const STORE_BRAND_NAME = 'JerseyDor';
const publishedProductSlugSet = new Set<string>(publishedProductSlugs);

export type CatalogSourceKind = 'local-products';
export type CatalogVisibility = 'all' | 'published' | 'indexable' | 'merchantEligible';
export type CatalogStatusFilter = 'all' | 'published' | 'unpublished';
export type CatalogFeaturedFilter = 'all' | 'featured' | 'not_featured';
export type CatalogStockFilter = 'all' | 'in_stock' | 'out_of_stock';
export type CatalogEraFilter = 'all' | 'retro' | 'new';

export type CatalogProductQuery = {
  search?: string;
  status?: CatalogStatusFilter;
  featured?: CatalogFeaturedFilter;
  stock?: CatalogStockFilter;
  era?: CatalogEraFilter;
  collectionSlug?: string;
  page?: number;
  pageSize?: number;
};

export type CatalogProductPage = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  source: CatalogSourceKind;
  virtualization: {
    strategy: 'server-pagination';
    rowEstimatePx: number;
  };
};

export type CatalogOperationalStats = {
  total: number;
  published: number;
  unpublished: number;
  featured: number;
  source: CatalogSourceKind;
};

export type CatalogSource = {
  kind: CatalogSourceKind;
  capabilities: {
    productOverrides: boolean;
    merchantFlags: boolean;
    seoOverrides: boolean;
    shopifyVariantMappings: boolean;
    bulkOperations: boolean;
    pagination: boolean;
    virtualizationReady: boolean;
  };
  getAllProducts: () => Product[];
  getPublishedProducts: () => Product[];
  getIndexableProducts: () => Product[];
  getMerchantEligibleProducts: () => Product[];
  getProductBySlug: (slug: string) => Product | undefined;
  getPublishedProductBySlug: (slug: string) => Product | undefined;
  listProducts: (query: CatalogProductQuery) => CatalogProductPage;
  getOperationalStats: () => CatalogOperationalStats;
};

function applyProductOverride(product: Product, overrides = getAdminProductOverrides()) {
  return applyAdminProductOverride(product, overrides[product.slug]);
}

export function isPublishedProduct(product: Product, overrides = getAdminProductOverrides()) {
  const adminProduct = applyProductOverride(product, overrides);

  if (adminProduct.published === false) return false;
  if (adminProduct.published === true) return true;

  return product.published === true || publishedProductSlugSet.has(product.slug);
}

function isIndexableProduct(product: Product, overrides = getAdminProductOverrides()) {
  const adminProduct = applyProductOverride(product, overrides);

  return isPublishedProduct(product, overrides) && adminProduct.indexable !== false;
}

function getStableProductIdentifier(product: Product) {
  return product.sku || product.id || product.slug;
}

export function normalizePublishedProduct(product: Product): Product {
  const stableIdentifier = getStableProductIdentifier(product);

  return {
    ...product,
    inventoryStatus: product.inventoryStatus ?? 'in_stock',
    condition: product.condition ?? 'new',
    brand: product.brand || STORE_BRAND_NAME,
    sku: product.sku || stableIdentifier,
    mpn: product.mpn || (product.gtin ? undefined : stableIdentifier),
  };
}

function normalizeSearch(value: string | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

function getStockStatus(product: Product) {
  return product.inventoryStatus === 'out_of_stock' ? 'out_of_stock' : 'in_stock';
}

function isRetroProduct(product: Product) {
  const haystack = [product.title, product.slug, product.collectionSlug, ...(product.tags ?? []), ...(product.badges ?? [])]
    .join(' ')
    .toLowerCase();

  return product.collectionSlug === 'retro-archive' || haystack.includes('retro') || haystack.includes('vintage');
}

function getSearchHaystack(product: Product) {
  const yearMatches = `${product.title} ${product.slug}`.match(/\b(19|20)\d{2}(?:[-/]\d{2,4})?\b/g) ?? [];

  return [
    product.title,
    product.slug,
    product.sku,
    product.id,
    product.collectionSlug,
    ...(product.tags ?? []),
    ...(product.badges ?? []),
    ...(product.features ?? []),
    ...yearMatches,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function matchesCatalogQuery(product: Product, query: CatalogProductQuery, overrides: ReturnType<typeof getAdminProductOverrides>) {
  const search = normalizeSearch(query.search);
  const isPublished = isPublishedProduct(product, overrides);
  const adminProduct = applyProductOverride(product, overrides);
  const isFeatured = adminProduct.featured === true;
  const stockStatus = getStockStatus(adminProduct);

  if (search && !getSearchHaystack(adminProduct).includes(search)) return false;
  if (query.status === 'published' && !isPublished) return false;
  if (query.status === 'unpublished' && isPublished) return false;
  if (query.featured === 'featured' && !isFeatured) return false;
  if (query.featured === 'not_featured' && isFeatured) return false;
  if (query.stock === 'in_stock' && stockStatus !== 'in_stock') return false;
  if (query.stock === 'out_of_stock' && stockStatus !== 'out_of_stock') return false;
  if (query.era === 'retro' && !isRetroProduct(adminProduct)) return false;
  if (query.era === 'new' && isRetroProduct(adminProduct)) return false;
  if (query.collectionSlug && query.collectionSlug !== 'all' && adminProduct.collectionSlug !== query.collectionSlug) return false;

  return true;
}

function getPageBounds(query: CatalogProductQuery, total: number) {
  const pageSize = Number.isInteger(query.pageSize) && query.pageSize && query.pageSize > 0 ? Math.min(query.pageSize, 250) : 100;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const requestedPage = Number.isInteger(query.page) && query.page && query.page > 0 ? query.page : 1;
  const page = Math.min(requestedPage, totalPages);

  return {
    page,
    pageSize,
    totalPages,
    start: (page - 1) * pageSize,
    end: page * pageSize,
  };
}

export const localCatalogSource: CatalogSource = {
  kind: 'local-products',
  capabilities: {
    productOverrides: true,
    merchantFlags: true,
    seoOverrides: false,
    shopifyVariantMappings: true,
    bulkOperations: true,
    pagination: true,
    virtualizationReady: true,
  },
  getAllProducts() {
    const overrides = getAdminProductOverrides();

    return products.map((product) => applyProductOverride(product, overrides));
  },
  getPublishedProducts() {
    const overrides = getAdminProductOverrides();

    return products
      .filter((product) => isPublishedProduct(product, overrides))
      .map((product) => normalizePublishedProduct(applyProductOverride(product, overrides)));
  },
  getIndexableProducts() {
    const overrides = getAdminProductOverrides();

    return products
      .filter((product) => isIndexableProduct(product, overrides))
      .map((product) => normalizePublishedProduct(applyProductOverride(product, overrides)));
  },
  getMerchantEligibleProducts() {
    return this.getPublishedProducts().filter((product) => product.merchantEligible === true);
  },
  getProductBySlug(slug: string) {
    const product = products.find((item) => item.slug === slug);

    return product ? applyProductOverride(product) : undefined;
  },
  getPublishedProductBySlug(slug: string) {
    const overrides = getAdminProductOverrides();
    const product = products.find((item) => item.slug === slug);

    return product && isPublishedProduct(product, overrides)
      ? normalizePublishedProduct(applyProductOverride(product, overrides))
      : undefined;
  },
  listProducts(query) {
    const overrides = getAdminProductOverrides();
    const filteredProducts = products
      .filter((product) => matchesCatalogQuery(product, query, overrides))
      .map((product) => applyProductOverride(product, overrides));
    const bounds = getPageBounds(query, filteredProducts.length);

    return {
      items: filteredProducts.slice(bounds.start, bounds.end),
      total: filteredProducts.length,
      page: bounds.page,
      pageSize: bounds.pageSize,
      totalPages: bounds.totalPages,
      source: this.kind,
      virtualization: {
        strategy: 'server-pagination',
        rowEstimatePx: 52,
      },
    };
  },
  getOperationalStats() {
    const overrides = getAdminProductOverrides();
    const published = products.filter((product) => isPublishedProduct(product, overrides)).length;
    const featured = products.filter((product) => applyProductOverride(product, overrides).featured === true).length;

    return {
      total: products.length,
      published,
      unpublished: products.length - published,
      featured,
      source: this.kind,
    };
  },
};

export function getCatalogSource() {
  return localCatalogSource;
}
