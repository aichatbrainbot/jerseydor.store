import type { Product } from '@/data/products';

const TEAM_STOP_WORDS = new Set([
  'home',
  'away',
  'third',
  'player',
  'version',
  'jersey',
  'shirt',
  'shorts',
  'pants',
  'jacket',
  'top',
  'tee',
  'cap',
  'backpack',
  'socks',
  'kit',
  'kids',
  'women',
  'womens',
  'training',
  'pre',
  'match',
  'downtime',
  'presentation',
  'snapback',
  'casuals',
  'hooded',
  'track',
  'sleeveless',
  'goalkeeper',
  'long',
  'sleeve',
]);

const PRODUCT_TYPE_PATTERNS = [
  { pattern: /kids kit/i, label: 'kids kit' },
  { pattern: /mini kit/i, label: 'mini kit' },
  { pattern: /goalkeeper/i, label: 'goalkeeper jersey' },
  { pattern: /player/i, label: 'player version jersey' },
  { pattern: /jersey/i, label: 'jersey' },
  { pattern: /shirt/i, label: 'shirt' },
  { pattern: /shorts/i, label: 'shorts' },
  { pattern: /pants/i, label: 'training pants' },
  { pattern: /jacket|windrunner|gilet/i, label: 'jacket' },
  { pattern: /track top|training top|drill top|top/i, label: 'training top' },
  { pattern: /tee|t-shirt/i, label: 'tee' },
  { pattern: /cap|snapback/i, label: 'cap' },
  { pattern: /backpack/i, label: 'backpack' },
  { pattern: /socks/i, label: 'socks' },
];

const COLLECTION_LABELS: Record<string, string> = {
  'football-shirts': 'football shirts',
  'retro-archive': 'retro jerseys',
  'player-version': 'player version',
  'womens-shirts': 'women shirts',
  'kids-kits': 'kids kits',
  'training-and-apparel': 'training and apparel',
};

export type ProductContentSection = {
  title: string;
  copy: string;
};

export type ProductDetail = {
  label: string;
  value: string;
};

export type ProductContent = {
  seoDescription: string;
  story: string[];
  sections: ProductContentSection[];
  details: ProductDetail[];
};

function titleCase(value: string) {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function compact(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function truncateAtWord(value: string, maxLength = 160) {
  const text = compact(value);
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength - 1);
  const lastSpace = truncated.lastIndexOf(' ');

  return `${truncated.slice(0, lastSpace > 80 ? lastSpace : maxLength - 1).trim()}.`;
}

function getSeason(title: string) {
  return title.match(/\b(?:19|20)\d{2}(?:[-/]\d{2,4})?\b/)?.[0]?.replace('-', '/') ?? '';
}

function getColor(title: string) {
  return title.match(/\(([^)]+)\)/)?.[1]?.trim() ?? '';
}

function getProductType(title: string) {
  return PRODUCT_TYPE_PATTERNS.find((item) => item.pattern.test(title))?.label ?? 'football product';
}

function getAudience(product: Product) {
  const haystack = `${product.title} ${product.collectionSlug}`.toLowerCase();

  if (haystack.includes('kids') || haystack.includes('youth')) return 'kids';
  if (haystack.includes('women') || haystack.includes('womens') || haystack.includes("women's")) return 'women';
  return '';
}

function getVersion(product: Product) {
  const haystack = `${product.title} ${product.collectionSlug} ${product.badges.join(' ')}`.toLowerCase();

  if (haystack.includes('player') || product.collectionSlug === 'player-version') return 'player version';
  if (haystack.includes('retro') || product.collectionSlug === 'retro-archive') return 'retro-inspired';
  if (haystack.includes('training') || product.collectionSlug === 'training-and-apparel') return 'training and lifestyle';
  return 'fan style';
}

function getStyle(product: Product) {
  const haystack = `${product.title} ${product.badges.join(' ')}`.toLowerCase();

  if (haystack.includes('home')) return 'home';
  if (haystack.includes('away')) return 'away';
  if (haystack.includes('third')) return 'third';
  if (haystack.includes('training')) return 'training';
  if (haystack.includes('pre-match') || haystack.includes('pre match')) return 'pre-match';
  return '';
}

function getTeam(product: Product) {
  const withoutSeason = product.title
    .replace(/\b(?:19|20)\d{2}(?:[-/]\d{2,4})?\b/g, ' ')
    .replace(/\([^)]*\)/g, ' ');

  const words = withoutSeason
    .replace(/[^a-zA-Z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !TEAM_STOP_WORDS.has(word.toLowerCase()));

  if (words.length > 0) return compact(words.slice(0, 4).join(' '));

  return product.tags
    .filter((tag) => !TEAM_STOP_WORDS.has(tag.toLowerCase()))
    .slice(0, 3)
    .map(titleCase)
    .join(' ');
}

