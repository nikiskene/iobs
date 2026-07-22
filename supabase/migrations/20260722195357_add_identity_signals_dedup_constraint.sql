-- Add unique constraint to prevent duplicate signals on retry\nCREATE UNIQUE INDEX IF NOT EXISTS identity_signals_document_candidate_uniq\n  ON identity_signals (document_id, candidate_sentence);
\n;
