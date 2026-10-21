import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
export default function ChapterMembers({ chapterId }: { chapterId: string }) {
  const [options, setOptions] = useState<{ id: string; full_name: string }[]>(
      [],
    ),
    [selected, setSelected] = useState<string[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.rpc("chapter_member_options", { cid: chapterId }),
      supabase
        .from("chapter_members")
        .select("member_id")
        .eq("chapter_id", chapterId),
    ]).then(([o, m]) => {
      if (active) {
        setOptions(o.data || []);
        setSelected((m.data || []).map((r) => r.member_id));
        setError(o.error?.message || m.error?.message || "");
      }
    });
    return () => {
      active = false;
    };
  }, [chapterId]);
  async function toggle(id: string) {
    setBusy(true);
    setError("");
    const removing = selected.includes(id);
    const r = removing
      ? await supabase
          .from("chapter_members")
          .delete()
          .eq("chapter_id", chapterId)
          .eq("member_id", id)
      : await supabase
          .from("chapter_members")
          .insert({ chapter_id: chapterId, member_id: id });
    if (r.error) setError(r.error.message);
    else
      setSelected((s) => (removing ? s.filter((x) => x !== id) : [...s, id]));
    setBusy(false);
  }
  return (
    <fieldset className="space-y-2 border-t border-white/20 pt-5">
      <legend>Associated members</legend>
      <p className="text-sm text-zinc-400">
        Chapter Heads can add members who are visible in the member directory.
        Administrators can add any member.
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="max-h-72 overflow-auto">
        {options.map((m) => (
          <label key={m.id} className="flex min-h-11 items-center gap-3">
            <input
              type="checkbox"
              disabled={busy}
              checked={selected.includes(m.id)}
              onChange={() => void toggle(m.id)}
            />
            {m.full_name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
