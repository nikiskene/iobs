// src/pages/admin/identity/methodSectionsA.tsx
import { ArrowRight, Database, FileSearch, GitBranch, Layers, ListChecks, Telescope } from 'lucide-react';
import { funnelStages, sourceTiers, triggerGrammar } from './methodData';
import { Card, Section } from './methodPrimitives';

export function ScopeSection() {
  return (
    <Section id="scope" icon={Telescope} title="1 · Scope">
      <p className="text-sm leading-7 text-zinc-400">
        Fortune 50 + G7 + BRICS. W01 is admin only. Zero valid signals is an
        acceptable daily result.
      </p>
    </Section>
  );
}

export function FunnelSection() {
  return (
    <Section id="funnel" icon={GitBranch} title="2 · Research funnel">
      <ol className="flex flex-col gap-2">
        {funnelStages.map((stage, i) => (
          <li key={stage.step} className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-zinc-300">
              {stage.step}
            </span>
            <span className="text-sm text-zinc-300">{stage.label}</span>
            {i < funnelStages.length - 1 && (
              <ArrowRight className="hidden h-3.5 w-3.5 text-zinc-600 sm:block" />
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function SourcesSection() {
  return (
    <Section id="sources" icon={Database} title="3 · Source strategy">
      <div className="grid gap-4 md:grid-cols-3">
        {sourceTiers.map((tier) => (
          <Card key={tier.tier}>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{tier.tier}</p>
            <h3 className="mt-1 text-sm font-semibold text-white">{tier.title}</h3>
            <ul className="mt-3 space-y-2">
              {tier.items.map((item) => (
                <li key={item} className="text-sm leading-6 text-zinc-400">{item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-500">
        Region caps prevent English / North American volume from dominating.
      </p>
    </Section>
  );
}

export function TriggersSection() {
  return (
    <Section id="triggers" icon={ListChecks} title="4 · Trigger grammar">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
              <th className="py-2 pr-4 font-medium">Class</th>
              <th className="py-2 pr-4 font-medium">Pattern</th>
              <th className="py-2 font-medium">Question</th>
            </tr>
          </thead>
          <tbody>
            {triggerGrammar.map((row) => (
              <tr key={row.name} className="border-b border-white/5">
                <td className="py-3 pr-4 font-medium text-zinc-200">{row.name}</td>
                <td className="py-3 pr-4 text-zinc-400">{row.pattern}</td>
                <td className="py-3 text-zinc-500">{row.question}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export function EvidenceSection() {
  return (
    <Section id="evidence" icon={FileSearch} title="5 · Evidence rules">
      <ul className="space-y-2.5 text-sm leading-6 text-zinc-400">
        <li>Headlines and snippets find candidates; they do not establish truth.</li>
        <li>
          Final approval requires an exact quotation, explicit official statement,
          or clear accessible supporting passage.
        </li>
        <li>
          Paywalled or inaccessible items remain{' '}
          <code className="rounded bg-white/5 px-1 text-zinc-300">discovery_only</code>{' '}
          unless an admin supplies evidence.
        </li>
        <li>
          Distinguish <span className="text-zinc-200">SELF</span>,{' '}
          <span className="text-zinc-200">ATTRIBUTED</span>,{' '}
          <span className="text-zinc-200">EDITORIAL</span>, and{' '}
          <span className="text-zinc-200">SYSTEM</span> speaker types.
        </li>
      </ul>
    </Section>
  );
}

export function StructureSection() {
  return (
    <Section id="structure" icon={Layers} title="6 · Structure">
      <ul className="space-y-2.5 text-sm leading-6 text-zinc-400">
        <li>Raw discovery records retained for seven days.</li>
        <li>Story Clusters deduplicate repeated coverage.</li>
        <li>
          Approved Identity Signals retain evidence, provenance, classification,
          reviewer decision, approved sentence, and future visibility.
        </li>
        <li>
          Avoid full copyrighted article storage; keep URL, metadata, hash, and
          minimum evidence excerpt.
        </li>
      </ul>
    </Section>
  );
}
