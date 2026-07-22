// src/pages/admin/identity/SignalEditForm.tsx
import { useState } from 'react';
import type { IdentityClassification, IdentitySignalType, IdentityVisibility, SignalWithRelations } from '../../../lib/identity/types';
import type { ReviewAction, ReviewOverrides } from '../../../lib/identity/identityApi';
import { ReviewHelp, reviewHelp } from './reviewHelp';

type Props = {
  signal: SignalWithRelations;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (decision: ReviewAction, overrides: ReviewOverrides) => void;
};

export default function SignalEditForm({ signal, busy, onCancel, onSubmit }: Props) {
  const [classification, setClassification] = useState<IdentityClassification>(signal.classification);
  const [signalType, setSignalType] = useState<IdentitySignalType | ''>(signal.signal_type ?? '');
  const [sentence, setSentence] = useState(signal.candidate_sentence);
  const [confidence, setConfidence] = useState(signal.model_confidence ?? 0.5);
  const [comment, setComment] = useState('');
  const initialVisibility = signal.visibility === 'research_team' ? 'team' : signal.visibility;
  const [visibility, setVisibility] = useState<IdentityVisibility>(initialVisibility);

  function submit(decision: ReviewAction) {
    onSubmit(decision, {
      approvedSentence: sentence.trim(),
      classification,
      signalType: signalType || undefined,
      reviewerConfidence: confidence,
      comment: comment.trim() || undefined,
      visibility,
    });
  }

  return (
    <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
      <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
        <p className="text-xs uppercase tracking-wider text-sky-300">Original AI output—preserved</p>
        <p className="mt-1 text-sm text-zinc-300">{signal.candidate_sentence}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Classification" help={reviewHelp.classification}>
          <select value={classification} onChange={(e) => setClassification(e.target.value as IdentityClassification)} className={controlClass}>
            <option value="what">WHAT</option><option value="how">HOW</option><option value="context">CONTEXT</option>
          </select>
        </Field>
        <Field label="Signal type" help={reviewHelp.signalType}>
          <select value={signalType} onChange={(e) => setSignalType(e.target.value as IdentitySignalType | '')} className={controlClass}>
            <option value="">None</option>
            {['definition', 'purpose', 'aspiration', 'promise', 'preservation', 'rejection', 'external_interpretation'].map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Final sentence" help={reviewHelp.finalSentence}><textarea value={sentence} onChange={(e) => setSentence(e.target.value)} rows={3} className={controlClass} /></Field>
      <Field label={`Reviewer confidence: ${Math.round(confidence * 100)}%`} help={reviewHelp.confidence}><input type="range" min="0" max="1" step="0.05" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="w-full" /></Field>
      <Field label="Reviewer comment / reason" help={reviewHelp.comment}><textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} className={controlClass} placeholder="Why did you change or decide this signal?" /></Field>
      <Field label="Audience" help="Controls where an approved signal may appear. During W01 every research screen remains admin-protected, even if a future audience is selected."><select value={visibility} onChange={(e) => setVisibility(e.target.value as IdentityVisibility)} className={controlClass}><option value="admin_only">Admin only</option><option value="team">Team</option><option value="explorers">Explorers</option><option value="members">Members</option><option value="public">Public</option></select></Field>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => submit('rewritten')} disabled={busy || !sentence.trim()} className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-black disabled:opacity-50">Save corrections</button>
        <button onClick={() => submit('approved')} disabled={busy || !sentence.trim()} className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs text-emerald-300 disabled:opacity-50">Save & approve</button>
        <button onClick={() => submit('rejected')} disabled={busy} className="rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-300 disabled:opacity-50">Save & reject</button>
        <button onClick={onCancel} disabled={busy} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400">Cancel</button>
      </div>
    </div>
  );
}

const controlClass = 'w-full rounded-lg border border-white/10 bg-zinc-950 p-3 text-sm text-white focus:border-white/20 focus:outline-none';

function Field({ label, help, children }: { label: string; help: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5 text-xs uppercase tracking-wider text-zinc-500"><span className="flex items-center gap-1.5">{label}<ReviewHelp text={help} /></span>{children}</label>;
}
