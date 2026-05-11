import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/data/products';
import { ArrowUpRight, Eye } from 'lucide-react';
import { Price } from '@/components/Price';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hoverImage = product.gallery[1] ?? product.image;

  return (
    <article className="group brand-card overflow-hidden p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.26)] hover:shadow-[0_24px_80px_rgba(205,176,112,0.11)] md:p-2">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.035] group-hover:opacity-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <Image
            src={hoverImage}
            alt={`${product.title} styled preview`}
            fill
            className="object-cover opacity-0 transition duration-700 group-hover:scale-[1.035] group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute left-2.5 top-2.5 flex max-w-[calc(100%-1.25rem)] flex-wrap gap-1.5 md:left-3 md:top-3 md:gap-2">
            {product.badges.slice(0, 3).map((badge) => (
              <span key={badge} className="rounded-full border border-primary/25 bg-background/72 px-2 py-1 font-display text-[9px] font-semibold uppercase text-primary backdrop-blur-md md:px-2.5 md:text-[10px]">
                {badge}
              </span>
            ))}
          </div>
          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center justify-between rounded-full border border-border/70 bg-background/82 px-3 py-2 text-xs backdrop-blur-md">
              <span className="flex items-center gap-2 font-display font-semibold text-foreground">
                <Eye className="size-3.5 text-primary" />
                Quick preview
              </span>
              <span className="font-display text-muted-foreground">View fit</span>
            </div>
          </div>
        </div>
        <div className="flex items-start justify-between gap-3 px-1 pb-2 pt-3 md:gap-4 md:pt-4">
          <div className="min-w-0">
            <h3 className="line-clamp-2 font-heading text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary md:text-lg">
              {product.title}
            </h3>
            <p className="mt-1 line-clamp-1 font-display text-xs text-muted-foreground md:text-sm">{product.tags.join(' / ')}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <Price amount={product.price} className="font-display text-xs font-semibold text-foreground md:text-sm" />
            <ArrowUpRight className="hidden size-4 text-muted-foreground transition group-hover:text-primary md:block" />
          </div>
        </div>
      </Link>
    </article>
  );
}
