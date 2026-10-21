// src/pages/admin/events/EventEditor.tsx
import { useState } from "react";
import { Save, Upload, X } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { useChapterAccess } from "../../../hooks/useChapterAccess";
import EventAttendees from "./EventAttendees";
import { supabase } from "../../../lib/supabase";
import type { Event } from "../../../lib/types";

export default function EventEditor({
  event,
  onClose,
}: {
  event: Event | null;
  onClose: () => void;
}) {
  const isEditing = !!event;
  const { isAdmin } = useAuth();
  const { chapters } = useChapterAccess();
  const [category, setCategory] = useState<Event["category"]>(
    event?.category || (isAdmin ? "workshop" : "chapter_event"),
  );
  const [chapterId, setChapterId] = useState(event?.chapter_id || "");
  const [price, setPrice] = useState(
    String((event?.ticket_price_cents || 0) / 100),
  );
  const [currency, setCurrency] = useState(event?.ticket_currency || "EUR");

  const [title, setTitle] = useState(event?.title || "");
  const [slug, setSlug] = useState(event?.slug || "");
  const [status, setStatus] = useState<Event["status"]>(
    event?.status || "draft",
  );
  const [startDate, setStartDate] = useState(
    event?.start_date?.slice(0, 10) || "",
  );
  const [endDate, setEndDate] = useState(event?.end_date?.slice(0, 10) || "");
  const [location, setLocation] = useState(event?.location || "");
  const [description, setDescription] = useState(event?.description || "");
  const [heroImageUrl, setHeroImageUrl] = useState(event?.hero_image_url || "");
  const [investment, setInvestment] = useState(event?.investment || "");
  const [participationInfo, setParticipationInfo] = useState(
    event?.participation_info || "",
  );
  const [pastSummary, setPastSummary] = useState(event?.past_summary || "");
  const [youtubeUrl, setYoutubeUrl] = useState(event?.youtube_url || "");
  const [isActive, setIsActive] = useState(event?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-md border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-sky-500";

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError("");

    const safeName = file.name.replace(/\s+/g, "-");
    const filePath = isAdmin
      ? `events/${Date.now()}-${safeName}`
      : `chapters/${chapterId}/${Date.now()}-${safeName}`;

    const upload = await supabase.storage
      .from("event-media")
      .upload(filePath, file);

    if (upload.error) {
      setError(upload.error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("event-media")
      .getPublicUrl(filePath);

    setHeroImageUrl(data.publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      setSaving(false);
      return;
    }

    if (!slug.trim()) {
      setError("Slug is required.");
      setSaving(false);
      return;
    }

    if (!startDate) {
      setError("Start date is required.");
      setSaving(false);
      return;
    }

    if (
      (category === "chapter_event" && !chapterId) ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      Number(price) > 999999 ||
      !/^\d+(\.\d{1,2})?$/.test(price)
    ) {
      setError(
        "Select a chapter and enter a valid ticket price (up to two decimal places).",
      );
      setSaving(false);
      return;
    }
    if (endDate && endDate < startDate) {
      setError("End date must follow start date.");
      setSaving(false);
      return;
    }
    const payload = {
      category,
      chapter_id: category === "chapter_event" ? chapterId : null,
      ticket_price_cents: Math.round(Number(price) * 100),
      ticket_currency: currency,
      title: title.trim(),
      slug: slug.trim(),
      status,
      start_date: startDate,
      end_date: endDate || null,
      location,
      description,
      hero_image_url: heroImageUrl,
      investment,
      participation_info: participationInfo,
      past_summary: pastSummary,
      youtube_url: youtubeUrl,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    const result = isEditing
      ? await supabase.from("events").update(payload).eq("id", event.id)
      : await supabase.from("events").insert(payload);

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
        {isEditing ? "Edit Event" : "New Event"}
      </h1>

      <div className="mt-6 max-w-3xl space-y-5">
        <Field label="Category">
          <select
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value as Event["category"])}
          >
            {isAdmin && (
              <>
                <option value="tour">Tour</option>
                <option value="workshop">Workshop</option>
              </>
            )}
            <option value="chapter_event">Chapter Event</option>
          </select>
        </Field>
        {category === "chapter_event" && (
          <Field label="Chapter">
            <select
              className={inputClass}
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
            >
              <option value="">Select chapter</option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <TextInput
          label="Ticket price (0 = free)"
          value={price}
          onChange={setPrice}
          inputClass={inputClass}
          type="number"
        />
        <Field label="Currency">
          <select
            className={inputClass}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {["EUR", "USD", "GBP", "AED"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <TextInput
          label="Title"
          value={title}
          onChange={setTitle}
          inputClass={inputClass}
        />

        <TextInput
          label="Slug"
          value={slug}
          onChange={setSlug}
          inputClass={inputClass}
          placeholder="e.g. worldos-roundtable-vienna"
        />

        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Event["status"])}
            className={inputClass}
          >
            <option value="draft" className="bg-zinc-900">
              Draft
            </option>
            <option value="scheduled" className="bg-zinc-900">
              Scheduled
            </option>
            <option value="past" className="bg-zinc-900">
              Past
            </option>
            <option value="archived" className="bg-zinc-900">
              Archived
            </option>
          </select>
        </Field>

        <TextInput
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          inputClass={inputClass}
          type="date"
        />
        <TextInput
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          inputClass={inputClass}
          type="date"
        />
        <TextInput
          label="Location"
          value={location}
          onChange={setLocation}
          inputClass={inputClass}
        />

        <Field label="Event Photo">
          {heroImageUrl && (
            <img
              src={heroImageUrl}
              alt=""
              className="mb-3 h-40 w-full rounded-lg object-cover"
            />
          )}

          <input
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
            className={inputClass}
            placeholder="Image URL or uploaded file URL"
          />

          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload event photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
          </label>
        </Field>

        <TextArea
          label="Description"
          value={description}
          onChange={setDescription}
          inputClass={inputClass}
          rows={6}
        />
        <TextInput
          label="Investment"
          value={investment}
          onChange={setInvestment}
          inputClass={inputClass}
        />
        <TextArea
          label="Participation Information"
          value={participationInfo}
          onChange={setParticipationInfo}
          inputClass={inputClass}
          rows={4}
        />
        <TextArea
          label="Past Summary"
          value={pastSummary}
          onChange={setPastSummary}
          inputClass={inputClass}
          rows={4}
        />
        <TextInput
          label="YouTube URL"
          value={youtubeUrl}
          onChange={setYoutubeUrl}
          inputClass={inputClass}
        />

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
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-5 py-2.5 font-medium text-white hover:bg-sky-400 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Event"}
        </button>
      </div>
      {event && <EventAttendees eventId={event.id} />}
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

function TextInput({
  label,
  value,
  onChange,
  inputClass,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <input
        step={type === "number" ? "0.01" : undefined}
        min={type === "number" ? 0 : undefined}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder={placeholder}
      />
    </Field>
  );
}

function TextArea({
  label,
  value,
  onChange,
  inputClass,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  rows: number;
}) {
  return (
    <Field label={label}>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} resize-none`}
      />
    </Field>
  );
}
