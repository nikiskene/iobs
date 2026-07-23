// src/pages/admin/identity/SignalCard.tsx
import { Check, CopyX, FileText, Pencil, X } from 'lucide-react';
import type { SignalWithRelations } from '../../../lib/identity/types';
import { Badge } from './identityUi';

type Props = {
  signal: SignalWithRelations;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  onDeleteDuplicate: () => void;
};

export default function SignalCard({
  signal,
  busy,
  onApprove,
  onReject,
  onEdit,
  onDeleteDuplicate,
}: Props) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="info">{signal.entity?.name ?? 'Unknown entity'}</Badge>
            <Badge tone="neutral">{signal.classification.toUpperCase()}</Badge>
            {signal.signal_type && <Badge tone="neutral">{signal.signal_type.replace(/_/g, ' ')}</Badge>}
            <Badge tone="warning">
              {signal.model_confidence == null ? '—' : `${Math.round(signal.model_confidence * 100)}%`}
            </Badge>
            <Badge tone={scoreTone(signal.identity_relevance)}>
              Identity {signal.identity_relevance ?? '—'}/100
            </Badge>
            <Badge tone={scoreTone(signal.evidence_strength)}>
              Evidence {signal.evidence_strength ?? '—'}/100
            </Badge>
          </div>
          <TextBlock label="Candidate sentence" text={signal.candidate_sentence} />
          <TextBlock label="Evidence" text={signal.evidence_text} muted />
          {signal.model_interpretation && (
            <TextBlock label="Model interpretation" text={signal.model_interpretation} muted />
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
        <div className="flex shrink-0 flex-wrap gap-2">
          <Action icon={Pencil} label="Edit" onClick={onEdit} disabled={busy} />
          <Action icon={Check} label="Approve" onClick={onApprove} disabled={busy} tone="green" />
          <Action icon={X} label="Reject" onClick={onReject} disabled={busy} tone="red" />
          <Action
            icon={CopyX}
            label="Delete duplicate"
            onClick={onDeleteDuplicate}
            disabled={busy}
            tone="amber"
          />
        </div>
      </div>
    </article>
  );
}

function scoreTone(score: number | null): 'neutral' | 'warning' | 'success' {
  if (score == null) return 'neutral';
  if (score >= 70) return 'success';
  if (score >= 40) return 'warning';
  return 'neutral';
}

function TextBlock({ label, text, muted = false }: { label: string; text: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <p className={`mt-1 text-sm leading-6 ${muted ? 'text-zinc-400' : 'text-zinc-200'}`}>{text}</p>
    </div>
  );
}

function Action({ icon: Icon, label, onClick, disabled, tone = 'neutral' }: {
  icon: typeof Check;
  label: string;
  onClick: () => void;
  disabled: boolean;
  tone?: 'neutral' | 'green' | 'red' | 'amber';
}) {
  const colors = {
    neutral: 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10',
    green: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20',
    red: 'border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-50 ${colors[tone]}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
