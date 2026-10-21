import { useLocale } from '../../providers/LocaleProvider';
import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { safeWebUrl } from "../../lib/team";
import type { PublicChapter, ChapterHead, ChapterEvent } from "../../hooks/usePublicChapters";
import "./chapterCards.css";

export default function ChapterCard({ chapter, head, events = [], fromHome = false }: {
  chapter: PublicChapter;
  head?: ChapterHead;
  events?: ChapterEvent[];
  fromHome?: boolean;
}) {
  const { locale } = useLocale();
  const { translate: tr } = useAwardSiteContent();
  const email = chapter.email.trim();
  const hasEmail = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email);
  return (
    <article id={`chapter-${chapter.id}`} className="chapter-card">
      {safeWebUrl(chapter.hero_image_url) ? (
        <img src={chapter.hero_image_url} alt={chapter.city} loading="lazy" className="chapter-card-hero" />
      ) : <div className="chapter-card-placeholder" aria-hidden="true" />}
      <div className="chapter-card-copy">
        <h3 className="chapter-card-title">
          {fromHome ? <Link to={`/chapters#chapter-${chapter.id}`}>{chapter.name}</Link> : chapter.name}
        </h3>
        {chapter.headline && <p className="chapter-card-headline">{chapter.headline}</p>}
        {chapter.description && <p className="chapter-card-description">{chapter.description}</p>}
        <div className="chapter-card-contacts">
          {head && (
            <div className="chapter-card-head">
              {safeWebUrl(head.photo_url) ? (
                <img src={head.photo_url} alt={head.full_name} loading="lazy" width={48} height={48} />
              ) : <span className="chapter-head-initial" aria-hidden="true">{head.full_name.charAt(0)}</span>}
              <p>{tr("Chapter Head")} · {head.full_name}</p>
            </div>
          )}
          {hasEmail && (
            <a className="chapter-card-email" href={`mailto:${encodeURIComponent(email)}`} aria-label={`Email the ${chapter.name} chapter`}>
              <Mail size={20} aria-hidden="true" /><span>{tr("Email chapter")}</span>
            </a>
          )}
        </div>
        {events.length > 0 && (
          <div className="chapter-card-events">
            <h4>{tr("Upcoming events")}</h4>
            {events.map(event => (
              <Link key={event.id} to={`/events/${event.slug}`}>
                <time dateTime={event.start_date}>{new Date(event.start_date + "T00:00:00").toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}</time>
                <span>{event.title} →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
