//src/pages/admin/HomepageCMS.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { HomepageSection } from '../../lib/types';
import { Save, Plus, Pencil, X } from 'lucide-react';

export default function HomepageCMS() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchSections = async () => {
    const { data } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('display_order');
    setSections((data as HomepageSection[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  if (editing || creating) {
    return (
      <SectionEditor
        section={editing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
          fetchSections();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Homepage CMS</h1>
          <p className="mt-1 text-sm text-zinc-400">Manage homepage content sections.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white text-sm font-medium rounded-md hover:bg-sky-400 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Section
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {loading ? (
          <p className="text-zinc-500">Loading...</p>
        ) : sections.length === 0 ? (
          <p className="text-zinc-500">No sections yet.</p>
        ) : (
          sections.map((section) => (
            <div
              key={section.id}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex items-center justify-between hover:border-white/10 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-zinc-500">{section.section_key}</span>
                  {!section.is_active && (
                    <span className="text-xs bg-zinc-500/10 text-zinc-400 px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <h3 className="font-semibold mt-1">{section.headline || 'Untitled'}</h3>
                {section.subheadline && (
                  <p className="text-sm text-zinc-400 mt-0.5">{section.subheadline}</p>
                )}
              </div>
              <button
                onClick={() => setEditing(section)}
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

function SectionEditor({
  section,
  onClose,
}: {
  section: HomepageSection | null;
  onClose: () => void;
}) {
  const isEditing = !!section;
  const [sectionKey, setSectionKey] = useState(section?.section_key || '');
  const [headline, setHeadline] = useState(section?.headline || '');
  const [subheadline, setSubheadline] = useState(section?.subheadline || '');
  const [body, setBody] = useState(section?.body || '');
  const [mediaUrl, setMediaUrl] = useState(section?.media_url || '');
  const [displayOrder, setDisplayOrder] = useState(section?.display_order || 0);
  const [isActive, setIsActive] = useState(section?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');

    if (!sectionKey.trim()) {
      setError('Section key is required.');
      setSaving(false);
      return;
    }

    const payload = {
      section_key: sectionKey.trim(),
      headline,
      subheadline,
      body,
      media_url: mediaUrl,
      display_order: displayOrder,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (isEditing) {
      result = await supabase.from('homepage_sections').update(payload).eq('id', section!.id);
    } else {
      result = await supabase.from('homepage_sections').insert(payload);
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

      <h1 className="text-2xl font-bold">{isEditing ? 'Edit Section' : 'New Section'}</h1>

      <div className="mt-6 max-w-2xl space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Section Key</label>
            <input
              type="text"
              value={sectionKey}
              onChange={(e) => setSectionKey(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono"
              placeholder="hero, mission, vision..."
            />
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

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Subheadline</label>
          <input
            type="text"
            value={subheadline}
            onChange={(e) => setSubheadline(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Media URL</label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500"
          />
          <label htmlFor="is_active" className="text-sm text-zinc-300">Active</label>
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
            {saving ? 'Saving...' : isEditing ? 'Update Section' : 'Create Section'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 text-sm text-zinc-400 hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
