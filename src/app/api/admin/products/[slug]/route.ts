import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { collections } from '@/data/collections';
import { updateAdminProductOverride } from '@/lib/admin-product-overrides';

function parsePrice(value: FormDataEntryValue | null) {
  const price = Number(value);

  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

function parseInventoryStatus(value: FormDataEntryValue | null) {
  return value === 'out_of_stock' ? 'out_of_stock' : 'in_stock';
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const formData = await request.formData();
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const price = parsePrice(formData.get('price'));

  if (!title || !description || price === undefined) {
    return NextResponse.redirect(new URL(`/admin?updated=${encodeURIComponent(slug)}&error=validation`, request.url), 303);
  }

  updateAdminProductOverride(slug, {
    title,
    description,
    price,
    inventoryStatus: parseInventoryStatus(formData.get('inventoryStatus')),
    published: formData.get('published') === 'on',
    featured: formData.get('featured') === 'on',
    collectionSlug: collections.some((collection) => collection.slug === formData.get('collectionSlug'))
      ? String(formData.get('collectionSlug'))
      : undefined,
  });

  revalidatePath('/admin');
  revalidatePath('/products');
  revalidatePath(`/products/${slug}`);
  revalidatePath('/sitemap.xml');

  return NextResponse.redirect(new URL(`/admin?updated=${encodeURIComponent(slug)}`, request.url), 303);
}
