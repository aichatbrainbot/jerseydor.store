import type { Metadata } from 'next';
import { LegalPageTemplate } from '@/components/LegalPageTemplate';
import { getLegalPage } from '@/data/legal';

const page = getLegalPage('terms-of-service')!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
};

export default function TermsOfServicePage() {
  return <LegalPageTemplate page={page} />;
}
