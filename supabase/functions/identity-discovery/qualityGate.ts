// supabase/functions/identity-discovery/qualityGate.ts
import type { CandidateSignal } from './extraction.ts';

const IDENTITY_LANGUAGE = [
  /\bwe are\b(?!\s+(partnering|launching|investing|expanding|using|announcing|introducing|opening|supporting))/i,
  /\bour (purpose|mission|role|identity|belief)\b/i,
  /\bwe (believe|stand for|vow|remain|exist)\b/i,
  /\b(committed|recommit) to\b/i,
  /\b(want|seek|aim) to become\b/i,
  /\bknown for\b/i,
  /\bwill continue to\b/i,
  /\bwill stand\b/i,
  /\bnational identity\b/i,
  /\bwho we are\b/i,
  /\bwhat we stand for\b/i,
];

export function isGrounded(source: string, evidence: string): boolean {
  if (evidence.length < 25 || source.length < 80) return false;
  const normalizedSource = normalize(source);
  const normalizedEvidence = normalize(evidence);
  return normalizedEvidence.length >= 20 && normalizedSource.includes(normalizedEvidence);
}

export function hasIdentityLanguage(evidence: string): boolean {
  return IDENTITY_LANGUAGE.some((pattern) => pattern.test(evidence));
}

export function isVerifiedWhat(candidate: CandidateSignal): boolean {
  const signal = candidate.signal;
  const source = candidate.document.analysis_text ?? candidate.document.snippet ?? '';
  return signal.classification === 'what'
    && Number(signal.identity_relevance ?? 0) >= 60
    && Number(signal.evidence_strength ?? 0) >= 40
    && Number(signal.model_confidence ?? 0) >= 0.55
    && isGrounded(source, signal.evidence_text)
    && hasIdentityLanguage(signal.evidence_text);
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[“”‘’]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