function joinNatural(items: string[]) {
  const values = items.filter(Boolean);
  if (values.length <= 1) return values[0] ?? '';
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
}

function sizeCopy(productType: string, version: string, audience: string) {
  if (audience === 'kids') {
    return `Choose the age or height range closest to the wearer, and size up when they are between sizes. This ${productType} is best treated as an active, easy-moving piece rather than a tight collector fit.`;
  }

  if (version === 'player version') {
    return `Player version pieces usually sit closer through the chest and sleeves. Choose your usual size for a sharper athletic fit, or size up for a relaxed streetwear shape.`;
  }

  if (productType.includes('pants') || productType.includes('shorts')) {
    return `Pick your usual bottoms size for an easy training fit. If you prefer more room for layering or casual wear, sizing up keeps the silhouette relaxed.`;
  }

  return `Choose your usual shirt size for a clean everyday fit. Size up if you want the looser terrace or streetwear shape often used with football shirts.`;
}

function materialCopy(productType: string, color: string) {
  const colorText = color ? ` The ${color.toLowerCase()} colorway keeps the styling clear and easy to pair.` : '';

  if (productType.includes('cap') || productType.includes('backpack')) {
    return `Built as an everyday accessory, this piece is selected for practical use with football-inspired styling.${colorText}`;
  }

  if (productType.includes('pants') || productType.includes('shorts') || productType.includes('jacket') || productType.includes('top')) {
    return `The feel is geared toward movement, layering, and day-to-day comfort rather than heavy occasion wear.${colorText}`;
  }

  return `The fabric feel is intended for regular wear: light enough for matchday layers and comfortable enough for casual outfits.${colorText}`;
}

function usageCopy(team: string, productType: string, category: string) {
  const subject = team || `this ${category}`;

  if (productType.includes('cap') || productType.includes('backpack')) {
    return `Use it as a subtle football accessory with travel, training, or everyday outfits. It works best when paired with simple layers and a clean shirt or jacket.`;
  }

  if (productType.includes('pants') || productType.includes('shorts') || productType.includes('jacket') || productType.includes('top')) {
    return `Wear it for warmups, travel days, and casual football styling. It gives ${subject} supporters a practical piece beyond the usual shirt rotation.`;
  }

  return `Wear it on matchdays, for five-a-side, or as the main piece in a football streetwear outfit. It gives ${subject} a clear visual role without needing loud styling.`;
}

function comparisonCopy(subject: string, productType: string, category: string, tags: string[]) {
  const tagText = joinNatural(tags.slice(0, 3).map(titleCase));

  if (productType.includes('cap') || productType.includes('backpack')) {
    return `Use the photos, price, and option details to compare this accessory with other ${category} pieces. ${tagText ? `${tagText} gives the item its place in the range.` : `${subject} keeps the styling focused and easy to understand.`}`;
  }

  if (productType.includes('pants') || productType.includes('shorts') || productType.includes('jacket') || productType.includes('top')) {
    return `Compare it by silhouette, color, and intended use: warmup layer, travel piece, or casual football apparel. ${tagText ? `${tagText} helps describe the style without adding unsupported claims.` : `${subject} is the main reference point for the item.`}`;
  }

  return `Compare it by season, cut, color, and whether it belongs in a matchday or everyday rotation. ${tagText ? `${tagText} helps describe the style without adding unsupported claims.` : `${subject} is the main reference point for the item.`}`;
}

function decisionCopy(product: Product, productType: string, version: string) {
  if (version === 'player version') {
    return `For ${product.title}, the key checks are the closer fit, size choice, product photos, and any supported print fields. That keeps the page useful without claiming licensing details not present in the product data.`;
  }

  if (productType.includes('cap') || productType.includes('backpack')) {
    return `For ${product.title}, focus on the shown shape, color, everyday use, and delivery details before checkout. The page stays practical and avoids unsupported brand or licensing promises.`;
  }

  if (productType.includes('pants') || productType.includes('shorts') || productType.includes('jacket') || productType.includes('top')) {
    return `For ${product.title}, focus on comfort, movement, layering, and whether the item fits your training or streetwear use. The page keeps the buying details clear without adding unsupported promises.`;
  }

  return `For ${product.title}, check fit, comfort, use, personalization, shipping, and the product details below before checkout. The page stays useful without adding unsupported brand or licensing claims.`;
}

