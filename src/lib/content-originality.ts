import type { Product } from '@/data/products';

export type ContentAuditIssue =
  | 'repeated_opening_sentence'
  | 'generic_catalog_language'
  | 'similar_description'
  | 'low_readability'
  | 'keyword_repetition'
  | 'repeated_description_pattern';

export type FlaggedContentProduct = {
  id: string;
  slug: string;
  title: string;
  score: number;
  issues: ContentAuditIssue[];
  openingSentence: string;
  genericPhrases: string[];
  repeatedKeywords: string[];
  similarProductSlugs: string[];
  readabilityScore: number;
};

export type SimilarDescriptionCluster = {
  productSlugs: string[];
  averageSimilarity: number;
};

export type RepeatedPhrase = {
  phrase: string;
  count: number;
};

const GENERIC_PHRASES = [
  'show your support',
  'perfect for match days',
  'perfect for match day',
  'everyday wear',
  'high-quality materials',
  'must-have',
  'customise your jersey',
  'customize your jersey',
  'name and number',
  'real product image',
  'catalog preview item',
  'multiple size variants',
  'imported csv product',
  'moisture-wicking',
  'keeps you dry',
  'official club crest',
  'support your team',
];

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'this',
  'that',
  'your',
  'you',
  'are',
  'from',
  'into',
  'have',
  'has',
  'its',
  'our',
  'their',
  'they',
  'them',
  'his',
  'her',
  'was',
  'were',
  'will',
  'shirt',
  'jersey',
  'football',
]);

function normalizeDescription(value: string) {
  return value
    .replace(/[#*_>`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function getOpeningSentence(description: string) {
  const normalized = normalizeDescription(description);
  const withoutHeading = normalized.replace(/^.+?\s{2,}/, '');
  return withoutHeading.split(/[.!?]/)[0]?.trim() ?? '';
}

function getWordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

function getSentenceCount(text: string) {
  return Math.max(1, text.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0).length);
}

function countSyllables(word: string) {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!normalized) return 0;
  const groups = normalized.match(/[aeiouy]+/g)?.length ?? 1;
  return Math.max(1, normalized.endsWith('e') ? groups - 1 : groups);
}

function getReadabilityScore(text: string) {
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = Math.max(1, words.length);
  const sentenceCount = getSentenceCount(text);
  const syllableCount = words.reduce((total, word) => total + countSyllables(word), 0);

  return Math.round(206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount));
}

function getGenericPhrases(description: string) {
  const normalized = description.toLowerCase();
  return GENERIC_PHRASES.filter((phrase) => normalized.includes(phrase));
}

function getRepeatedKeywords(description: string) {
  const counts = tokenize(description).reduce<Record<string, number>>((summary, token) => {
    summary[token] = (summary[token] ?? 0) + 1;
    return summary;
  }, {});

  return Object.entries(counts)
    .filter(([, count]) => count >= 5)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([token]) => token);
}

function getTrigrams(description: string) {
  const tokens = tokenize(description);
  const trigrams = new Set<string>();

  for (let index = 0; index < tokens.length - 2; index += 1) {
    trigrams.add(tokens.slice(index, index + 3).join(' '));
  }

  return trigrams;
}

function getSimilarity(first: Set<string>, second: Set<string>) {
  if (first.size === 0 || second.size === 0) return 0;

  let intersection = 0;
  first.forEach((value) => {
    if (second.has(value)) intersection += 1;
  });

  return intersection / (first.size + second.size - intersection);
}

function getRepeatedPhrases(descriptions: string[]) {
  const phraseCounts = descriptions.reduce<Record<string, number>>((summary, description) => {
    const tokens = tokenize(description);
    const localPhrases = new Set<string>();

    for (let index = 0; index < tokens.length - 3; index += 1) {
      localPhrases.add(tokens.slice(index, index + 4).join(' '));
    }

    localPhrases.forEach((phrase) => {
      summary[phrase] = (summary[phrase] ?? 0) + 1;
    });

    return summary;
  }, {});

  return Object.entries(phraseCounts)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 30)
    .map(([phrase, count]) => ({ phrase, count }));
}

