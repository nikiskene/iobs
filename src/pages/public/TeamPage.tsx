import { useEffect, useState } from 'react';
import { Linkedin, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TEAM_CATEGORIES, safeWebUrl, type TeamPerson } from '../../lib/team';
import AwardPageHero from '../../components/awards/AwardPageHero';
import './team.css';

export default function TeamPage() {
  const [members, setMembers] = useState<TeamPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await supabase.from('team_people')
          .select('id,full_name,category,status,title,description,photo_url,linkedin_url,substack_url,sort_order')
          .eq('status', 'published').order('sort_order').order('full_name');
        if (!active) return;
        setError(!!result.error);
        setMembers(result.data || []);
      } catch { if (active) setError(true); }
      finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, []);

  return <main>
    <AwardPageHero eyebrow="The Institute" title="The people behind IOBS">
      The founders, team, supporters and advisers shaping the Institute of Beautiful Success.
    </AwardPageHero>
    <div className="ibs-section team-directory">
      {loading ? <p role="status">Loading the people behind IOBS…</p> : error ?
        <p role="alert">We couldn’t load the team. Please try again shortly.</p> :
        TEAM_CATEGORIES.map(([category, label]) => {
          const people = members.filter((member) => member.category === category);
          return <section className="team-category" key={category} aria-labelledby={`team-${category}`}>
            <h2 id={`team-${category}`}>{label}</h2>
            {people.length === 0 ? <p className="team-empty">To be announced.</p> :
              <div className="team-grid">{people.map((person) => <article className="team-person" key={person.id}>
                <div className="team-portrait">
                  {safeWebUrl(person.photo_url) ? <img src={person.photo_url} alt={person.full_name} loading="lazy" /> :
                    <span aria-hidden="true">{person.full_name.charAt(0).toUpperCase()}</span>}
                </div>
                <h3>{person.full_name}</h3>
                {person.title && <p className="team-title">{person.title}</p>}
                {person.description && <p className="team-description">{person.description}</p>}
                <div className="team-socials">
                  {safeWebUrl(person.linkedin_url) && <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" aria-label={`${person.full_name} on LinkedIn`}><Linkedin size={16} />LinkedIn</a>}
                  {safeWebUrl(person.substack_url) && <a href={person.substack_url} target="_blank" rel="noopener noreferrer" aria-label={`${person.full_name} on Substack`}><BookOpen size={16} />Substack</a>}
                </div>
              </article>)}</div>}
          </section>;
        })}
    </div>
  </main>;
}
