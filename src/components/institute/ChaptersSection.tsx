import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePublicChapters } from '../../hooks/usePublicChapters';
import { optimizedImageUrl } from '../../lib/media';
import { safeWebUrl } from '../../lib/team';
import './homepageChapters.css';

export default function ChaptersSection() {
  const { chapters, loading, error } = usePublicChapters();
  if (loading || error || !chapters.length) return null;
  return (
    <section className="homepage-chapters" aria-labelledby="homepage-chapters-title">
      <div className="homepage-chapters-heading">
        <div><p className="home-v3-label">Our chapters</p><h2 id="homepage-chapters-title">A shared spirit. A local soul.</h2></div>
        <Link to="/chapters" className="home-v3-text-cta">Explore our chapters →</Link>
      </div>
      <div className="homepage-chapters-grid">
        {chapters.map(chapter => (
          <article className="homepage-chapter-tile" key={chapter.id}>
            <Link to={`/chapters#chapter-${chapter.id}`} aria-label={`More about the ${chapter.city} chapter`}>
              {safeWebUrl(chapter.hero_image_url) && <img
                src={optimizedImageUrl(chapter.hero_image_url, 640, 78)}
                srcSet={[320, 640, 960].map(width => `${optimizedImageUrl(chapter.hero_image_url, width, 78)} ${width}w`).join(', ')}
                sizes="(max-width: 599px) 48vw, (max-width: 1023px) 32vw, 20vw"
                alt="" width={640} height={720} loading="lazy" decoding="async"
              />}
              <div className="homepage-chapter-copy">
                <h3>{chapter.city}</h3>
                {chapter.headline && <p>{chapter.headline}</p>}
                <span className="homepage-chapter-more">More <ArrowUpRight size={15} aria-hidden="true" /></span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
