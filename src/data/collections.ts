export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  seoDescription: string;
}

export const collections: Collection[] = [
  {
    id: '1',
    slug: 'football-shirts',
    title: 'Football Shirts',
    description: 'Main catalog of home, away, third, and special edition shirts.',
    image: 'https://cdn.shopify.com/s/files/1/0684/9783/4240/files/51100_6BackgroundRemoved.png',
    seoDescription: 'Browse the full football shirts catalog with real product images, prices, size variants, and customizable shirt options.',
  },
  {
    id: '2',
    slug: 'retro-archive',
    title: 'Retro Jerseys',
    description: 'Classic football jerseys, reissues, anniversary editions, and older season pieces.',
    image: 'https://cdn.shopify.com/s/files/1/0684/9783/4240/files/re_1712277981_2024-2025-portugal-away-football-shirt.jpg',
    seoDescription: 'Shop retro football jerseys, reissue shirts, anniversary jerseys, and classic football products.',
  },
  {
    id: '3',
    slug: 'player-version',
    title: 'Player Version',
    description: 'Authentic and player-fit shirts for a sharper product presentation.',
    image: 'https://cdn.shopify.com/s/files/1/0684/9783/4240/files/51116_6BackgroundRemoved.png',
    seoDescription: 'Explore player version football shirts and authentic-fit jerseys with real product photography.',
  },
  {
    id: '4',
    slug: 'womens-shirts',
    title: 'Women Shirts',
    description: 'Women-fit shirts and kits from the imported catalog.',
    image: 'https://cdn.shopify.com/s/files/1/0684/9783/4240/files/51100_6BackgroundRemoved.png',
    seoDescription: 'Browse women football shirts and women-fit kits with real product images from the imported catalog.',
  },
  {
    id: '5',
    slug: 'kids-kits',
    title: 'Kids Kits',
    description: 'Kids shirts and full kits grouped into one catalog section.',
    image: 'https://cdn.shopify.com/s/files/1/0684/9783/4240/files/25MK0007-0.png',
    seoDescription: 'Shop kids football kits and youth football shirts with real catalog product images.',
  },
  {
    id: '6',
    slug: 'training-and-apparel',
    title: 'Training & Apparel',
    description: 'Training tops, pants, jackets, caps, shorts, and lifestyle apparel.',
    image: 'https://cdn.shopify.com/s/files/1/0684/9783/4240/files/re_1717398597_st-pauli-2024-2025-training-football-pant-dark-chocolate.jpg',
    seoDescription: 'Browse training wear, football pants, jackets, shorts, caps, and apparel from the imported product catalog.',
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find(c => c.slug === slug);
}
