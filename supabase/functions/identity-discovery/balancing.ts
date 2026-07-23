// supabase/functions/identity-discovery/balancing.ts
import type { CandidateSignal } from './extraction.ts';

const REGION_ORDER = [
  'africa',
  'asia',
  'china',
  'europe',
  'middle_east',
  'north_america',
  'south_america',
  'global',
  'other',
];
const MAX_PER_REGION = 60;
const MAX_PER_SOURCE = 15;
const MAX_PER_ENTITY = 20;

export type BalancedResult = {
  candidates: CandidateSignal[];
  regions: Record<string, number>;
};

export function balanceCandidates(
  candidates: CandidateSignal[],
  limit = 400,
): BalancedResult {
  const queues = groupByRegion(candidates);
  const sourceCounts = new Map<string, number>();
  const entityCounts = new Map<string, number>();
  const regions: Record<string, number> = {};
  const selected: CandidateSignal[] = [];
  let progressed = true;

  while (selected.length < limit && progressed) {
    progressed = false;
    for (const region of orderedRegions(queues)) {
      if ((regions[region] ?? 0) >= MAX_PER_REGION) continue;
      const queue = queues.get(region) ?? [];
      const candidate = takeEligible(queue, sourceCounts, entityCounts);
      if (!candidate) continue;
      selected.push(candidate);
      regions[region] = (regions[region] ?? 0) + 1;
      increment(sourceCounts, sourceKey(candidate));
      increment(entityCounts, candidate.entity_id);
      progressed = true;
      if (selected.length >= limit) break;
    }
  }
  return { candidates: selected, regions };
}

function groupByRegion(candidates: CandidateSignal[]) {
  const groups = new Map<string, CandidateSignal[]>();
  for (const candidate of candidates) {
    const region = candidate.document.source_region || 'other';
    const group = groups.get(region) ?? [];
    group.push(candidate);
    groups.set(region, group);
  }
  return groups;
}

function orderedRegions(groups: Map<string, CandidateSignal[]>): string[] {
  return [...groups.keys()].sort((a, b) => {
    const aIndex = REGION_ORDER.indexOf(a);
    const bIndex = REGION_ORDER.indexOf(b);
    return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
  });
}

function takeEligible(
  queue: CandidateSignal[],
  sourceCounts: Map<string, number>,
  entityCounts: Map<string, number>,
): CandidateSignal | null {
  while (queue.length) {
    const candidate = queue.shift()!;
    if ((sourceCounts.get(sourceKey(candidate)) ?? 0) >= MAX_PER_SOURCE) continue;
    if ((entityCounts.get(candidate.entity_id) ?? 0) >= MAX_PER_ENTITY) continue;
    return candidate;
  }
  return null;
}

function sourceKey(candidate: CandidateSignal): string {
  return candidate.document.source_id
    || candidate.document.domain
    || candidate.document.source_name
    || 'unknown';
}

function increment(counts: Map<string, number>, key: string): void {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}
