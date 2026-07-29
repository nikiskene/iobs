import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

type InquiryStatus =
  | 'draft' | 'submitted' | 'contacted' | 'qualified'
  | 'proposal_sent' | 'confirmed' | 'declined' | 'archived';

type CustomExpeditionInquiry = {
  id: string;
  status: InquiryStatus;
  contact_name: string;
  email: string;
  phone?: string | null;
  organization_name?: string | null;
  organization_type?: string | null;
  topic?: string | null;
  other_topic?: string | null;
  destination?: string | null;
  suggested_location?: string | null;
  duration_days?: number | null;
  group_size?: number | null;
  preferred_timing?: string | null;
  context?: string | null;
  estimated_price_usd?: number | null;
  admin_notes?: string | null;
  updated_at: string;
};

const statuses: CustomExpeditionInquiry['status'][] = [
  'draft',
  'submitted',
  'contacted',
  'qualified',
  'proposal_sent',
  'confirmed',
  'declined',
  'archived',
];

export default function CustomExpeditionInquiriesAdmin() {
  const [inquiries, setInquiries] = useState<CustomExpeditionInquiry[]>([]);
  const [active, setActive] = useState<CustomExpeditionInquiry | null>(null);
  const [filter, setFilter] =
    useState<CustomExpeditionInquiry['status'] | 'all'>('submitted');
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    setLoading(true);

    let query = supabase
      .from('custom_expedition_inquiries')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;

    setInquiries((data as CustomExpeditionInquiry[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
  }, [filter]);

  const updateStatus = async (
    id: string,
    status: CustomExpeditionInquiry['status']
  ) => {
    const { error } = await supabase
      .from('custom_expedition_inquiries')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setInquiries((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item))
      );

      setActive((current) =>
        current?.id === id ? { ...current, status } : current
      );
    }
  };

  const updateNotes = async (id: string, admin_notes: string) => {
    const { error } = await supabase
      .from('custom_expedition_inquiries')
      .update({ admin_notes })
      .eq('id', id);

    if (!error) {
      setInquiries((current) =>
        current.map((item) =>
          item.id === id ? { ...item, admin_notes } : item
        )
      );

      setActive((current) =>
        current?.id === id ? { ...current, admin_notes } : current
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Custom Expedition Inquiries</h1>

      <p className="mt-1 text-sm text-zinc-400">
        Drafts, submitted briefs and proposal leads for custom expeditions.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['all', ...statuses] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] ${
              filter === status
                ? 'bg-sky-500 text-white'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10'
            }`}
          >
            {status.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-3">
          {loading && <p className="text-zinc-500">Loading...</p>}

          {!loading && inquiries.length === 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-sm text-zinc-500">
              No inquiries in this filter.
            </div>
          )}

          {inquiries.map((inquiry) => (
            <button
              key={inquiry.id}
              onClick={() => setActive(inquiry)}
              className={`block w-full rounded-xl border p-5 text-left transition ${
                active?.id === inquiry.id
                  ? 'border-sky-400 bg-sky-500/10'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/15'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{inquiry.status}</Badge>
                    {inquiry.organization_type && (
                      <Badge>{inquiry.organization_type}</Badge>
                    )}
                    {inquiry.topic && <Badge>{inquiry.topic}</Badge>}
                  </div>

                  <h3 className="mt-3 font-semibold">
                    {inquiry.organization_name || 'Unknown organization'}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    {inquiry.contact_name || 'No contact'} ·{' '}
                    {inquiry.email || 'No email'}
                  </p>
                </div>

                <p className="text-right text-xs text-zinc-600">
                  {new Date(inquiry.updated_at).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-zinc-400 sm:grid-cols-3">
                <p>
                  {formatDestination(
                    inquiry.destination,
                    inquiry.suggested_location
                  )}
                </p>
                <p>
                  {inquiry.duration_days
                    ? `${inquiry.duration_days} days`
                    : 'No duration'}
                </p>
                <p>
                  {inquiry.group_size
                    ? `${inquiry.group_size} people`
                    : 'No group size'}
                </p>
              </div>

              {inquiry.estimated_price_usd && (
                <p className="mt-3 text-sm font-semibold text-white">
                  USD {inquiry.estimated_price_usd.toLocaleString()}
                </p>
              )}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
          {!active ? (
            <p className="text-sm text-zinc-500">Select an inquiry.</p>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {active.organization_name || 'Unknown organization'}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-400">
                    {active.contact_name || 'No contact'} ·{' '}
                    {active.email || 'No email'}
                  </p>
                </div>

                <select
                  value={active.status}
                  onChange={(event) =>
                    updateStatus(
                      active.id,
                      event.target.value as CustomExpeditionInquiry['status']
                    )
                  }
                  className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <Info label="Type" value={active.organization_type} />
                <Info
                  label="Topic"
                  value={
                    active.topic === 'other'
                      ? active.other_topic
                      : active.topic
                  }
                />
                <Info
                  label="Destination"
                  value={formatDestination(
                    active.destination,
                    active.suggested_location
                  )}
                />
                <Info label="Timing" value={active.preferred_timing} />
                <Info
                  label="Duration"
                  value={
                    active.duration_days
                      ? `${active.duration_days} days`
                      : null
                  }
                />
                <Info
                  label="Group size"
                  value={active.group_size ? `${active.group_size} people` : null}
                />
                <Info
                  label="Estimate"
                  value={
                    active.estimated_price_usd
                      ? `USD ${active.estimated_price_usd.toLocaleString()}`
                      : null
                  }
                />
                <Info label="Phone" value={active.phone} />
              </div>

              {active.context && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-zinc-300">
                    Context
                  </h3>

                  <p className="mt-2 whitespace-pre-line rounded-lg bg-white/5 p-4 text-sm leading-relaxed text-zinc-400">
                    {active.context}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-zinc-300">
                  Admin notes
                </h3>

                <textarea
                  value={active.admin_notes || ''}
                  onChange={(event) =>
                    setActive({ ...active, admin_notes: event.target.value })
                  }
                  onBlur={(event) => updateNotes(active.id, event.target.value)}
                  rows={5}
                  className="mt-2 w-full resize-none rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-400">
      {children}
    </span>
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
    <div className="flex justify-between gap-6 border-b border-white/5 pb-2">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right text-zinc-300">{value || '—'}</span>
    </div>
  );
}

function formatDestination(
  destination?: string | null,
  suggested?: string | null
) {
  if (destination === 'silicon_valley') return 'Silicon Valley';
  if (destination === 'shenzhen_hongkong') return 'Shenzhen / Hong Kong';
  if (destination === 'suggest_different_location') {
    return suggested || 'Different location';
  }

  return 'No destination';
}
