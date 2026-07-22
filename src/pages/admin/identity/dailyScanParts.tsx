// src/pages/admin/identity/dailyScanParts.tsx
import { ExternalLink } from 'lucide-react';
import type { DailyScanSignal } from '../../../lib/identity/identityApi';

export function SignalFeature({ signal, index }: { signal: DailyScanSignal; index: number }) {
  const confidence = signal.reviewer_confidence ?? signal.model_confidence;
  return (
    <article className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-[3rem_1fr]">
      <p className="font-serif text-3xl text-zinc-700">{String(index + 1).padStart(2, '0')}</p>
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider">
          <span className="text-sky-300">{signal.entity?.name ?? 'Unknown entity'}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">{signal.final_signal_type?.replace(/_/g, ' ') ?? 'identity signal'}</span>
          {confidence !== null && <span className="text-zinc-600">{Math.round(confidence * 100)}% confidence</span>}
        </div>
        <p className="mt-3 max-w-3xl font-serif text-xl leading-relaxed text-white">{signal.final_sentence}</p>
        <p className="mt-3 border-l border-white/10 pl-3 text-sm leading-relaxed text-zinc-400">“{signal.evidence_text}”</p>
        {signal.document && <a href={signal.document.canonical_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white">{signal.document.title}<ExternalLink className="h-3 w-3" /></a>}
      </div>
    </article>
  );
}

export function PatternBars({ signals }: { signals: DailyScanSignal[] }) {
  const counts = signals.reduce<Record<string, number>>((all, signal) => {
    const key = signal.identity_dimension || signal.final_signal_type || 'uncategorized';
    all[key] = (all[key] || 0) + 1;
    return all;
  }, {});
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = rows[0]?.[1] ?? 1;
  return (
    <div className="space-y-3">
      {rows.map(([label, count]) => <div key={label} className="grid grid-cols-[8rem_1fr_2rem] items-center gap-3 text-xs"><span className="truncate uppercase tracking-wider text-zinc-500">{label.replace(/_/g, ' ')}</span><div className="h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-sky-400/70" style={{ width: `${(count / max) * 100}%` }} /></div><span className="text-right text-zinc-400">{count}</span></div>)}
    </div>
  );
}

export function ContextList({ signals }: { signals: DailyScanSignal[] }) {
  return <div className="divide-y divide-white/5">{signals.map((signal) => <div key={signal.id} className="py-3"><p className="text-xs uppercase tracking-wider text-zinc-500">{signal.entity?.name}</p><p className="mt-1 text-sm text-zinc-300">{signal.final_sentence}</p></div>)}</div>;
}