function buildSimilarityClusters(flaggedProducts: FlaggedContentProduct[]) {
  const seen = new Set<string>();
  const clusters: SimilarDescriptionCluster[] = [];

  flaggedProducts.forEach((product) => {
    if (seen.has(product.slug) || product.similarProductSlugs.length === 0) return;

    const productSlugs = [product.slug, ...product.similarProductSlugs].filter((slug, index, values) => values.indexOf(slug) === index);
    productSlugs.forEach((slug) => seen.add(slug));

    clusters.push({
      productSlugs,
      averageSimilarity: Number((product.score / 100).toFixed(2)),
    });
  });

  return clusters.slice(0, 20);
}

export function auditContentOriginality(products: Product[]) {
  const descriptions = products.map((product) => normalizeDescription(product.description));
  const repeatedPhrases = getRepeatedPhrases(descriptions);
  const openingCounts = products.reduce<Record<string, number>>((summary, product) => {
    const openingSentence = getOpeningSentence(product.description).toLowerCase();
    if (openingSentence.length > 24) {
      summary[openingSentence] = (summary[openingSentence] ?? 0) + 1;
    }
    return summary;
  }, {});
  const trigramBySlug = new Map(products.map((product) => [product.slug, getTrigrams(product.description)]));
  const similarBySlug = new Map<string, string[]>();

  products.forEach((product, index) => {
    const firstTrigrams = trigramBySlug.get(product.slug) ?? new Set<string>();

    products.slice(index + 1).forEach((candidate) => {
      const similarity = getSimilarity(firstTrigrams, trigramBySlug.get(candidate.slug) ?? new Set<string>());

      if (similarity >= 0.62) {
        similarBySlug.set(product.slug, [...(similarBySlug.get(product.slug) ?? []), candidate.slug]);
        similarBySlug.set(candidate.slug, [...(similarBySlug.get(candidate.slug) ?? []), product.slug]);
      }
    });
  });

  const flaggedProducts = products
    .map<FlaggedContentProduct>((product) => {
      const description = normalizeDescription(product.description);
      const openingSentence = getOpeningSentence(description);
      const genericPhrases = getGenericPhrases(description);
      const repeatedKeywords = getRepeatedKeywords(description);
      const similarProductSlugs = similarBySlug.get(product.slug) ?? [];
      const readabilityScore = getReadabilityScore(description);
      const issues: ContentAuditIssue[] = [];

      if ((openingCounts[openingSentence.toLowerCase()] ?? 0) > 1) issues.push('repeated_opening_sentence');
      if (genericPhrases.length >= 2) issues.push('generic_catalog_language');
      if (similarProductSlugs.length > 0) issues.push('similar_description');
      if (readabilityScore < 35 || getWordCount(description) / getSentenceCount(description) > 35) issues.push('low_readability');
      if (repeatedKeywords.length > 0) issues.push('keyword_repetition');
      if (repeatedPhrases.some((phrase) => description.toLowerCase().includes(phrase.phrase))) {
        issues.push('repeated_description_pattern');
      }

      const score = Math.max(
        0,
        100
          - (issues.includes('repeated_opening_sentence') ? 20 : 0)
          - (issues.includes('generic_catalog_language') ? 20 : 0)
          - (issues.includes('similar_description') ? 25 : 0)
          - (issues.includes('low_readability') ? 15 : 0)
          - (issues.includes('keyword_repetition') ? 10 : 0)
          - (issues.includes('repeated_description_pattern') ? 20 : 0)
      );

      return {
        id: product.id,
        slug: product.slug,
        title: product.title,
        score,
        issues,
        openingSentence,
        genericPhrases,
        repeatedKeywords,
        similarProductSlugs,
        readabilityScore,
      };
    })
    .filter((product) => product.issues.length > 0)
    .sort((a, b) => a.score - b.score || a.title.localeCompare(b.title));

  return {
    totalPublishedProducts: products.length,
    repeatedPatternCount: flaggedProducts.filter((product) => product.issues.includes('repeated_description_pattern')).length,
    similarDescriptionClusters: buildSimilarityClusters(flaggedProducts.filter((product) => product.issues.includes('similar_description'))),
    mostRepeatedPhrases: repeatedPhrases,
    productsNeedingRewrite: flaggedProducts.length,
    flaggedProducts,
  };
}