function personalizationCopy(product: Product) {
  if (product.isCustomizable) {
    return 'Name and number options can be added when the product form shows supported fields. Check spelling and number choices carefully before adding the item to your bag.';
  }

  return 'This item is sold without custom name or number fields. Keep the selection focused on size, quantity, and the shown product style.';
}

function shippingCopy() {
  return 'Shipping is calculated at checkout, with free shipping shown for qualifying larger orders. Returns depend on condition and customization status, so review size and print choices before checkout.';
}

function makeStory(product: Product) {
  const productType = getProductType(product.title);
  const season = getSeason(product.title);
  const color = getColor(product.title);
  const audience = getAudience(product);
  const version = getVersion(product);
  const style = getStyle(product);
  const team = getTeam(product);
  const category = COLLECTION_LABELS[product.collectionSlug] ?? product.collectionSlug.replaceAll('-', ' ');
  const detailLine = joinNatural([
    season ? `${season} season` : '',
    style ? `${style} styling` : '',
    color ? `${color.toLowerCase()} colorway` : '',
    audience ? `${audience} fit` : '',
  ]);
  const subject = team || product.title;
  const first = compact(
    `${product.title} is a ${version} ${productType} in the ${category} range.${detailLine ? ` It brings together ${detailLine} for a clear, easy-to-shop product page.` : ''}`
  );
  const second = compact(comparisonCopy(subject, productType, category, product.tags));
  const third = compact(`${usageCopy(team, productType, category)} Review the size choice, customization fields, and delivery details before checkout, especially when adding a name or number.`);
  const fourth = compact(decisionCopy(product, productType, version));

  return [first, second, third, fourth];
}

function makeSeoDescription(product: Product) {
  const version = getVersion(product);
  const audience = getAudience(product);
  const productType = getProductType(product.title);
  const modifiers = [
    version === 'player version' ? 'closer player-version fit' : '',
    audience === 'kids' ? 'kids sizing notes' : '',
    audience === 'women' ? "women's fit context" : '',
    product.collectionSlug === 'training-and-apparel' ? 'training and everyday wear details' : '',
  ].filter(Boolean);
  const modifierText = modifiers.length > 0 ? ` Includes ${joinNatural(modifiers)}.` : '';

  return truncateAtWord(
    `Shop ${product.title} at JerseyDor. See photos, sizing notes, customization options, price, availability, and delivery details before checkout.${modifierText}`,
    productType.includes('player') || modifiers.length > 0 ? 175 : 165
  );
}

function makeDetails(product: Product): ProductDetail[] {
  const season = getSeason(product.title);
  const color = getColor(product.title);
  const audience = getAudience(product);
  const style = getStyle(product);
  const team = getTeam(product);

  return [
    { label: 'Product type', value: titleCase(getProductType(product.title)) },
    { label: 'Collection', value: titleCase(COLLECTION_LABELS[product.collectionSlug] ?? product.collectionSlug.replaceAll('-', ' ')) },
    season ? { label: 'Season', value: season } : undefined,
    team ? { label: 'Team / theme', value: team } : undefined,
    style ? { label: 'Style', value: titleCase(style) } : undefined,
    color ? { label: 'Color', value: color } : undefined,
    audience ? { label: 'Audience', value: titleCase(audience) } : undefined,
    { label: 'Condition', value: titleCase(product.condition ?? 'new') },
    { label: 'Availability', value: product.inventoryStatus === 'out_of_stock' ? 'Out of stock' : 'In stock' },
    product.sku ? { label: 'SKU', value: product.sku } : undefined,
  ].filter((item): item is ProductDetail => Boolean(item));
}

export function getProductContent(product: Product): ProductContent {
  const productType = getProductType(product.title);
  const version = getVersion(product);
  const audience = getAudience(product);
  const color = getColor(product.title);
  const team = getTeam(product);
  const category = COLLECTION_LABELS[product.collectionSlug] ?? product.collectionSlug.replaceAll('-', ' ');
  const story = makeStory(product);

  return {
    seoDescription: makeSeoDescription(product),
    story,
    sections: [
      { title: 'Fit & sizing', copy: sizeCopy(productType, version, audience) },
      { title: 'Material feel / comfort', copy: materialCopy(productType, color) },
      { title: 'Matchday and streetwear use', copy: usageCopy(team, productType, category) },
      { title: 'Personalization note', copy: personalizationCopy(product) },
      { title: 'Shipping / returns', copy: shippingCopy() },
      {
        title: 'Product details',
        copy: `Key details are kept close to the product: ${joinNatural(makeDetails(product).slice(0, 5).map((item) => `${item.label.toLowerCase()} ${item.value}`))}.`,
      },
    ],
    details: makeDetails(product),
  };
}
