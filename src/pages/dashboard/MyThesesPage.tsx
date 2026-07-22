import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Thesis, ThesisCategory } from '../../lib/types';
import { Plus, Pencil } from 'lucide-react';
import ThesisEditor from './ThesisEditor';

export default function MyThesesPage() {
  const { user } = useAuth();
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [categories, setCategories] = useState<ThesisCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Thesis | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase
        .from('theses')
        .select('*, thesis_categories(*)')
        .eq('author_id', user!.id)
        .order('updated_at', { ascending: false }),
      supabase
        .from('thesis_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order'),
    ]).then(([thesisRes, catRes]) => {
      setTheses((thesisRes.data as Thesis[]) || []);
      setCategories((catRes.data as ThesisCategory[]) || []);
      setLoading(false);
    });
  }, [user]);

  const refresh = async () => {
    const { data } = await supabase
      .from('theses')
      .select('*, thesis_categories(*)')
      .eq('author_id', user!.id)
      .order('updated_at', { ascending: false });
    setTheses((data as Thesis[]) || []);
  };

  if (editing || creating) {
    return (
      <ThesisEditor
        thesis={editing}
        categories={categories}
        onClose={() => {
          setEditing(null);
          setCreating(false);
          refresh();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Theses</h1>
          <p className="mt-1 text-sm text-zinc-400">Create and manage your theses.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-md hover:bg-sky-400 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Thesis
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-zinc-500">Loading...</p>
        ) : theses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500">You haven't created any theses yet.</p>
            <button
              onClick={() => setCreating(true)}
              className="mt-4 text-sm text-sky-400 hover:text-sky-300 transition-colors"
            >
              Create your first thesis
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {theses.map((thesis) => {
              const cat = thesis.thesis_categories;
              return (
                <div
                  key={thesis.id}
                  className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {cat && (
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${cat.color_hex}15`,
                              color: cat.color_hex,
                            }}
                          >
                            {cat.name}
                          </span>
                        )}
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            thesis.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : thesis.status === 'archived'
                              ? 'bg-zinc-500/10 text-zinc-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {thesis.status}
                        </span>
                      </div>
                      <h3 className="font-semibold leading-tight">{thesis.title}</h3>
                      {thesis.subheadline && (
                        <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{thesis.subheadline}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setEditing(thesis)}
                      className="shrink-0 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  {thesis.short_explanation && (
                    <p className="mt-3 text-sm text-zinc-400 line-clamp-2">{thesis.short_explanation}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
