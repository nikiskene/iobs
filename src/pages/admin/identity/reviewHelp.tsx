// src/pages/admin/identity/reviewHelp.tsx
import { HelpCircle } from 'lucide-react';

export const reviewHelp = {
  classification: 'WHAT: who the entity is or wants to become. HOW: how it operates or executes. CONTEXT: relevant information that does not itself express identity.',
  signalType: 'Definition: says what it is. Purpose: why it exists. Aspiration: what it wants to become. Promise: a commitment to others. Preservation: what must not change. Rejection: what it refuses to be. External interpretation: another party’s evidenced view of its identity.',
  finalSentence: 'Write one evidence-bound identity statement. Name the entity and the direction of identity without adding motives, certainty, or conclusions unsupported by the source.',
  confidence: 'Your confidence that the final sentence is a genuine, accurately classified identity signal. Judge the evidence and interpretation—not your confidence in the source’s truthfulness.',
  comment: 'Record why you changed, approved, or rejected the candidate. Be specific enough that another reviewer could understand and repeat your decision.',
} as const;

export function ReviewHelp({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex normal-case tracking-normal">
      <button
        type="button"
        aria-label="Review guidance"
        className="text-zinc-600 transition hover:text-sky-300 focus:text-sky-300 focus:outline-none"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-72 -translate-x-1/2 rounded-lg border border-white/10 bg-zinc-900 p-3 text-left text-xs font-normal leading-relaxed text-zinc-200 shadow-xl group-hover:block group-focus-within:block"
      >
        {text}
      </span>
    </span>
  );
}
