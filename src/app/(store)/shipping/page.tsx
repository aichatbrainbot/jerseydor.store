import type { Metadata } from 'next';
import { LegalPageTemplate } from '@/components/LegalPageTemplate';
import { getLegalPage } from '@/data/legal';

const page = getLegalPage('shipping')!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
};

export default function ShippingPage() {
  return <LegalPageTemplate page={page} />;
}
