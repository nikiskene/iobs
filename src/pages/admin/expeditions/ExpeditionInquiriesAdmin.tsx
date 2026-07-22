import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { ExpeditionInquiry } from '../../../lib/types';
import InquiryCard from './InquiryCard';

type ViewMode = 'active' | 'archive';

const archiveStatuses: ExpeditionInquiry['status'][] = [
  'archived',
  'declined',
  'attended',
  'alumni',
];

export default function ExpeditionInquiriesAdmin() {
  const [inquiries, setInquiries] = useState<ExpeditionInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [selectedExpeditionId, setSelectedExpeditionId] = useState('all');

  const fetchInquiries = async () => {
    const { data } = await supabase
      .from('expedition_inquiries')
      .select(`
        *,
        expeditions(id, title, slug, location, start_date)
      `)
      .order('created_at', { ascending: false });

    setInquiries((data as ExpeditionInquiry[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const expeditions = useMemo(() => {
    const map = new Map<
      string,
      { id: string; title: string; location: string | null; start_date: string | null }
    >();

    inquiries.forEach((inquiry) => {
      if (inquiry.expeditions) {
        map.set(inquiry.expeditions.id, {
          id: inquiry.expeditions.id,
          title: inquiry.expeditions.title,
          location: inquiry.expeditions.location,
          start_date: inquiry.expeditions.start_date,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      const isArchived = archiveStatuses.includes(inquiry.status);

      if (viewMode === 'active' && isArchived) return false;
      if (viewMode === 'archive' && !isArchived) return false;

      if (
        selectedExpeditionId !== 'all' &&
        inquiry.expedition_id !== selectedExpeditionId
      ) {
        return false;
      }

      return true;
    });
  }, [inquiries, selectedExpeditionId, viewMode]);

  const activeCount = inquiries.filter(
    (inquiry) => !archiveStatuses.includes(inquiry.status)
  ).length;

  const archiveCount = inquiries.filter((inquiry) =>
    archiveStatuses.includes(inquiry.status)
  ).length;

  const updateInquiry = async (
    inquiry: ExpeditionInquiry,
    updates: Partial<ExpeditionInquiry>
  ) => {
    const { error } = await supabase
      .from('expedition_inquiries')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiry.id);

    if (!error) fetchInquiries();
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>

          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Review requests to join expeditions. Applications are not tickets;
            they help curate the right group for the right conversation.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedExpeditionId}
            onChange={(event) => setSelectedExpeditionId(event.target.value)}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all" className="bg-zinc-900">
              All Expeditions
            </option>

            {expeditions.map((expedition) => (
              <option
                key={expedition.id}
                value={expedition.id}
                className="bg-zinc-900"
              >
                {expedition.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => setViewMode('active')}
          className={`rounded-full px-4 py-2 text-sm transition ${
            viewMode === 'active'
              ? 'bg-white text-black'
              : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          Active Applications ({activeCount})
        </button>

        <button
          onClick={() => setViewMode('archive')}
          className={`rounded-full px-4 py-2 text-sm transition ${
            viewMode === 'archive'
              ? 'bg-white text-black'
              : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          Archive ({archiveCount})
        </button>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            {filteredInquiries.length}{' '}
            {filteredInquiries.length === 1 ? 'application' : 'applications'}
          </p>
        </div>

        {loading ? (
          <p className="text-zinc-500">Loading...</p>
        ) : filteredInquiries.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center text-zinc-500">
            No applications in this view.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => (
              <InquiryCard
                key={inquiry.id}
                inquiry={inquiry}
                onUpdate={updateInquiry}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}