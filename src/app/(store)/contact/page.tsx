import type { Metadata } from 'next';
import { getLegalPage } from '@/data/legal';
import { ContactForm } from '@/components/ContactForm';

const page = getLegalPage('contact')!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  openGraph: {
    title: page.title,
    description: page.description,
    url: '/contact',
    images: ['https://jerseydor.store/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: page.title,
    description: page.description,
    images: ['https://jerseydor.store/og-image.png'],
  },
};

export default function ContactPage() {
  return (
    <div className="brand-container py-14 md:py-24">
      <header className="grid gap-6 border-b border-border/60 pb-10 md:grid-cols-[1fr_0.72fr] md:items-end">
        <div>
          <p className="brand-eyebrow mb-5">{page.eyebrow}</p>
          <h1 className="brand-title">{page.title}</h1>
        </div>
        <div>
          <p className="brand-subtitle">{page.description}</p>
          <p className="mt-4 font-display text-xs font-semibold uppercase text-muted-foreground">
            Last updated: {page.updated}
          </p>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div>
          <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-loose">
            <h2 className="font-heading text-2xl font-black text-foreground">Get in touch</h2>
            {page.sections.map((section) => (
              <div key={section.title} className="mt-6">
                <h3 className="font-heading text-lg font-bold text-foreground">{section.title}</h3>
                <p>{section.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
