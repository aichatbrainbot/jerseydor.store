import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { LegalPage } from '@/data/legal';

export function LegalPageTemplate({ page }: { page: LegalPage }) {
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

      <section className="grid gap-4 py-10 md:grid-cols-2">
        {page.sections.map((section) => (
          <article key={section.title} className="brand-card p-5 md:p-6">
            <h2 className="font-heading text-2xl font-black">{section.title}</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{section.body}</p>
          </article>
        ))}
      </section>

      <section className="brand-panel grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-7">
        <div>
          <p className="brand-eyebrow mb-3">Need help?</p>
          <h2 className="font-heading text-2xl font-black">Contact JerseyDor support.</h2>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-display text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          Contact support
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}
