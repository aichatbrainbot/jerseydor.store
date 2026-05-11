import Link from 'next/link';
import { Globe, Mail, MessageCircle } from 'lucide-react';
import { CurrencySelector } from '@/components/CurrencySelector';

export function Footer() {
  const collectionLinks = [
    { href: '/collections/football-shirts', label: 'Football Shirts' },
    { href: '/collections/retro-archive', label: 'Retro Jerseys' },
    { href: '/collections/player-version', label: 'Player Version' },
    { href: '/collections/womens-shirts', label: 'Women Shirts' },
    { href: '/collections/kids-kits', label: 'Kids Kits' },
    { href: '/collections/training-and-apparel', label: 'Training & Apparel' },
  ];

  return (
    <footer className="w-full border-t border-border/60 bg-background py-14 md:py-20">
      <div className="brand-container grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_0.8fr_0.9fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-display text-xs font-bold text-primary">
              JD
            </span>
            <span className="font-heading text-2xl font-black text-foreground">
              JerseyDor
            </span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Premium football jerseys, retro shirts, and off-pitch pieces shaped through streetwear styling and a dark luxury retail language.
          </p>
          <div className="max-w-xs">
            <CurrencySelector />
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Globe className="h-5 w-5" />
              <span className="sr-only">Website</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span className="sr-only">Social</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </Link>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-display text-xs font-semibold uppercase text-foreground">Shop</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
            <li><Link href="/collections/football-shirts" className="hover:text-primary transition-colors">Football Shirts</Link></li>
            <li><Link href="/collections/retro-archive" className="hover:text-primary transition-colors">Retro Jerseys</Link></li>
            <li><Link href="/products?query=custom" className="hover:text-primary transition-colors">Customizable Pieces</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-xs font-semibold uppercase text-foreground">Categories</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {collectionLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-primary transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-xs font-semibold uppercase text-foreground">Company</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/blog" className="hover:text-primary transition-colors">Journal</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            <li><Link href="/size-guide" className="hover:text-primary transition-colors">Size Guide</Link></li>
            <li><Link href="/cart" className="hover:text-primary transition-colors">Bag</Link></li>
            <li><Link href="/checkout" className="hover:text-primary transition-colors">Checkout</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-xs font-semibold uppercase text-foreground">Legal</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping Policy</Link></li>
            <li><Link href="/returns" className="hover:text-primary transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link href="/checkout" className="hover:text-primary transition-colors">Secure Checkout</Link></li>
          </ul>
        </div>
      </div>
      <div className="brand-container mt-12 border-t border-border/60 pt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} JerseyDor. All rights reserved.</p>
        <p className="mt-2 text-xs">Original designs only. Not affiliated with any official clubs or brands.</p>
      </div>
    </footer>
  );
}
