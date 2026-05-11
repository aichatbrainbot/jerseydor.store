import type { Metadata } from 'next';
import { LegalPageTemplate } from '@/components/LegalPageTemplate';
import { getLegalPage } from '@/data/legal';

const page = getLegalPage('returns')!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
};

export default function ReturnsPage() {
  return <LegalPageTemplate page={page} />;
}
