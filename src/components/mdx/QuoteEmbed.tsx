import React from 'react';
import { Quote } from 'lucide-react';

interface QuoteEmbedProps {
  quote: string;
  author?: string;
  role?: string;
}

export function QuoteEmbed({ quote, author, role }: QuoteEmbedProps) {
  return (
    <figure className="not-prose my-14 -mx-4 sm:mx-0">
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-accent/5 px-8 py-10 sm:px-12 sm:py-12">
        {/* Large background quote icon */}
        <Quote className="absolute -right-2 -top-2 h-28 w-28 text-primary/5 rotate-180" aria-hidden="true" />

        {/* Accent bar */}
        <div className="mb-6 h-0.5 w-12 bg-primary rounded-full" />

        <blockquote className="font-heading text-xl sm:text-2xl font-bold leading-[1.5] text-foreground">
          &ldquo;{quote}&rdquo;
        </blockquote>

        {(author || role) && (
          <figcaption className="mt-6 flex flex-col gap-0.5">
            {author && (
              <span className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
                — {author}
              </span>
            )}
            {role && (
              <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">
                {role}
              </span>
            )}
          </figcaption>
        )}
      </div>
    </figure>
  );
}
