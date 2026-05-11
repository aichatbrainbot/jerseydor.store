import { getPublishedProducts } from '@/lib/catalog';
import { validateProductForMerchant } from '@/lib/merchant-validation';

export const dynamic = 'force-dynamic';

function escapeXml(value: string | number) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function stripMarkdown(value: string) {
  return value
    .replaceAll('#', '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatAvailability(value: 'in_stock' | 'out_of_stock') {
  return value === 'out_of_stock' ? 'out of stock' : 'in stock';
}

function formatPrice(price: number) {
  return `${price.toFixed(2)} USD`;
}

// Internal preview only. This is not the production Google Merchant feed until
// checkout, shipping, returns, and final Merchant settings are production-ready.
export async function GET() {
  const validationResults = getPublishedProducts().map(validateProductForMerchant);
  const validResults = validationResults.filter((result) => result.isValid);

  const items = validResults.map(({ product, canonicalUrl }) => {
    const mpn = product.mpn ?? product.sku ?? product.id ?? product.slug;

    return [
      '    <item>',
      `      <g:id>${escapeXml(product.sku ?? product.id)}</g:id>`,
      `      <g:title>${escapeXml(product.title)}</g:title>`,
      `      <g:description>${escapeXml(stripMarkdown(product.description))}</g:description>`,
      `      <g:link>${escapeXml(canonicalUrl)}</g:link>`,
      `      <g:image_link>${escapeXml(product.image)}</g:image_link>`,
      `      <g:availability>${escapeXml(formatAvailability(product.inventoryStatus ?? 'in_stock'))}</g:availability>`,
      `      <g:price>${escapeXml(formatPrice(product.price))}</g:price>`,
      `      <g:condition>${escapeXml(product.condition ?? 'new')}</g:condition>`,
      `      <g:brand>${escapeXml(product.brand ?? 'JerseyDor')}</g:brand>`,
      `      <g:mpn>${escapeXml(mpn)}</g:mpn>`,
      '    </item>',
    ].join('\n');
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    '  <channel>',
    '    <title>JerseyDor Merchant Feed Preview</title>',
    '    <link>https://jerseydor.store</link>',
    '    <description>Internal Merchant feed preview for validation only.</description>',
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
