// src/pages/admin/identity/IdentitySources.tsx
import { useEffect, useState } from 'react';
import { fetchEntities, fetchSources } from '../../../lib/identity/identityApi';
import type { IdentityEntity, IdentitySource } from '../../../lib/identity/types';
import { Badge, EmptyState, ErrorBanner, PageHeader, Spinner } from './identityUi';

const COHORTS = ['Fortune 50', 'G7', 'BRICS'] as const;

export default function IdentitySources() {
  const [sources, setSources] = useState<IdentitySource[]>([]);
  const [entities, setEntities] = useState<IdentityEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, e] = await Promise.all([fetchSources(), fetchEntities()]);
        setSources(s);
        setEntities(e);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load sources.');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) return <Spinner label="Loading sources and cohorts…" />;

  const tierOrder: Record<string, number> = { primary: 0, discovery: 1, media: 2 };
  const sorted = [...sources].sort(
    (a, b) => (tierOrder[a.source_tier] ?? 9) - (tierOrder[b.source_tier] ?? 9),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="W01 · Admin only"
        title="Sources & Cohorts"
        description="Configured discovery sources and target entity cohorts. Free-first, official-first, with region caps to prevent volume dominance."
      />

      {error && <ErrorBanner message={error} />}

      <CohortSummary entities={entities} />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Configured sources ({sources.length})
        </h2>
        {sorted.length === 0 ? (
          <EmptyState message="No sources configured." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Tier</th>
                  <th className="py-2 pr-4 font-medium">Region</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Feed</th>
                  <th className="py-2 pr-4 font-medium">Active</th>
                  <th className="py-2 font-medium">Automation</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((source) => (
                  <tr key={source.id} className="border-b border-white/5">
                    <td className="py-3 pr-4">
                      <span className="font-medium text-zinc-200">{source.name}</span>
                      {source.domain && (
                        <span className="ml-2 text-xs text-zinc-500">{source.domain}</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <TierBadge tier={source.source_tier} />
                    </td>
                    <td className="py-3 pr-4 text-zinc-400">
                      {source.region.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 pr-4 text-zinc-400">
                      {source.source_tier === 'primary' ? 'Official' : 'Free / Discovery'}
                    </td>
                    <td className="py-3 pr-4 text-zinc-400">
                      {source.feed_url ? 'Yes' : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      {source.active ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="neutral">Inactive</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      {source.automation_allowed ? (
                        <Badge tone="info">Allowed</Badge>
                      ) : (
                        <Badge tone="neutral">Manual</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function CohortSummary({ entities }: { entities: IdentityEntity[] }) {
  const fortune50 = entities.filter((e) => e.fortune_rank != null && e.fortune_rank <= 50);
  const g7Countries = ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'JP'];
  const g7 = entities.filter(
    (e) => e.entity_type === 'country' && g7Countries.includes(e.country_code ?? ''),
  );
  const bricsCountries = ['BR', 'RU', 'IN', 'CN', 'ZA'];
  const brics = entities.filter(
    (e) => e.entity_type === 'country' && bricsCountries.includes(e.country_code ?? ''),
  );

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {COHORTS.map((cohort) => {
        const count = cohort === 'Fortune 50' ? fortune50.length : cohort === 'G7' ? g7.length : brics.length;
        return (
          <div key={cohort} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{cohort}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{count}</p>
            <p className="mt-1 text-xs text-zinc-500">entities tracked</p>
          </div>
        );
      })}
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const tones: Record<string, 'info' | 'warning' | 'neutral'> = {
    primary: 'info',
    discovery: 'warning',
    media: 'neutral',
  };
  return <Badge tone={tones[tier] ?? 'neutral'}>{tier}</Badge>;
}
