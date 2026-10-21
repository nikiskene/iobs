import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useChapterAccess } from "../../hooks/useChapterAccess";
import ChaptersAdmin from "../admin/ChaptersAdmin";
import EventsAdmin from "../admin/events/EventsAdmin";
export default function ChapterOffice() {
  const { user, loading } = useAuth();
  const access = useChapterAccess();
  const [tab, setTab] = useState("chapters");
  if (loading || access.loading)
    return (
      <p className="pt-28 px-6" role="status">
        Loading your chapters…
      </p>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (!access.hasChapterAccess) return <Navigate to="/dashboard" replace />;
  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-28 text-white">
      <h1 className="text-3xl">My chapter</h1>
      <nav aria-label="Chapter management" className="my-6 flex gap-3">
        {["chapters", "events"].map((t) => (
          <button
            key={t}
            aria-pressed={tab === t}
            className="min-h-11 rounded border border-white/30 px-5 capitalize"
            onClick={() => setTab(t)}
          >
            {t === "chapters" ? "Chapters" : "Events"}
          </button>
        ))}
      </nav>
      {tab === "chapters" ? <ChaptersAdmin /> : <EventsAdmin />}
    </main>
  );
}
