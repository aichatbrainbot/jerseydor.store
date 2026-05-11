export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'best-retro-football-jerseys-2026',
    title: 'Best Retro Football Shirts in 2026',
    excerpt: 'Explore vintage-inspired shirts that feel clean enough for a modern streetwear wardrobe.',
    date: '2026-05-01',
    author: 'JerseyDor Editorial',
    image: 'https://images.unsplash.com/photo-1551280857-2b9bbe5260fc?auto=format&fit=crop&q=80&w=1000',
    content: `
Football-inspired fashion is going through a massive renaissance. In 2026, the strongest pieces are not loud replicas, but clean vintage-inspired shirts that fit naturally into a streetwear wardrobe.

## Why Retro Works

The 80s and 90s produced bold collars, geometric patterns, and memorable color blocking. The modern version works best when those ideas are edited down and styled like clothing.

<ProductEmbed slug="bayer-04-leverkusen-2025-26-home-jersey" />

### How to Style Retro Kits

- **Baggy Cargo Pants:** Balance the tailored fit of a retro kit with oversized bottoms.
- **Chunky Sneakers:** Ground your outfit with a heavy silhouette.
- **Minimalist Jewelry:** Let the jersey do the talking. A simple chain is all you need.

Explore our full [Retro Collection](/collections/retro-archive) to find a cleaner vintage-inspired piece.
    `
  },
  {
    id: '2',
    slug: 'how-to-style-oversized-soccer-jerseys',
    title: 'How To Style Oversized Soccer Jerseys',
    excerpt: 'A complete guide to styling oversized football-inspired shirts with cargos, sneakers, and accessories.',
    date: '2026-04-15',
    author: 'Fashion Team',
    image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=1000',
    content: `
Oversized silhouettes are a staple in modern streetwear. When applied to football-inspired shirts, the result is relaxed, effortless, and easy to style beyond the sports context.

## The Tokyo Drift Look

Our signature oversized jersey draws inspiration from neon-lit nights and cyberpunk aesthetics.

<ProductEmbed slug="bayern-munich-2025-26-home-player-jersey" />

### 3 Rules for Oversized Styling

1. **Proportions are Key:** If the top is oversized, keep the bottom relaxed but not overwhelmingly baggy, or go full parachute pants for a Y2K vibe.
2. **Layering:** Wear a long-sleeve tee underneath during cooler months for a dimensional look.
3. **Customization:** A custom name and number add authenticity to your streetwear fit.

Check out our [Football Shirts Collection](/collections/football-shirts) for more options.
    `
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug);
}
