// src/pages/admin/identity/DailyIdentityScan.tsx
import { useEffect, useMemo, useState } from 'react';
import { fetchDailyScan, type DailyScanSignal } from '../../../lib/identity/identityApi';
import { ErrorBanner, Spinner } from './identityUi';
import { ContextList, PatternBars, SignalFeature } from './dailyScanParts';
import { IdentityPulse } from './IdentityPulse';

function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function DailyIdentityScan() {
  const [date, setDate] = useState(localDate);
  const [signals, setSignals] = useState<DailyScanSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchDailyScan(date).then(setSignals).catch((e) => setError(e instanceof Error ? e.message : 'Failed to load scan.')).finally(() => setLoading(false));
  }, [date]);

  const identity = useMemo(() => signals.filter((signal) => signal.final_classification === 'what'), [signals]);
  const operating = useMemo(() => signals.filter((signal) => signal.final_classification === 'how'), [signals]);
  const context = useMemo(() => signals.filter((signal) => signal.final_classification === 'context'), [signals]);
  const strongest = [...identity].sort((a, b) => (b.reviewer_confidence ?? b.model_confidence ?? 0) - (a.reviewer_confidence ?? a.model_confidence ?? 0)).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex justify-end"><label className="text-xs uppercase tracking-wider text-zinc-500">Review date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2 block min-h-11 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white" /></label></div>
      {error && <ErrorBanner message={error} />}
      {loading ? <Spinner label="Composing daily scan…" /> : signals.length === 0 ? <><IdentityPulse signals={[]} date={date} /><EmptyScan /></> : <>
        <IdentityPulse signals={signals} date={date} />
        <section className="grid gap-4 sm:grid-cols-3">
          <Metric value={identity.length} label="Identity signals" /><Metric value={operating.length} label="Operating signals" /><Metric value={context.length} label="Context signals" />
        </section>
        <section><SectionTitle number="01" title="Strongest identity signals" subtitle="Approved WHAT signals, ranked by reviewer confidence." /><div className="space-y-4">{strongest.map((signal, index) => <SignalFeature key={signal.id} signal={signal} index={index} />)}</div></section>
        <section className="grid gap-8 lg:grid-cols-2">
          <div><SectionTitle number="02" title="Recurring patterns" subtitle="Repeated dimensions in today’s approved identity evidence." /><div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><PatternBars signals={identity} /></div></div>
          <div><SectionTitle number="03" title="What happened—but is not identity" subtitle="Approved CONTEXT kept visible without distorting identity metrics." /><div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5"><ContextList signals={context} /></div></div>
        </section>
      </>}
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) { return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5"><p className="font-serif text-3xl text-white">{value}</p><p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{label}</p></div>; }
function SectionTitle({ number, title, subtitle }: { number: string; title: string; subtitle: string }) { return <div className="mb-4"><p className="text-xs uppercase tracking-[0.2em] text-sky-400">{number}</p><h2 className="mt-1 font-serif text-2xl text-white">{title}</h2><p className="mt-1 text-sm text-zinc-500">{subtitle}</p></div>; }
function EmptyScan() { return <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center"><p className="font-serif text-xl text-white">No approved signals for this date.</p><p className="mt-2 text-sm text-zinc-500">Review and approve candidates first, then return here.</p></div>; }
