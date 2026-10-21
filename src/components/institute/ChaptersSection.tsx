import { Link } from "react-router-dom";
import { usePublicChapters } from "../../hooks/usePublicChapters";
import ChapterCard from "../chapters/ChapterCard";

export default function ChaptersSection() {
  const { chapters, heads, loading, error } = usePublicChapters();
  if (loading || error || !chapters.length) return null;
  return (
    <section className="homepage-chapters" aria-labelledby="homepage-chapters-title">
      <div className="homepage-chapters-heading">
        <div><p className="home-v3-label">Our chapters</p><h2 id="homepage-chapters-title">A shared spirit. A local soul.</h2></div>
        <Link to="/chapters" className="home-v3-text-cta">Explore our chapters →</Link>
      </div>
      <div className="homepage-chapters-list">
        {chapters.map(chapter => <ChapterCard key={chapter.id} chapter={chapter} head={heads.find(head => head.chapter_id === chapter.id)} fromHome />)}
      </div>
    </section>
  );
}
