import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/cart',
        '/checkout',
        '/*?*sort=',
        '/*?*color=',
        '/*?*size=',
        '/*?*category=',
        '/*?*collection=',
        '/*?*price=',
        '/*?*q=',
        '/*?*query=',
      ],
    },
    sitemap: 'https://jerseydor.store/sitemap.xml',
  };
}
