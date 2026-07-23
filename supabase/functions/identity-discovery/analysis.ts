// supabase/functions/identity-discovery/analysis.ts
import type { EntityRow, getSupabase } from './db.ts';
import type { CandidateSignal } from './extraction.ts';
import { extractWithOpenAI } from './aiExtraction.ts';
import { storeSignal } from './storage.ts';

const CONCURRENCY = 4;

export async function analyzeCandidates(
  supabase: ReturnType<typeof getSupabase>,
  candidates: CandidateSignal[],
  entities: EntityRow[],
): Promise<{ stored: number; errors: number }> {
  const tasks = buildTasks(candidates, entities);
  let cursor = 0;
  let stored = 0;
  let errors = 0;

  async function worker() {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      try {
        const signals = await extractWithOpenAI(task.candidates.map(toArticle), task.entity);
        for (const signal of signals) {
          if (!isUseful(signal)) continue;
          if (await storeSignal(supabase, signal)) stored++;
        }
      } catch (error) {
        console.error('OpenAI extraction batch failed', error);
        errors++;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, worker));
  return { stored, errors };
}

function buildTasks(candidates: CandidateSignal[], entities: EntityRow[]) {
  const tasks: { entity: EntityRow; candidates: CandidateSignal[] }[] = [];
  for (const entity of entities) {
    const matching = candidates.filter((candidate) => candidate.entity_id === entity.id);
    for (let offset = 0; offset < matching.length; offset += 20) {
      tasks.push({ entity, candidates: matching.slice(offset, offset + 20) });
    }
  }
  return tasks;
}

function toArticle(candidate: CandidateSignal) {
  return {
    url: candidate.document.canonical_url,
    title: candidate.document.title,
    snippet: candidate.document.snippet,
    publishedAt: candidate.document.published_at,
    language: candidate.document.language,
    domain: candidate.document.domain,
    sourceName: candidate.document.source_name,
  };
}

function isUseful(signal: CandidateSignal): boolean {
  return signal.signal.classification !== 'context'
    || Number(signal.signal.identity_relevance ?? 0) >= 25;
}
