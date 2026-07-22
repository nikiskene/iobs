// src/pages/admin/conversations/ConversationEditor.tsx
import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Conversation } from '../../../lib/types';

export default function ConversationEditor({
  conversation,
  onClose,
}: {
  conversation: Conversation | null;
  onClose: () => void;
}) {
  const isEditing = !!conversation;

  const [title, setTitle] = useState(conversation?.title || '');
  const [slug, setSlug] = useState(conversation?.slug || '');
  const [description, setDescription] = useState(conversation?.description || '');
  const [type, setType] = useState<Conversation['conversation_type']>(
    conversation?.conversation_type || 'conversation'
  );
  const [location, setLocation] = useState(conversation?.location || '');
  const [startTime, setStartTime] = useState(toLocalDateTime(conversation?.start_time));
  const [endTime, setEndTime] = useState(toLocalDateTime(conversation?.end_time));
  const [heroImageUrl, setHeroImageUrl] = useState(conversation?.hero_image_url || '');
  const [status, setStatus] = useState<Conversation['status']>(
    conversation?.status || 'draft'
  );
  const [isFeatured, setIsFeatured] = useState(conversation?.is_featured ?? false);
  const [isActive, setIsActive] = useState(conversation?.is_active ?? true);
  const [displayOrder, setDisplayOrder] = useState(conversation?.display_order ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inputClass =
    'w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

  const handleSave = async () => {
    setSaving(true);
    setError('');

    if (!title.trim()) {
      setError('Title is required.');
      setSaving(false);
      return;
    }

    if (!slug.trim()) {
      setError('Slug is required.');
      setSaving(false);
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description,
      conversation_type: type,
      location,
      start_time: startTime ? new Date(startTime).toISOString() : null,
      end_time: endTime ? new Date(endTime).toISOString() : null,
      hero_image_url: heroImageUrl,
      status,
      is_featured: isFeatured,
      is_active: isActive,
      display_order: displayOrder,
      updated_at: new Date().toISOString(),
    };

    const result = isEditing
      ? await supabase.from('conversations').update(payload).eq('id', conversation.id)
      : await supabase.from('conversations').insert(payload);

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
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
      >
        <X className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold">
        {isEditing ? 'Edit Conversation' : 'New Conversation'}
      </h1>

      <div className="mt-6 max-w-3xl space-y-5">
        <TextInput label="Title" value={title} onChange={setTitle} inputClass={inputClass} />
        <TextInput label="Slug" value={slug} onChange={setSlug} inputClass={inputClass} />

        <Field label="Type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Conversation['conversation_type'])}
            className={inputClass}
          >
            <option value="conversation" className="bg-zinc-900">Conversation</option>
            <option value="dinner" className="bg-zinc-900">Dinner</option>
            <option value="session" className="bg-zinc-900">Session</option>
            <option value="workshop" className="bg-zinc-900">Workshop</option>
            <option value="field_visit" className="bg-zinc-900">Field Visit</option>
            <option value="roundtable" className="bg-zinc-900">Roundtable</option>
          </select>
        </Field>

        <TextInput label="Location" value={location} onChange={setLocation} inputClass={inputClass} />
        <TextInput label="Start Time" type="datetime-local" value={startTime} onChange={setStartTime} inputClass={inputClass} />
        <TextInput label="End Time" type="datetime-local" value={endTime} onChange={setEndTime} inputClass={inputClass} />
        <TextInput label="Hero Image URL" value={heroImageUrl} onChange={setHeroImageUrl} inputClass={inputClass} />

        <TextArea label="Description" value={description} onChange={setDescription} inputClass={inputClass} rows={7} />

        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Conversation['status'])}
            className={inputClass}
          >
            <option value="draft" className="bg-zinc-900">Draft</option>
            <option value="published" className="bg-zinc-900">Published</option>
            <option value="archived" className="bg-zinc-900">Archived</option>
          </select>
        </Field>

        <TextInput
          label="Display Order"
          type="number"
          value={String(displayOrder)}
          onChange={(value) => setDisplayOrder(Number(value))}
          inputClass={inputClass}
        />

        <Checkbox label="Featured" checked={isFeatured} onChange={setIsFeatured} />
        <Checkbox label="Active" checked={isActive} onChange={setIsActive} />

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
          {saving ? 'Saving...' : 'Save Conversation'}
        </button>
      </div>
    </div>
  );
}

function toLocalDateTime(value?: string | null) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 16);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</label>{children}</div>;
}

function TextInput({ label, value, onChange, inputClass, type = 'text' }: {
  label: string; value: string; onChange: (value: string) => void; inputClass: string; type?: string;
}) {
  return <Field label={label}><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} /></Field>;
}

function TextArea({ label, value, onChange, inputClass, rows }: {
  label: string; value: string; onChange: (value: string) => void; inputClass: string; rows: number;
}) {
  return <Field label={label}><textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} resize-none`} /></Field>;
}

function Checkbox({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-zinc-300">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}