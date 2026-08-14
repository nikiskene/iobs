// src/pages/admin/ThesesAdmin.tsx
import { useEffect, useState } from 'react';
import { Pencil, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Thesis, ThesisCategory } from '../../lib/types';
import AdminThesisEditor from './theses/AdminThesisEditor';

type ThesisWithScales = Thesis & {
  thesis_impact_scales?: { scale_slug: string }[];
};

export default function ThesesAdmin() {
  const [theses, setTheses] = useState<ThesisWithScales[]>([]);
  const [categories, setCategories] = useState<ThesisCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Thesis | null>(null);

  const load = async () => {
    const [{ data: thesisData }, { data: categoryData }] = await Promise.all([
      supabase
        .from('theses')
        .select('*, thesis_categories(*), profiles(id, full_name), thesis_media(*), thesis_impact_scales(scale_slug)')
        .order('updated_at', { ascending: false }),
      supabase.from('thesis_categories').select('*').order('display_order'),
    ]);
    setTheses((thesisData as ThesisWithScales[]) || []);
    setCategories((categoryData as ThesisCategory[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (editing) {
    return <AdminThesisEditor thesis={editing} categories={categories} onClose={() => { setEditing(null); load(); }} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">All Theses</h1>
      <p className="mt-1 text-sm text-zinc-400">Manage cases and connect them to one or more scale worlds.</p>
      <div className="mt-8 space-y-3">
        {loading && <p className="text-zinc-500">Loading...</p>}
        {!loading && theses.length === 0 && <p className="text-zinc-500">No theses yet.</p>}
        {theses.map((thesis) => (
          <article key={thesis.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-5">
            {thesis.thesis_media?.[0]?.file_url
              ? <img src={thesis.thesis_media[0].file_url} alt="" className="h-16 w-24 rounded-md object-cover" />
              : <div className="h-16 w-24 rounded-md bg-white/5" />}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                {thesis.thesis_categories && <span>{thesis.thesis_categories.name}</span>}
                <span>{thesis.status}</span>
                {thesis.is_featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                {thesis.thesis_impact_scales?.map((item) => <span key={item.scale_slug} className="rounded-full bg-amber-400/10 px-2 py-0.5 text-amber-300">{item.scale_slug}</span>)}
              </div>
              <h3 className="font-semibold">{thesis.title}</h3>
              <p className="mt-1 text-xs text-zinc-500">by {thesis.profiles?.full_name || 'Unknown'} · {new Date(thesis.updated_at).toLocaleDateString()}</p>
            </div>
            <button onClick={() => setEditing(thesis)} className="rounded-md p-2 text-zinc-500 hover:bg-white/5 hover:text-white" aria-label={`Edit ${thesis.title}`}>
              <Pencil className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
