import { getProductBySlug } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';

interface ProductEmbedProps {
  slug: string;
}

export function ProductEmbed({ slug }: ProductEmbedProps) {
  const product = getProductBySlug(slug);

  if (!product) return null;

  return (
    <div className="not-prose my-12 max-w-sm mx-auto">
      <ProductCard product={product} />
    </div>
  );
}
