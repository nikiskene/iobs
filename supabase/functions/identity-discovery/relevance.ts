// supabase/functions/identity-discovery/relevance.ts
import type { GdeltArticle } from './gdelt.ts';

const WHAT = [
  'we are', 'our purpose', 'our mission', 'we believe', 'we stand for',
  'become', 'known for', 'committed to', 'remain', 'identity', 'our role',
  'future of', 'new direction', 'reposition', 'transform into', 'vision',
];
const HOW = [
  'strategy', 'artificial intelligence', ' ai ', 'digital', 'automation',
  'partnership', 'invest', 'launch', 'expansion', 'efficiency', 'productivity',
  'modernization', 'reform', 'innovation', 'capability', 'transition',
];
const LOW_VALUE = [
  'earnings per share', 'quarterly results', 'dividend', 'stock price',
  'weather', 'sports', 'traffic', 'lottery', 'obituary',
];

export type ScreenedArticle = {
  article: GdeltArticle;
  score: number;
  trigger: 'what' | 'how' | 'context';
};

export function screenArticle(article: GdeltArticle): ScreenedArticle | null {
  const text = ` ${article.title} ${article.snippet ?? ''} `.toLowerCase();
  if (LOW_VALUE.some((term) => text.includes(term))) return null;
  const whatHits = countHits(text, WHAT);
  const howHits = countHits(text, HOW);
  const quoteBonus = /["“”']/.test(text) ? 1 : 0;
  const score = whatHits * 4 + howHits * 2 + quoteBonus;
  if (score < 2) return null;
  return {
    article,
    score,
    trigger: whatHits > 0 ? 'what' : howHits > 0 ? 'how' : 'context',
  };
}

export function prioritizeArticles(articles: GdeltArticle[], limit: number): GdeltArticle[] {
  return articles
    .map(screenArticle)
    .filter((item): item is ScreenedArticle => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.article);
}

function countHits(text: string, terms: string[]): number {
  return terms.reduce((count, term) => count + Number(text.includes(term)), 0);
}
