// src/pages/admin/identity/MethodPage.tsx
import {
  ClassificationsSection,
  DecisionsSection,
  GovernanceSection,
  LimitsSection,
  VizSection,
} from './methodSectionsB';
import {
  EvidenceSection,
  FunnelSection,
  ScopeSection,
  SourcesSection,
  StructureSection,
  TriggersSection,
} from './methodSectionsA';
import {
  PipelineSection,
  SocialPhaseSection,
  StorageSection,
  TriggerLanguageSection,
} from './methodPipeline';

export default function MethodPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          W01 · Admin only · Living methodology
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          WORLDOS IDENTITY RESEARCH — METHOD
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300">
          News describes what happened. WorldOS measures what an entity says it
          is, wants to become, wants to preserve, or no longer wants to be.
        </p>
        <p className="mt-3 text-sm font-medium text-amber-400/90">
          Core rule: No evidence, no signal.
        </p>
      </header>

      <ScopeSection />
      <FunnelSection />
      <SourcesSection />
      <TriggersSection />
      <EvidenceSection />
      <StructureSection />
      <ClassificationsSection />
      <LimitsSection />
      <VizSection />
      <GovernanceSection />
      <DecisionsSection />
      <PipelineSection />
      <TriggerLanguageSection />
      <StorageSection />
      <SocialPhaseSection />

      <footer className="border-t border-white/10 pt-6">
        <p className="max-w-3xl text-sm leading-7 text-zinc-500">
          Use headlines to find candidates, evidence to establish signals,
          structure to preserve meaning, and visualization to reveal change.
        </p>
      </footer>
    </div>
  );
}
