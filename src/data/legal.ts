export type LegalSection = {
  title: string;
  body: string;
};

export type LegalPage = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  updated: string;
  sections: LegalSection[];
};

export const legalPages: LegalPage[] = [
  {
    slug: 'shipping',
    title: 'Shipping Policy',
    eyebrow: 'Support',
    description: 'Delivery expectations, dispatch timing, tracking, and international shipping notes for JerseyDor orders.',
    updated: 'May 9, 2026',
    sections: [
      {
        title: 'Order Processing',
        body: 'Orders are prepared after payment confirmation. Custom name and number products may require additional handling time before dispatch.',
      },
      {
        title: 'Delivery Timing',
        body: 'Estimated delivery windows depend on destination, courier capacity, and customs processing. Delivery estimates shown at checkout are guidance, not guaranteed arrival dates.',
      },
      {
        title: 'Tracking',
        body: 'When tracking is available, customers receive a tracking reference by email after the parcel is dispatched.',
      },
      {
        title: 'International Orders',
        body: 'International customers may be responsible for import duties, taxes, or local handling fees charged by their country.',
      },
    ],
  },
  {
    slug: 'returns',
    title: 'Returns & Exchanges',
    eyebrow: 'Support',
    description: 'Return eligibility, exchange notes, and custom product limitations for JerseyDor customers.',
    updated: 'May 9, 2026',
    sections: [
      {
        title: 'Return Window',
        body: 'Eligible items may be returned within 14 days of delivery if they are unused, unworn, unwashed, and in original condition.',
      },
      {
        title: 'Custom Products',
        body: 'Products customized with a name, number, initials, or player print are final sale unless there is a confirmed production fault.',
      },
      {
        title: 'Exchanges',
        body: 'Size exchanges depend on stock availability. If the requested size is unavailable, store credit or refund options may be offered.',
      },
      {
        title: 'Return Shipping',
        body: 'Customers are responsible for return shipping unless the item arrived damaged, incorrect, or defective.',
      },
    ],
  },
  {
    slug: 'size-guide',
    title: 'Size Guide',
    eyebrow: 'Fit',
    description: 'Simple fit guidance for fan version, player version, kids kits, women shirts, and streetwear styling.',
    updated: 'May 9, 2026',
    sections: [
      {
        title: 'Fan Version Fit',
        body: 'Fan version shirts usually have a more relaxed everyday fit. Choose your regular size for casual wear.',
      },
      {
        title: 'Player Version Fit',
        body: 'Player version shirts are typically slimmer and more athletic. Size up if you prefer a relaxed streetwear silhouette.',
      },
      {
        title: 'Kids Kits',
        body: 'Kids sizing can vary by brand and season. If between sizes, choose the larger size for longer wear.',
      },
      {
        title: 'Streetwear Styling',
        body: 'For an oversized fashion look, many customers choose one size up from their usual jersey size.',
      },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    eyebrow: 'Help',
    description: 'How to contact JerseyDor for order support, sizing questions, and product requests.',
    updated: 'May 9, 2026',
    sections: [
      {
        title: 'Customer Support',
        body: 'For order questions, sizing help, or product requests, contact support with your order number and the email used at checkout.',
      },
      {
        title: 'Product Requests',
        body: 'Looking for a specific club, national team, retro shirt, or player version? Send the product name and preferred size.',
      },
      {
        title: 'Response Time',
        body: 'Support messages are normally reviewed within 1-2 business days during launch preparation.',
      },
      {
        title: 'Email',
        body: 'support@jerseydor.store',
      },
    ],
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    eyebrow: 'Legal',
    description: 'How JerseyDor may collect, use, and protect customer information.',
    updated: 'May 9, 2026',
    sections: [
      {
        title: 'Information We Collect',
        body: 'We may collect information needed to process orders, provide support, improve the storefront, and communicate about purchases.',
      },
      {
        title: 'How Information Is Used',
        body: 'Customer information is used for order handling, customer service, fraud prevention, analytics, and required operational communication.',
      },
      {
        title: 'Cookies & Local Storage',
        body: 'The storefront may use cookies or local storage for cart behavior, country and currency preference, and basic shopping experience improvements.',
      },
      {
        title: 'Third Parties',
        body: 'Payment, analytics, shipping, and platform providers may process information according to their own policies when connected in production.',
      },
    ],
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    eyebrow: 'Legal',
    description: 'Basic terms for using JerseyDor and purchasing from the storefront.',
    updated: 'May 9, 2026',
    sections: [
      {
        title: 'Store Use',
        body: 'By using this storefront, customers agree to use the site lawfully and provide accurate information during checkout.',
      },
      {
        title: 'Product Information',
        body: 'We aim to present product images, descriptions, sizes, and prices accurately. Minor differences may occur due to supplier photography or display settings.',
      },
      {
        title: 'Pricing & Currency',
        body: 'Currency conversion shown on the site may be approximate. Final payment currency and amount are confirmed at checkout.',
      },
      {
        title: 'Brand Notice',
        body: 'JerseyDor is an independent retail concept and is not affiliated with official clubs, leagues, or sportswear brands unless explicitly stated.',
      },
    ],
  },
];

export function getLegalPage(slug: string) {
  return legalPages.find((page) => page.slug === slug);
}
