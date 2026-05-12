import { collections } from '../src/data/collections';
import { getPublishedProducts } from '../src/lib/catalog';

collections.forEach(c => {
  const count = getPublishedProducts().filter((product) => product.collectionSlug === c.slug).length;
  console.log(`Collection ${c.slug}: ${count} products`);
});
