import { useState } from 'react';
import { ExternalLink, Save } from 'lucide-react';
import type { ExpeditionInquiry } from '../../../lib/types';
import { inquiryStatuses } from './inquiryStatus';

export default function InquiryCard({
  inquiry,
  onUpdate,
}: {
  inquiry: ExpeditionInquiry;
  onUpdate: (
    inquiry: ExpeditionInquiry,
    updates: Partial<ExpeditionInquiry>
  ) => Promise<void>;
}) {
  const [status, setStatus] = useState(inquiry.status || 'new');
  const [adminNotes, setAdminNotes] = useState(inquiry.admin_notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    await onUpdate(inquiry, {
      status,
      admin_notes: adminNotes,
    });

    setSaving(false);
  };

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex flex-col justify-between gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs text-sky-300">
              {status}
            </span>

            <span className="text-xs text-zinc-500">
              {new Date(inquiry.created_at).toLocaleString()}
            </span>

            {inquiry.commitment_accepted && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                Committed
              </span>
            )}
          </div>

          <h2 className="mt-3 text-xl font-semibold">{inquiry.name}</h2>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a
              href={`mailto:${inquiry.email}`}
              className="text-sky-400 hover:text-sky-300"
            >
              {inquiry.email}
            </a>

            {inquiry.linkedin_url && (
              <a
                href={inquiry.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300"
              >
                LinkedIn <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <Info label="Company" value={inquiry.company} />
            <Info label="Position" value={inquiry.position} />
            <Info label="Expedition" value={inquiry.expeditions?.title} />
            <Info label="Location" value={inquiry.expeditions?.location} />
          </div>

          <div className="mt-5 grid gap-4">
            <Answer
              title="Why now?"
              body={inquiry.motivation}
            />

            <Answer
              title="Contribution"
              body={inquiry.contribution}
            />

            <Answer
              title="One conversation"
              body={inquiry.curiosity_question}
            />

            {inquiry.message && (
              <Answer
                title="Additional message"
                body={inquiry.message}
              />
            )}
          </div>
        </div>

        <div className="w-full shrink-0 space-y-3 lg:w-80">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as ExpeditionInquiry['status'])
              }
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {inquiryStatuses.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                  className="bg-zinc-900"
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Curator Notes
            </label>

            <textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              rows={7}
              className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Internal notes..."
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-400 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </p>
      <p className="mt-1 text-zinc-300">{value || '—'}</p>
    </div>
  );
}

function Answer({
  title,
  body,
}: {
  title: string;
  body?: string | null;
}) {
  if (!body) return null;

  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/80">
        {title}
      </h3>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
        {body}
      </p>
    </div>
  );
}