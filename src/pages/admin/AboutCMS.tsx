// src/pages/admin/AboutCMS.tsx
import { useEffect, useState } from 'react';
import { Save, Pencil, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { HomepageSection } from '../../lib/types';

const ABOUT_KEYS = [
  'about_hero',
  'about_mission',
  'about_vision',
  'about_approach',
  'about_why_now',
  'about_cta',
];

const ICON_OPTIONS = [
  { value: '', label: 'No icon' },
  { value: 'target', label: 'Target / Mission' },
  { value: 'eye', label: 'Eye / Vision' },
  { value: 'lightbulb', label: 'Lightbulb / Approach' },
  { value: 'globe', label: 'Globe / World' },
];

export default function AboutCMS() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    const { data } = await supabase
      .from('homepage_sections')
      .select('*')
      .in('section_key', ABOUT_KEYS)
      .order('display_order');

    setSections((data as HomepageSection[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  if (editing) {
    return (
      <AboutSectionEditor
        section={editing}
        onClose={() => {
          setEditing(null);
          fetchSections();
        }}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">About CMS</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Manage About page content sections.
      </p>

      <div className="mt-8 space-y-3">
        {loading && <p className="text-zinc-500">Loading...</p>}

        {!loading && sections.length === 0 && (
          <p className="text-zinc-500">
            No About sections found. Seed the About content first.
          </p>
        )}

        {sections.map((section) => (
          <div
            key={section.id}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-500">
                  {section.section_key}
                </span>

                {section.icon_key && (
                  <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs text-sky-300">
                    {section.icon_key}
                  </span>
                )}

                {!section.is_active && (
                  <span className="rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs text-zinc-400">
                    Inactive
                  </span>
                )}
              </div>

              <h3 className="mt-1 font-semibold">
                {section.headline || 'Untitled'}
              </h3>

              {section.body && (
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                  {section.body}
                </p>
              )}
            </div>

            <button
              onClick={() => setEditing(section)}
              className="shrink-0 rounded-md p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutSectionEditor({
  section,
  onClose,
}: {
  section: HomepageSection;
  onClose: () => void;
}) {
  const [headline, setHeadline] = useState(section.headline || '');
  const [subheadline, setSubheadline] = useState(section.subheadline || '');
  const [body, setBody] = useState(section.body || '');
  const [iconKey, setIconKey] = useState(section.icon_key || '');
  const [isActive, setIsActive] = useState(section.is_active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inputClass =
    'w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('homepage_sections')
      .update({
        icon_key: iconKey || null,
        headline,
        subheadline,
        body,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', section.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    onClose();
  };

  return (
    <div>
      <button
        onClick={onClose}
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
      >
        <X className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold">Edit About Section</h1>
      <p className="mt-1 font-mono text-sm text-zinc-500">
        {section.section_key}
      </p>

      <div className="mt-6 max-w-2xl space-y-5">
        <Field label="Icon">
          <select
            value={iconKey}
            onChange={(e) => setIconKey(e.target.value)}
            className={inputClass}
          >
            {ICON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-zinc-900">
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Headline">
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Subheadline">
          <input
            value={subheadline}
            onChange={(e) => setSubheadline(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Body">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active
        </label>

        {error && (
          <div className="rounded-md border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-5 py-2.5 font-medium text-white hover:bg-sky-400 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Section'}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      {children}
    </div>
  );
}