import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import ChapterImageUpload from "../../components/chapters/ChapterImageUpload";
import ChapterMembers from "./ChapterMembers";
import { supabase } from "../../lib/supabase";
import CityAutocomplete from "../../components/location/CityAutocomplete";
import type { CityResult } from "../../lib/mapbox";

type Chapter = {
  id: string;
  name: string;
  city: string;
  country: string;
  continent: string;
  latitude: number;
  longitude: number;
  email: string;
  headline: string;
  hero_image_url: string;
  head_member_id: string | null;
  status: string;
};
type Member = { id: string; full_name: string };
const blank = (): Chapter => ({
  id: "",
  name: "",
  city: "",
  country: "",
  continent: "Europe",
  latitude: 0,
  longitude: 0,
  email: "",
  headline: "",
  hero_image_url: "",
  head_member_id: null,
  status: "draft",
});
const continents = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
];
export default function ChaptersAdmin() {
  const { isAdmin, profile } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]),
    [members, setMembers] = useState<Member[]>([]),
    [editing, setEditing] = useState<Chapter | null>(null),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false),
    [uploading, setUploading] = useState(false);
  const load = useCallback(async () => {
    const [c, m] = await Promise.all([
      supabase.rpc("my_managed_chapters"),
      isAdmin
        ? supabase.rpc("admin_list_members")
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (c.error) setError(c.error.message);
    else setChapters(c.data || []);
    if (!m.error)
      setMembers(
        (m.data || []).filter((x: { accounts?: { is_active: boolean }[] }) =>
          x.accounts?.some((a) => a.is_active),
        ) as Member[],
      );
  }, [isAdmin]);
  useEffect(() => {
    void load();
  }, [load]);
  async function save() {
    if (!editing || uploading) return;
    setError("");
    if (
      !editing.name.trim() ||
      !editing.city ||
      !Number.isFinite(editing.latitude) ||
      !Number.isFinite(editing.longitude)
    ) {
      setError("Name and a selected geocoded city are required.");
      return;
    }
    setSaving(true);
    const { id, ...payload } = editing;
    const result = !isAdmin
      ? await supabase.rpc("chapter_update_details", {
          cid: id,
          details: {
            email: payload.email,
            headline: payload.headline,
            hero_image_url: payload.hero_image_url,
          },
        })
      : id
        ? await supabase
            .from("chapters")
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq("id", id)
        : await supabase.from("chapters").insert(payload);
    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setEditing(null);
    void load();
  }
  async function remove(chapter: Chapter) {
    if (
      !window.confirm(
        "Delete " +
          chapter.name +
          "? Existing chapter events may prevent deletion.",
      )
    )
      return;
    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", chapter.id);
    if (error) setError(error.message);
    else void load();
  }
  const input =
    "w-full min-h-11 rounded-lg border border-white/20 bg-zinc-900 px-3 py-2 text-white";
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-1 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Chapters</h1>
        {isAdmin && (
          <button
            disabled={saving || uploading}
            className="rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black"
            onClick={() => {
              setError("");
              setEditing(blank());
            }}
          >
            New chapter
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-950 p-3 text-red-200">
          {error}
        </p>
      )}
      {editing ? (
        <div className="space-y-5 rounded-xl border border-white/15 p-4 sm:p-6">
          <fieldset disabled={!isAdmin} className="space-y-5">
            <label className="block">
              Chapter name
              <input
                className={input}
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />
            </label>
            <CityAutocomplete
              value={editing.city}
              onSelect={(city: CityResult) =>
                setEditing({
                  ...editing,
                  city: city.city,
                  latitude: city.lat,
                  longitude: city.lng,
                  country: city.label.split(",").slice(-1)[0].trim(),
                })
              }
              onClear={() =>
                setEditing({ ...editing, city: "", latitude: 0, longitude: 0 })
              }
            />
            <p className="text-sm text-zinc-400">
              {editing.country} · {editing.latitude}, {editing.longitude}
            </p>
            <label className="block">
              Continent
              <select
                className={input}
                value={editing.continent}
                onChange={(e) =>
                  setEditing({ ...editing, continent: e.target.value })
                }
              >
                {continents.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              Chapter Head
              <select
                className={input}
                value={editing.head_member_id || ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    head_member_id: e.target.value || null,
                  })
                }
              >
                <option value="">Unassigned</option>
                {!isAdmin && editing.head_member_id && (
                  <option value={editing.head_member_id}>
                    {profile?.full_name}
                  </option>
                )}
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>
          {(["email", "headline"] as const).map((k) => (
            <label key={k} className="block capitalize">
              {k.replace(/_/g, " ")}
              <input
                className={input}
                value={editing[k]}
                onChange={(e) =>
                  setEditing({ ...editing, [k]: e.target.value })
                }
              />
            </label>
          ))}
          <ChapterImageUpload
            disabled={saving}
            key={editing.id}
            chapterId={editing.id}
            imageUrl={editing.hero_image_url}
            onBusyChange={setUploading}
            onChange={(url) =>
              setEditing((current) =>
                current?.id === editing.id
                  ? { ...current, hero_image_url: url }
                  : current,
              )
            }
          />
          <label className="block">
            Status
            <select
              disabled={!isAdmin}
              className={input}
              value={editing.status}
              onChange={(e) =>
                setEditing({ ...editing, status: e.target.value })
              }
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </label>
          {editing.id && <ChapterMembers chapterId={editing.id} />}
          <div className="flex flex-wrap gap-3">
            <button
              disabled={saving || uploading}
              onClick={save}
              className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-black disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save chapter"}
            </button>
            <button
              disabled={saving || uploading}
              onClick={() => setEditing(null)}
              className="rounded-lg border border-white/20 px-6 py-3"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((c) => (
            <article
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 p-4"
            >
              <div>
                <h2 className="text-lg font-semibold">{c.name}</h2>
                <p className="text-sm text-zinc-400">
                  {c.city} · {c.continent} · {c.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(c)}
                  className="rounded-lg border border-white/20 px-4 py-3"
                >
                  Edit
                </button>
                {isAdmin && (
                  <button
                    onClick={() => void remove(c)}
                    className="rounded-lg border border-red-800 px-4 py-3 text-red-300"
                  >
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))}
          {!chapters.length && (
            <p className="text-zinc-400">No chapters yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
