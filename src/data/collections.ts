export interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  seoDescription: string;
  content?: string;
  faqs?: { question: string; answer: string }[];
}

export const collections: Collection[] = [
  {
    id: '1',
    slug: 'football-shirts',
    title: 'Football Shirts',
    description: 'Home, away, third, and special edition football shirts.',
    image: 'https://cdn.shopify.com/s/files/1/0684/9783/4240/files/51100_6BackgroundRemoved.png',
    seoDescription: 'Browse football shirts and soccer jerseys with clear product photos, prices, size variants, and customization options.',
    content: 'This collection brings together home, away, third, and special edition football shirts from clubs and national teams worldwide. We focus on clear product pages, useful fit notes, and off-pitch styling context.',
    faqs: [
      {
        question: 'Can I customize these shirts with a name and number?',
        answer: 'Yes, products marked as customizable offer supported options to add names and numbers before adding to your bag.'
      },
      {
        question: 'How are shirt versions described?',
        answer: 'Product pages describe the available version, fit, and customization options based on the current product data. Contact support if you need help before ordering.'
      }
    ]
  },
  {
    id: '2',
    slug: 'retro-archive',
    title: 'Retro Jerseys',
    description: 'Classic football jerseys, reissues, anniversary editions, and older season pieces.',
    image: 'https://cdn.shopify.com/s/files/1/0684/9783/4240/files/re_1712277981_2024-2025-portugal-away-football-shirt.jpg',
    seoDescription: 'Shop retro football jerseys, reissue shirts, anniversary jerseys, and classic football products.',
    content: 'Archive pieces and classic silhouettes that defined eras of football. From the bold graphics of the 90s to minimalist vintage aesthetics, these retro jerseys and reissues are curated for collectors and streetwear enthusiasts alike.',
    faqs: [
      {
        question: 'What is the difference between an original vintage and a reissue?',
        answer: 'Original vintage shirts are period-correct items from that specific year, while reissues are modern remakes produced by the manufacturer to celebrate classic designs.'
      },
      {
        question: 'How do retro shirts fit compared to modern ones?',
        answer: 'Classic shirts, especially from the 90s and early 2000s, typically feature a much looser, oversized fit compared to modern athletic cuts. We recommend checking our size guide or sticking to your usual streetwear size.'
      }
    ]
  },
  {
    id: '3',
    slug: 'player-version',
    title: 'Player Version',
    description: 'Player-fit shirts for a sharper product presentation.',
    image: 'https://cdn.shopify.com/s/files/1/0684/9783/4240/files/51116_6BackgroundRemoved.png',
    seoDescription: 'Explore player version football shirts with closer fits, clear product photos, sizing guidance, and customization options where available.',
    content: 'Player version shirts are selected for shoppers who prefer a closer, sharper football-shirt fit. Product pages keep the focus on photos, sizing guidance, price, and available customization fields.',
    faqs: [
      {
        question: 'Should I size up for player version shirts?',
        answer: 'Yes, player version shirts are designed with a slim, athletic fit. If you prefer a relaxed or streetwear look, we strongly recommend sizing up at least one size.'
      },
      {
        question: 'What are the main differences from replica shirts?',
        answer: 'Player version products usually have a closer fit and different construction details from standard fan-style shirts. Check the product page for the specific item details shown.'
      }
    ]
  },
  {
    id: '4',
    slug: 'womens-shirts',
    title: 'Women Shirts',
    description: 'Women-fit shirts and kits selected for clear browsing.',
    image: 'https://cdn.shopify.com/s/files/1/0684/9783/4240/files/51100_6BackgroundRemoved.png',
    seoDescription: 'Shop women football shirts and soccer jerseys with women-fit sizing context, product photos, and clear buying details.',
    content: 'Football shirts and kits tailored specifically for a women\'s fit. This collection includes national team edits, club releases, and lifestyle pieces designed for comfortable everyday wear and matchday support.',
    faqs: [
      {
        question: 'Do women\'s shirts have the same design details as the men\'s?',
        answer: 'Women-fit products are grouped to make sizing and browsing easier. Check each product page for the photos, fit notes, and buying details available for that item.'
      }
    ]
  },
  {
    id: '5',
    slug: 'kids-kits',
    title: 'Kids Kits',
    description: 'Kids shirts and full kits grouped into one catalog section.',
    image: 'https://cdn.shopify.com/s/files/1/0684/9783/4240/files/25MK0007-0.png',
    seoDescription: 'Browse kids football kits and youth jerseys with sizing guidance, product photos, prices, and checkout details.',
    content: 'Full football kits and youth-sized shirts for the next generation. Our kids collection features durable, comfortable sets complete with matching shorts, perfect for training or supporting their favorite teams.',
    faqs: [
      {
        question: 'Do kids kits include shorts and socks?',
        answer: 'Most of our kids kits come as a full set including the shirt and matching shorts. Please refer to individual product pages to see if socks are included.'
      },
      {
        question: 'How do I choose the right size for my child?',
        answer: 'Kids sizing is typically based on age ranges or height. We recommend checking the specific measurements on the product page to ensure the best fit as they grow.'
      }
    ]
  },
  {
    id: '6',
    slug: 'training-and-apparel',
    title: 'Training & Apparel',
    description: 'Training tops, pants, jackets, caps, shorts, and lifestyle apparel.',
    image: 'https://cdn.shopify.com/s/files/1/0684/9783/4240/files/re_1717398597_st-pauli-2024-2025-training-football-pant-dark-chocolate.jpg',
    seoDescription: 'Browse football training apparel, pants, jackets, caps, shorts, and off-pitch pieces with photos, prices, and sizing notes.',
    content: 'Beyond the matchday shirt. This curated selection of training tops, track pants, warm-up jackets, and lifestyle apparel brings football culture into everyday streetwear.',
    faqs: [
      {
        question: 'Are these items suitable for actual football training?',
        answer: 'Many training and apparel products are suited to casual football styling, layering, and movement. Check the individual product page for the details available for that item.'
      }
    ]
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find(c => c.slug === slug);
}
