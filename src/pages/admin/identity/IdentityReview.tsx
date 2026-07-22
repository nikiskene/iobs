// src/pages/admin/identity/IdentityReview.tsx
import { useEffect, useState } from 'react';
import {
  deleteDuplicateSignal,
  fetchPendingSignals,
  submitReview,
  type ReviewAction,
  type ReviewOverrides,
} from '../../../lib/identity/identityApi';
import type { SignalWithRelations } from '../../../lib/identity/types';
import { useAuth } from '../../../hooks/useAuth';
import { EmptyState, ErrorBanner, PageHeader, Spinner } from './identityUi';
import SignalCard from './SignalCard';
import SignalEditForm from './SignalEditForm';

export default function IdentityReview() {
  const { profile } = useAuth();
  const [signals, setSignals] = useState<SignalWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setSignals(await fetchPendingSignals());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to load review queue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function review(signalId: string, decision: ReviewAction, overrides: ReviewOverrides = {}) {
    if (!profile?.id) return;
    setBusyId(signalId);
    setError(null);
    try {
      await submitReview(signalId, decision, profile.id, overrides);
      setEditingId(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Review action failed.');
    } finally {
      setBusyId(null);
    }
  }

  async function removeDuplicate(signal: SignalWithRelations) {
    const confirmed = window.confirm(
      `Delete this duplicate signal?\n\n${signal.candidate_sentence}\n\nThis removes it from all metrics and cannot be undone.`,
    );
    if (!confirmed) return;
    setBusyId(signal.id);
    setError(null);
    try {
      await deleteDuplicateSignal(signal.id);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete duplicate.');
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Spinner label="Loading review queue…" />;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="W01 · Admin only"
        title="Review Queue"
        description="Correct candidates before deciding. Rejections are excluded from identity metrics; duplicate deletion removes the redundant signal entirely."
      />
      {error && <ErrorBanner message={error} />}
      {signals.length === 0 && !error ? (
        <EmptyState message="No candidate signals pending review." />
      ) : (
        <div className="space-y-4">
          {signals.map((signal) => (
            <div key={signal.id}>
              <SignalCard
                signal={signal}
                busy={busyId === signal.id}
                onEdit={() => setEditingId(signal.id)}
                onApprove={() => void review(signal.id, 'approved')}
                onReject={() => void review(signal.id, 'rejected')}
                onDeleteDuplicate={() => void removeDuplicate(signal)}
              />
              {editingId === signal.id && (
                <SignalEditForm
                  signal={signal}
                  busy={busyId === signal.id}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(decision, overrides) => void review(signal.id, decision, overrides)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
