// src/pages/admin/expeditions/ExpeditionsAdmin.tsx
import { useEffect, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Expedition } from '../../../lib/types';
import ExpeditionEditor from './ExpeditionEditor';

export default function ExpeditionsAdmin() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [editing, setEditing] = useState<Expedition | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchExpeditions = async () => {
    const { data } = await supabase
      .from('expeditions')
      .select('*')
      .order('start_date', { ascending: false });

    setExpeditions((data as Expedition[]) || []);
  };

  useEffect(() => {
    fetchExpeditions();
  }, []);

  if (editing || creating) {
    return (
      <ExpeditionEditor
        expedition={editing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
          fetchExpeditions();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expeditions CMS</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage tours, locations, pricing and program descriptions.
          </p>
        </div>

        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
        >
          <Plus className="h-4 w-4" />
          New Expedition
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {expeditions.length === 0 ? (
          <p className="text-sm text-zinc-500">No expeditions yet.</p>
        ) : (
          expeditions.map((expedition) => (
            <div
              key={expedition.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-400">
                    {expedition.status}
                  </span>

                  {!expedition.is_active && (
                    <span className="rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs text-zinc-500">
                      Inactive
                    </span>
                  )}

                  {expedition.is_featured && (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
                      Featured
                    </span>
                  )}
                </div>

                <h3 className="mt-2 text-lg font-semibold">{expedition.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {expedition.location || 'No location'} · {expedition.price || 'No price'}
                </p>
              </div>

              <button
                onClick={() => setEditing(expedition)}
                className="rounded-md p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}