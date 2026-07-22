// src/pages/admin/identity/methodSectionsB.tsx
import { GitBranch, ListChecks, Scale, ShieldCheck } from 'lucide-react';
import { dailyLimits, decisionsLog, visualizationSections } from './methodData';
import { Section } from './methodPrimitives';

export function ClassificationsSection() {
  return (
    <Section id="classifications" icon={Scale} title="7 · W01 identity classifications">
      <div className="flex flex-wrap gap-3">
        {['WHAT', 'HOW', 'CONTEXT'].map((c) => (
          <span
            key={c}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200"
          >
            {c}
          </span>
        ))}
        <span className="rounded-lg border border-dashed border-white/10 px-4 py-2 text-sm text-zinc-500">
          TENSION — later, requires comparison across reviewed evidence
        </span>
      </div>
    </Section>
  );
}

export function LimitsSection() {
  return (
    <Section id="limits" icon={ShieldCheck} title="8 · Daily operating limits">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {dailyLimits.map((limit) => (
          <div
            key={limit.label}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <span className="text-sm text-zinc-400">{limit.label}</span>
            <span className="text-sm font-semibold text-white">{limit.value}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function VizSection() {
  return (
    <Section id="viz" icon={GitBranch} title="9 · Visualization principles">
      <ul className="space-y-2 text-sm leading-6 text-zinc-400">
        <li>Communicate change, not volume. One dominant sentence.</li>
        <li>FROM → BECOMING movement cards.</li>
        <li>Regional framing kept separate from entity self-description.</li>
        <li>No unexplained AI scores.</li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        {visualizationSections.map((s) => (
          <span
            key={s}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-zinc-300"
          >
            {s}
          </span>
        ))}
      </div>
    </Section>
  );
}

export function GovernanceSection() {
  return (
    <Section id="governance" icon={ShieldCheck} title="10 · Governance">
      <p className="text-sm leading-7 text-zinc-400">
        Automation may discover and propose. Admin approves, rewrites, rejects,
        and later assigns visibility. Nothing publishes automatically.
      </p>
    </Section>
  );
}

export function DecisionsSection() {
  return (
    <Section id="decisions" icon={ListChecks} title="11 · Decisions log">
      <ul className="space-y-2">
        {decisionsLog.map((d) => (
          <li key={d} className="flex gap-3 text-sm leading-6 text-zinc-400">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
            {d}
          </li>
        ))}
      </ul>
    </Section>
  );
}
