// src/pages/admin/identity/ScanFunnel.tsx
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { IdentityScanRun, ScanRunCounts } from '../../../lib/identity/types';

export default function ScanFunnel({
  run,
  totals,
}: {
  run: IdentityScanRun | null;
  totals: ScanRunCounts | null;
}) {
  const discovered = number(run?.counts?.documents_found) || Number(totals?.documents_found ?? 0);
  const screened = number(run?.counts?.documents_screened_in) || discovered;
  const analyzed = number(run?.counts?.balanced_documents)
    || number(run?.counts?.documents_stored)
    || screened;
  const identity = number(run?.counts?.what_documents);
  const operating = number(run?.counts?.how_documents);
  const context = number(run?.counts?.context_documents);
  const approved = Number(totals?.approved_signals ?? 0);
  const max = Math.max(discovered, 1);
  const assessed = identity + operating + context;
  const yieldRate = assessed ? (identity / assessed) * 100 : 0;

  const stages = [
    { label: 'Discovered', value: discovered, color: 'bg-zinc-500' },
    { label: 'Screened in', value: screened, color: 'bg-amber-400' },
    { label: 'Weighted', value: analyzed, color: 'bg-violet-400' },
    { label: 'Identity', value: identity, color: 'bg-sky-300' },
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_85%_0%,rgba(56,189,248,0.12),transparent_38%),#101011] p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-sky-400">Research funnel</p>
          <h2 className="mt-2 font-serif text-3xl text-white">
            {discovered > 0
              ? `${formatRate(yieldRate)} of evidence-assessed documents expressed identity.`
              : 'Identity is the exception.'}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            The gap is the finding: institutions publish constantly, but rarely say who they are,
            seek to become, or intend to remain.
          </p>
        </div>
        <Link
          to="/admin/identity/daily-scan"
          className="inline-flex items-center gap-2 text-sm text-sky-300 hover:text-white"
        >
          Open daily visualization <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_15rem]">
        <div className="space-y-4">
          {stages.map((stage) => (
            <div key={stage.label} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-zinc-500">{stage.label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full min-w-1 rounded-full ${stage.color}`}
                  style={{ width: `${Math.max((stage.value / max) * 100, stage.value ? 2 : 0)}%` }}
                />
              </div>
              <span className="text-right font-mono text-sm text-zinc-300">{stage.value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <Metric value={operating} label="HOW signals" />
          <Metric value={identity} label="WHAT signals" />
          <Metric value={approved} label="Human approved" />
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="font-serif text-2xl text-white">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  );
}

function number(value: number | string | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatRate(rate: number): string {
  if (rate > 0 && rate < 0.1) return '<0.1%';
  return `${rate.toFixed(1)}%`;
}
