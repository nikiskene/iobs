// supabase/functions/identity-discovery/extraction.ts
import { hashContent, isIdentityHeadline } from './gdelt.ts';
import type { GdeltArticle } from './gdelt.ts';
import type { EntityRow, SourceRow } from './db.ts';

export type CandidateSignal = {
  entity_id: string;
  document: {
    canonical_url: string;
    title: string;
    snippet: string | null;
    published_at: string | null;
    language: string | null;
    source_region: string;
    content_hash: string;
    source_id: string | null;
    source_name: string | null;
    domain: string | null;
  };
  signal: {
    speaker_type: string;
    evidence_text: string;
    classification: string;
    signal_type: string | null;
    direction: string;
    explicitness: string;
    candidate_sentence: string;
    model_interpretation: string | null;
    model_confidence: number | null;
    extraction_model: string | null;
    prompt_version: string | null;
  };
};

const CONTEXT_KEYWORDS = ['launches', 'invests', 'appoints', 'reports', 'earnings', 'revenue', 'quarterly'];

export function matchEntities(
  article: GdeltArticle,
  entities: EntityRow[],
): EntityRow[] {
  const titleLower = article.title.toLowerCase();
  const snippetLower = (article.snippet ?? '').toLowerCase();
  return entities.filter((e) => {
    const names = [e.name, ...e.aliases].map((n) => n.toLowerCase());
    return names.some((n) => titleLower.includes(n) || snippetLower.includes(n));
  });
}

export function classifyHeadline(title: string): {
  signal_type: string | null;
  classification: string;
  is_context: boolean;
} {
  const lower = title.toLowerCase();
  if (CONTEXT_KEYWORDS.some((k) => lower.includes(k)) && !isIdentityHeadline(title)) {
    return { signal_type: null, classification: 'context', is_context: true };
  }
  if (lower.includes('we are') || lower.includes('we remain')) {
    return { signal_type: 'definition', classification: 'what', is_context: false };
  }
  if (lower.includes('purpose') || lower.includes('mission')) {
    return { signal_type: 'purpose', classification: 'what', is_context: false };
  }
  if (lower.includes('become') || lower.includes('future of') || lower.includes('aims to be')) {
    return { signal_type: 'aspiration', classification: 'what', is_context: false };
  }
  if (lower.includes('will be known') || lower.includes('committed to')) {
    return { signal_type: 'promise', classification: 'what', is_context: false };
  }
  if (lower.includes('no longer') || lower.includes('shifts from')) {
    return { signal_type: 'rejection', classification: 'what', is_context: false };
  }
  if (lower.includes('is becoming') || lower.includes('repositions')) {
    return { signal_type: 'external_interpretation', classification: 'what', is_context: false };
  }
  return { signal_type: null, classification: 'context', is_context: true };
}

export function buildHeuristicCandidate(
  article: GdeltArticle,
  entity: EntityRow,
  source: SourceRow | null,
): CandidateSignal {
  const classification = classifyHeadline(article.title);
  const contentHash = hashContent(article.url, article.title);
  return {
    entity_id: entity.id,
    document: {
      canonical_url: article.url,
      title: article.title,
      snippet: article.snippet?.slice(0, 500) ?? null,
      published_at: article.publishedAt,
      language: article.language,
      source_region: source?.region ?? entity.region ?? 'global',
      content_hash: contentHash,
      source_id: source?.id ?? null,
      source_name: source?.name ?? article.sourceName,
      domain: article.domain ?? source?.domain ?? null,
    },
    signal: {
      speaker_type: classification.is_context ? 'system' : 'editorial',
      evidence_text: article.snippet ?? article.title,
      classification: classification.classification,
      signal_type: classification.signal_type,
      direction: 'unclear',
      explicitness: 'strongly_implied',
      candidate_sentence: article.title,
      model_interpretation: 'Heuristic candidate: no AI extraction model available.',
      model_confidence: 0.25,
      extraction_model: 'heuristic-v1',
      prompt_version: 'heuristic-v1',
    },
  };
}
