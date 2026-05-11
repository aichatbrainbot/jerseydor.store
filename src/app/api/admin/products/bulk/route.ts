import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { collections } from '@/data/collections';
import { updateAdminProductOverride } from '@/lib/admin-product-overrides';

const bulkActions = new Set(['publish', 'unpublish', 'feature', 'unfeature', 'assign_collection']);

function getSelectedSlugs(formData: FormData) {
  return formData
    .getAll('slugs')
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function getSafeReturnUrl(request: Request, value: FormDataEntryValue | null) {
  const fallback = new URL('/admin', request.url);
  const rawValue = String(value ?? '');

  if (!rawValue.startsWith('/admin')) return fallback;

  return new URL(rawValue, request.url);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const action = String(formData.get('bulkAction') ?? '');
  const slugs = getSelectedSlugs(formData);
  const returnUrl = getSafeReturnUrl(request, formData.get('returnTo'));

  if (!bulkActions.has(action) || slugs.length === 0) {
    returnUrl.searchParams.set('bulk', 'none');
    return NextResponse.redirect(returnUrl, 303);
  }

  const collectionSlug = String(formData.get('collectionSlug') ?? '');
  const canAssignCollection = collections.some((collection) => collection.slug === collectionSlug);

  if (action === 'assign_collection' && !canAssignCollection) {
    returnUrl.searchParams.set('bulk', 'invalid_collection');
    return NextResponse.redirect(returnUrl, 303);
  }

  slugs.forEach((slug) => {
    if (action === 'publish') updateAdminProductOverride(slug, { published: true });
    if (action === 'unpublish') updateAdminProductOverride(slug, { published: false });
    if (action === 'feature') updateAdminProductOverride(slug, { featured: true });
    if (action === 'unfeature') updateAdminProductOverride(slug, { featured: false });
    if (action === 'assign_collection') updateAdminProductOverride(slug, { collectionSlug });

    revalidatePath(`/products/${slug}`);
  });

  revalidatePath('/admin');
  revalidatePath('/products');
  revalidatePath('/sitemap.xml');

  returnUrl.searchParams.set('bulk', String(slugs.length));
  return NextResponse.redirect(returnUrl, 303);
}
