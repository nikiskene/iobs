import { useLocale } from '../../providers/LocaleProvider';
import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { localizeCmsRecord } from '../../content/localizedCms';
// src/components/experiences/ExperienceCard.tsx
import { CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Event, Expedition } from '../../lib/types';

type Props = { event?: Event; expedition?: Expedition; past?: boolean };

export default function ExperienceCard({ event: rawEvent, expedition: rawExpedition, past = false }: Props) {
  const { locale } = useLocale();
  const { translate: tr } = useAwardSiteContent();
  const event = localizeCmsRecord(rawEvent, tr);
  const expedition = localizeCmsRecord(rawExpedition, tr);
  const item = event ?? expedition;
  if (!item) return null;
  const href = event ? `/events/${event.slug}` : `/expeditions/${expedition?.slug}`;
  const description = event ? (past ? event.past_summary : event.description) : expedition?.short_description;

  return (
    <Link className="ibs-experience-card" to={href}>
      <div className="ibs-card-image">
        {item.hero_image_url && <img src={item.hero_image_url} alt={item.title} />}
      </div>
      <div className="ibs-card-copy">
        <div className="ibs-card-meta">
          {item.start_date && <span><CalendarDays size={14} />{formatDate(item.start_date, item.end_date, locale)}</span>}
          {item.location && <span><MapPin size={14} />{item.location}</span>}
        </div>
        <h3>{item.title}</h3>
        {description && <p>{description}</p>}
        {'price' in item && item.price && <strong>{item.price}</strong>}
        <span className="ibs-card-action">{tr(event ? (past ? 'View the story' : 'View event / RSVP') : 'Explore expedition')} →</span>
      </div>
    </Link>
  );
}

export function CustomExpeditionCard() {
  const { translate: tr } = useAwardSiteContent();
  return (
    <Link className="ibs-experience-card" to="/expeditions/custom">
      <div className="ibs-card-image"><img src="https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/expedition-media/IMG_2923.JPG" alt="Custom Expedition" /></div>
      <div className="ibs-card-copy">
        <div className="ibs-card-meta"><span><MapPin size={14} />{tr("Designed around your question")}</span></div>
        <h3>{tr("Build your own expedition.")}</h3>
        <p>{tr("A curated field study for companies, governments and institutions that need to understand what is changing before it becomes obvious.")}</p>
        <span className="ibs-card-action">{tr("Design an expedition →")}</span>
      </div>
    </Link>
  );
}

function formatDate(start: string, end: string | null | undefined, locale: string) {
  const first = new Date(start).toLocaleDateString(locale);
  return end ? `${first} — ${new Date(end).toLocaleDateString(locale)}` : first;
}
