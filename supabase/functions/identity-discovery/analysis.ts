// supabase/functions/identity-discovery/analysis.ts
import type { EntityRow, getSupabase } from './db.ts';
import type { CandidateSignal } from './extraction.ts';
import { extractWithOpenAI } from './aiExtraction.ts';
import { storeSignal } from './storage.ts';
import { isVerifiedWhat } from './qualityGate.ts';

const CONCURRENCY = 4;

export async function analyzeCandidates(
  supabase: ReturnType<typeof getSupabase>,
  candidates: CandidateSignal[],
  entities: EntityRow[],
): Promise<AnalysisResult> {
  const tasks = buildTasks(candidates, entities);
  let cursor = 0;
  let stored = 0;
  let errors = 0;
  const classification = { what: 0, how: 0, context: 0 };
  const documentClasses = new Map<string, Set<string>>();

  async function worker() {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      try {
        const signals = await extractWithOpenAI(task.candidates.map(toArticle), task.entity);
        for (const signal of signals) {
          if (!isUseful(signal)) continue;
          if (await storeSignal(supabase, signal)) {
            stored++;
            const key = signal.signal.classification as keyof typeof classification;
            if (key in classification) classification[key]++;
            const classes = documentClasses.get(signal.document.canonical_url) ?? new Set();
            classes.add(signal.signal.classification);
            documentClasses.set(signal.document.canonical_url, classes);
          }
        }
      } catch (error) {
        console.error('OpenAI extraction batch failed', error);
        errors++;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, worker));
  const documents = [...documentClasses.values()];
  return {
    stored,
    errors,
    ...classification,
    whatDocuments: documents.filter((classes) => classes.has('what')).length,
    howDocuments: documents.filter((classes) => !classes.has('what') && classes.has('how')).length,
    contextDocuments: documents.filter((classes) =>
      !classes.has('what') && !classes.has('how') && classes.has('context')
    ).length,
  };
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
    snippet: candidate.document.analysis_text ?? candidate.document.snippet,
    publishedAt: candidate.document.published_at,
    language: candidate.document.language,
    domain: candidate.document.domain,
    sourceName: candidate.document.source_name,
  };
}

type AnalysisResult = {
  stored: number;
  errors: number;
  what: number;
  how: number;
  context: number;
  whatDocuments: number;
  howDocuments: number;
  contextDocuments: number;
};

function isUseful(signal: CandidateSignal): boolean {
  if (signal.signal.classification === 'what') return isVerifiedWhat(signal);
  return true;
}
