import type { Metadata } from 'next';
import { LegalPageTemplate } from '@/components/LegalPageTemplate';
import { getLegalPage } from '@/data/legal';

const page = getLegalPage('privacy-policy')!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
};

export default function PrivacyPolicyPage() {
  return <LegalPageTemplate page={page} />;
}
