// src/pages/admin/identity/IdentityReview.tsx
import { useEffect, useState } from 'react';
import { Check, FileText, Pencil, X } from 'lucide-react';
import { fetchPendingSignals, submitReview } from '../../../lib/identity/identityApi';
import type { SignalWithRelations } from '../../../lib/identity/types';
import { useAuth } from '../../../hooks/useAuth';
import { Badge, EmptyState, ErrorBanner, PageHeader, Spinner } from './identityUi';

export default function IdentityReview() {
  const { profile } = useAuth();
  const [signals, setSignals] = useState<SignalWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [rewriteId, setRewriteId] = useState<string | null>(null);
  const [rewriteText, setRewriteText] = useState('');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setSignals(await fetchPendingSignals());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load review queue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleAction(
    signalId: string,
    decision: 'approved' | 'rejected' | 'rewritten' | 'needs_evidence',
    sentence?: string,
  ) {
    if (!profile?.id) return;
    setActing(signalId);
    try {
      await submitReview(signalId, decision, profile.id, sentence);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Review action failed.');
    } finally {
      setActing(null);
      setRewriteId(null);
      setRewriteText('');
    }
  }

  function startRewrite(signal: SignalWithRelations) {
    setRewriteId(signal.id);
    setRewriteText(signal.candidate_sentence);
  }

  if (loading) return <Spinner label="Loading review queue…" />;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="W01 · Admin only"
        title="Review Queue"
        description="Candidate identity signals awaiting human review. Model output is preserved separately from reviewer decisions."
      />

      {error && <ErrorBanner message={error} />}

      {signals.length === 0 && !error ? (
        <EmptyState message="No candidate signals pending review. Run a scan to generate new candidates." />
      ) : (
        <div className="space-y-4">
          {signals.map((signal) => (
            <div
              key={signal.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="info">{signal.entity?.name ?? 'Unknown entity'}</Badge>
                    <Badge tone="neutral">{signal.classification.toUpperCase()}</Badge>
                    {signal.signal_type && (
                      <Badge tone="neutral">{signal.signal_type.replace(/_/g, ' ')}</Badge>
                    )}
                    <Badge tone="warning">
                      {signal.model_confidence != null
                        ? `${Math.round(signal.model_confidence * 100)}%`
                        : '—'}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">Candidate sentence</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-200">
                      {signal.candidate_sentence}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">Evidence</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">
                      {signal.evidence_text}
                    </p>
                  </div>

                  {signal.model_interpretation && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        Model interpretation
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        {signal.model_interpretation}
                      </p>
                    </div>
                  )}

                  {signal.document && (
                    <a
                      href={signal.document.canonical_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {signal.document.title}
                    </a>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleAction(signal.id, 'approved')}
                    disabled={acting === signal.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => startRewrite(signal)}
                    disabled={acting === signal.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Rewrite
                  </button>
                  <button
                    onClick={() => handleAction(signal.id, 'rejected')}
                    disabled={acting === signal.id}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>

              {rewriteId === signal.id && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <textarea
                    value={rewriteText}
                    onChange={(e) => setRewriteText(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-zinc-500 focus:border-white/20 focus:outline-none"
                    placeholder="Rewrite the approved sentence…"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleAction(signal.id, 'rewritten', rewriteText)}
                      disabled={acting === signal.id}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
                    >
                      Save rewrite
                    </button>
                    <button
                      onClick={() => {
                        setRewriteId(null);
                        setRewriteText('');
                      }}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
