import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { ThesisCategory } from '../../lib/types';
import { Save, Plus, Pencil, X } from 'lucide-react';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<ThesisCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ThesisCategory | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('thesis_categories')
      .select('*')
      .order('display_order');
    setCategories((data as ThesisCategory[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (editing || creating) {
    return (
      <CategoryEditor
        category={editing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
          fetchCategories();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Thesis Categories</h1>
          <p className="mt-1 text-sm text-zinc-400">Manage thesis categories and their display.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-md hover:bg-sky-400 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {loading ? (
          <p className="text-zinc-500">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-zinc-500">No categories yet.</p>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex items-center justify-between hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color_hex }}
                />
                <div className="min-w-0">
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono">/{cat.slug}</p>
                </div>
                {!cat.is_active && (
                  <span className="text-xs bg-zinc-500/10 text-zinc-400 px-2 py-0.5 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
              <button
                onClick={() => setEditing(cat)}
                className="shrink-0 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-md transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CategoryEditor({
  category,
  onClose,
}: {
  category: ThesisCategory | null;
  onClose: () => void;
}) {
  const isEditing = !!category;
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [colorHex, setColorHex] = useState(category?.color_hex || '#3B82F6');
  const [displayOrder, setDisplayOrder] = useState(category?.display_order || 0);
  const [isActive, setIsActive] = useState(category?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');

    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required.');
      setSaving(false);
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      description,
      color_hex: colorHex,
      display_order: displayOrder,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (isEditing) {
      result = await supabase.from('thesis_categories').update(payload).eq('id', category!.id);
    } else {
      result = await supabase.from('thesis_categories').insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    onClose();
  };

  return (
    <div>
      <button
        onClick={onClose}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
      >
        <X className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold">{isEditing ? 'Edit Category' : 'New Category'}</h1>

      <div className="mt-6 max-w-2xl space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-10 h-10 rounded-md border border-white/10 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Display Order</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="cat_active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500"
          />
          <label htmlFor="cat_active" className="text-sm text-zinc-300">Active</label>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-4 py-2">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white font-medium rounded-md hover:bg-sky-400 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 text-sm text-zinc-400 hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
