import type { NextConfig } from "next";
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.jerseydor.store',
          },
        ],
        destination: 'https://jerseydor.store/:path*',
        permanent: true,
      },
      // Legacy Shopify /pages/* redirects
      {
        source: '/pages/returns-refunds',
        destination: '/returns',
        permanent: true,
      },
      {
        source: '/pages/refund-policy',
        destination: '/returns',
        permanent: true,
      },
      {
        source: '/pages/privacy-policy',
        destination: '/privacy-policy',
        permanent: true,
      },
      {
        source: '/pages/shipping',
        destination: '/shipping',
        permanent: true,
      },
      {
        source: '/pages/shipping-policy',
        destination: '/shipping',
        permanent: true,
      },
      {
        source: '/pages/terms-of-service',
        destination: '/terms-of-service',
        permanent: true,
      },
      {
        source: '/pages/contact',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/pages/size-guide',
        destination: '/size-guide',
        permanent: true,
      },
      // Catch-all for any other /pages/ routes to redirect to home
      {
        source: '/pages/:slug',
        destination: '/',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      }
    ],
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
})

export default withMDX(nextConfig);
