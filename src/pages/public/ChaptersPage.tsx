import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePublicChapters } from "../../hooks/usePublicChapters";
import ChapterCard from "../../components/chapters/ChapterCard";

export default function ChaptersPage() {
  const { translate: tr } = useAwardSiteContent();
  const { chapters, heads, events, loading, error } = usePublicChapters(true);
  const { hash } = useLocation();
  useEffect(() => {
    if (!loading && !error && hash.startsWith("#chapter-")) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
    }
  }, [hash, chapters, loading, error]);
  const continents = [...new Set(chapters.map((c) => c.continent))].sort();
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 pb-24 pt-28 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[.25em] text-amber-400">{tr("Institute of Beautiful Success")}</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">{tr("Chapters")}</h1>
        {loading && (
          <p role="status" className="mt-8">{tr("Loading chapters…")}</p>
        )}
        {error && (
          <p role="alert" className="mt-8">{tr("We couldn’t load chapters. Please try again shortly.")}</p>
        )}
        {!loading && !error && !chapters.length && (
          <p className="mt-8">{tr("Our chapters will be announced here shortly.")}</p>
        )}
        {continents.map((continent) => (
          <section key={continent} className="mt-16">
            <h2 className="mb-6 border-b border-white/20 pb-4 text-xl uppercase tracking-widest">
              {continent}
            </h2>
            <div className="space-y-8">
              {chapters
                .filter((c) => c.continent === continent)
                .map((c) => (
                  <ChapterCard
                    key={c.id}
                    chapter={c}
                    head={heads.find(h => h.chapter_id === c.id)}
                    events={events.filter(e => e.chapter_id === c.id)}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
