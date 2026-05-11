import React from 'react';
import Image from 'next/image';

interface EditorialImageProps {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square' | 'wide';
}

export function EditorialImage({ src, alt, caption, aspectRatio = 'landscape' }: EditorialImageProps) {
  const aspectClasses = {
    wide: 'aspect-[21/9]',
    landscape: 'aspect-[16/9]',
    portrait: 'aspect-[3/4]',
    square: 'aspect-square',
  };

  return (
    <figure className="not-prose my-14 -mx-4 sm:mx-0">
      <div
        className={`relative w-full overflow-hidden rounded-2xl bg-card border border-border/40 ${aspectClasses[aspectRatio]}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 720px"
          className="object-cover transition-transform duration-700 hover:scale-[1.02]"
        />
        {/* subtle overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
      {caption && (
        <figcaption className="mt-4 text-center font-display text-xs uppercase tracking-widest text-muted-foreground px-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
