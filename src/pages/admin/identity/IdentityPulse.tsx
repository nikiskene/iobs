// src/pages/admin/identity/IdentityPulse.tsx
import type { DailyScanSignal } from '../../../lib/identity/identityApi';
import type { RunAssessment } from '../../../lib/identity/identityScanApi';
import type { IdentityScanRun } from '../../../lib/identity/types';

type Props = {
  signals: DailyScanSignal[];
  run: IdentityScanRun | null;
  assessment: RunAssessment;
  date: string;
};

export function IdentityPulse({ signals, run, assessment, date }: Props) {
  const total = number(run?.counts?.documents_found);
  const what = number(run?.counts?.what_signals) || assessment.what;
  const how = number(run?.counts?.how_signals) || assessment.how;
  const noise = Math.max(total - what - how, 0);
  const yieldRate = total > 0 ? (what / total) * 100 : 0;
  const approved = signals.filter((signal) => signal.final_classification === 'what').length;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0e]">
      <div className="border-b border-white/10 px-6 py-5 sm:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-400">
          The identity gap · {date}
        </p>
      </div>

      <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[1fr_19rem] lg:p-10">
        <div>
          <p className="max-w-3xl font-serif text-4xl leading-tight text-white sm:text-5xl">
            {total > 0
              ? `${formatRate(yieldRate)} of today’s public output expressed identity.`
              : 'The scan has not measured today’s public output yet.'}
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
            Most communication tells us what happened or how an institution operates.
            Identity begins only where it reveals who the institution is, seeks to become,
            or refuses to stop being.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
          <NumberBlock value={total} label="items observed" />
          <NumberBlock value={what} label="identity signals" accent />
          <NumberBlock value={Math.max(total - what, 0)} label="without identity" />
          <NumberBlock value={approved} label="human approved" />
        </div>
      </div>

      <div className="px-6 pb-7 sm:px-8 lg:px-10">
        <div className="flex h-5 w-full overflow-hidden rounded-full bg-zinc-800">
          <Segment value={noise} total={total} className="bg-zinc-700" />
          <Segment value={how} total={total} className="bg-violet-400" />
          <Segment value={what} total={total} className="bg-sky-300" minimum />
        </div>
        <div className="mt-4 grid gap-3 text-xs uppercase tracking-wider text-zinc-500 sm:grid-cols-3">
          <Legend color="bg-zinc-700" value={noise} label="Noise / context" />
          <Legend color="bg-violet-400" value={how} label="HOW — operating language" />
          <Legend color="bg-sky-300" value={what} label="WHAT — identity" />
        </div>
        <p className="mt-6 border-l border-sky-400/50 pl-4 text-sm leading-6 text-zinc-400">
          The engine’s deliverable is the blue remainder: evidence-backed identity language,
          made visible against everything institutions push into the world.
        </p>
      </div>
    </section>
  );
}

function NumberBlock({ value, label, accent = false }: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-[#111113] p-4">
      <p className={`font-serif text-3xl ${accent ? 'text-sky-300' : 'text-white'}`}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  );
}

function Segment({ value, total, className, minimum = false }: {
  value: number;
  total: number;
  className: string;
  minimum?: boolean;
}) {
  const width = total > 0 ? (value / total) * 100 : 0;
  return <div className={className} style={{ width: `${minimum && value ? Math.max(width, 0.8) : width}%` }} />;
}

function Legend({ color, value, label }: { color: string; value: number; label: string }) {
  return <span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${color}`} />{value} {label}</span>;
}

function number(value: number | string | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatRate(rate: number): string {
  if (rate > 0 && rate < 0.1) return '<0.1%';
  return `${rate.toFixed(1)}%`;
}
