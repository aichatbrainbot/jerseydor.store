import type { Metadata } from 'next';
import { LegalPageTemplate } from '@/components/LegalPageTemplate';
import { getLegalPage } from '@/data/legal';

const page = getLegalPage('returns')!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  openGraph: {
    title: page.title,
    description: page.description,
    url: '/returns',
    images: ['https://jerseydor.store/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: page.title,
    description: page.description,
    images: ['https://jerseydor.store/og-image.png'],
  },
};

export default function ReturnsPage() {
  return <LegalPageTemplate page={page} />;
}
