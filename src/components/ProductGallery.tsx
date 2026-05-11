'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { type MouseEvent, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type ProductGalleryProps = {
  title: string;
  images: string[];
  collectionLabel: string;
};

export function ProductGallery({ title, images, collectionLabel }: ProductGalleryProps) {
  const galleryImages = useMemo(() => Array.from(new Set(images)).filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  function showPrevious() {
    setActiveIndex((index) => (index === 0 ? galleryImages.length - 1 : index - 1));
  }

  function showNext() {
    setActiveIndex((index) => (index === galleryImages.length - 1 ? 0 : index + 1));
  }

  function handleZoomMove(event: MouseEvent<HTMLDivElement>) {
    if (!isZoomMode) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }

  function handleZoomClick(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setOrigin(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    setIsZoomMode((value) => !value);
  }

  return (
    <div className="grid gap-2 md:grid-cols-[78px_minmax(0,1fr)] md:items-start">
      {galleryImages.length > 1 && (
        <div className="order-2 flex gap-2 overflow-x-auto pb-1 md:order-1 md:max-h-[680px] md:flex-col md:overflow-y-auto md:overflow-x-hidden md:pb-0 md:pr-1">
          {galleryImages.slice(0, 10).map((img, index) => (
            <button
              key={`${img}-${index}`}
              type="button"
              aria-label={`Show product image ${index + 1}`}
              onClick={() => {
                setActiveIndex(index);
                setIsZoomMode(false);
                setOrigin('50% 50%');
              }}
              className={cn(
                'relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-sm border bg-muted transition md:h-[78px] md:w-[72px]',
                activeIndex === index
                  ? 'border-primary shadow-[0_0_24px_rgba(205,176,112,0.16)]'
                  : 'border-border/70 opacity-70 hover:border-primary/50 hover:opacity-100'
              )}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="78px"
              />
            </button>
          ))}
        </div>
      )}

      <div className="brand-panel order-1 overflow-hidden p-1.5 shadow-[0_22px_80px_rgba(0,0,0,0.34)] md:order-2 md:p-3">
      <div
        className={cn(
          'group relative aspect-[4/5] overflow-hidden rounded-md border border-border/70 bg-muted',
          isZoomMode ? 'cursor-zoom-out' : 'cursor-zoom-in'
        )}
        onClick={handleZoomClick}
        onMouseLeave={() => {
          setOrigin('50% 50%');
        }}
        onMouseMove={handleZoomMove}
      >
        <Image
          key={activeImage}
          src={activeImage}
          alt={`${title} product view ${activeIndex + 1}`}
          fill
          className={cn(
            'object-cover transition-transform duration-300 ease-out',
            isZoomMode ? 'scale-[1.28]' : 'scale-100'
          )}
          style={{ transformOrigin: origin }}
          sizes="(max-width: 1024px) 100vw, 58vw"
          priority
        />
        <div className="absolute left-4 top-4 rounded-full border border-primary/25 bg-background/75 px-3 py-1 font-display text-xs font-semibold uppercase text-primary backdrop-blur">
          {collectionLabel}
        </div>
        <div className="absolute right-4 top-4 hidden items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 font-display text-xs text-muted-foreground backdrop-blur md:flex">
          {isZoomMode ? <X className="size-3.5 text-primary" /> : <Maximize2 className="size-3.5 text-primary" />}
          {isZoomMode ? 'Zoom active' : 'Click to zoom'}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background/70 to-transparent pointer-events-none" />

        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous product image"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
                setIsZoomMode(false);
                setOrigin('50% 50%');
              }}
              className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border/70 bg-background/70 text-foreground opacity-0 backdrop-blur transition group-hover:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next product image"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
                setIsZoomMode(false);
                setOrigin('50% 50%');
              }}
              className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-border/70 bg-background/70 text-foreground opacity-0 backdrop-blur transition group-hover:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
