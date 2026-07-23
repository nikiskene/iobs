// src/pages/admin/identity/methodPipeline.tsx
import { Database, GitBranch, Layers, ListChecks } from 'lucide-react';
import { Section } from './methodPrimitives';

const PIPELINE_STEPS = [
  { label: 'Discovery', detail: 'Verified official RSS/Atom feeds first; GDELT fills remaining capacity. Free-first, no paywalled bodies.' },
  { label: 'Entity match', detail: 'Official domains map directly to entities; discovery items use names and aliases.' },
  { label: 'Deduplication', detail: 'Deduplicate by canonical URL and content hash. Semantic story clustering is planned after W01 validation.' },
  { label: 'Assessment', detail: 'Strict WHAT / HOW / CONTEXT classification with separate identity-relevance and evidence-strength scores.' },
  { label: 'Human review', detail: 'Admin approves, rewrites, rejects, or flags needs_evidence. Model output kept separate from human decision.' },
  { label: 'Retention', detail: 'Raw rejected/low-value documents purged after 7 days. Approved evidence/provenance retained.' },
];

const TRIGGER_LANGUAGE = [
  '"we are"', '"we will become"', '"our purpose"', '"our mission"',
  '"we believe"', '"we stand for"', '"committed to"', '"future of"',
  '"new direction"', '"is becoming"', '"repositions"', '"shifts from"', '"aims to be"',
];

const CONTEXT_MARKERS = ['"there is"', 'launches', 'invests', 'appoints'];

export function PipelineSection() {
  return (
    <Section id="pipeline" icon={GitBranch} title="12 · Scan pipeline (V1)">
      <ol className="flex flex-col gap-3">
        {PIPELINE_STEPS.map((step, i) => (
          <li key={step.label} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-zinc-300">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-zinc-200">{step.label}</p>
              <p className="text-sm leading-6 text-zinc-400">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function TriggerLanguageSection() {
  return (
    <Section id="trigger-language" icon={ListChecks} title="13 · Discovery trigger language">
      <p className="text-sm leading-6 text-zinc-400">
        Discovery queries combine entity names/aliases with high-value identity headline patterns:
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {TRIGGER_LANGUAGE.map((t) => (
          <span
            key={t}
            className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300"
          >
            {t}
          </span>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-zinc-500">
        Treated as context unless identity evidence exists:
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {CONTEXT_MARKERS.map((t) => (
          <span
            key={t}
            className="rounded-md border border-dashed border-white/10 px-2.5 py-1 text-xs text-zinc-500"
          >
            {t}
          </span>
        ))}
      </div>
    </Section>
  );
}

export function StorageSection() {
  return (
    <Section id="storage" icon={Database} title="14 · Minimal storage & retention">
      <ul className="space-y-2 text-sm leading-6 text-zinc-400">
        <li>Store: canonical URL, headline, source/domain, publication time, short snippet, language, entity match, retrieval time, content hash.</li>
        <li>Never store full article bodies by default.</li>
        <li>Raw rejected / low-value documents purged after 7 days.</li>
        <li>Approved evidence and provenance retained indefinitely.</li>
      </ul>
    </Section>
  );
}

export function SocialPhaseSection() {
  return (
    <Section id="social-phase" icon={Layers} title="15 · Later: social-signal phase">
      <p className="text-sm leading-7 text-zinc-400">
        Social-signal extraction is planned but not active in V1. V1 focuses on
        explicit identity statements from primary and discovery sources.
        Behavioral inference and social signals come after the workflow is proven.
      </p>
    </Section>
  );
}
