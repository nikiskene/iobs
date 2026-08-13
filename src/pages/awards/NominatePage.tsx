// src/pages/awards/NominatePage.tsx
import { useState, type FormEvent } from 'react';
import AwardPageHero from '../../components/awards/AwardPageHero';
import { AWARD_CATEGORIES } from '../../content/awardContent';

export default function NominatePage() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Beautiful Success nomination: ${data.get('name')}`);
    const body = encodeURIComponent(`Category: ${data.get('category')}\nNominee: ${data.get('name')}\nWhy beautiful: ${data.get('why')}\nEvidence: ${data.get('link')}\nNominator: ${data.get('email')}`);
    window.location.href = `mailto:worldos@iacy.com?subject=${subject}&body=${body}`;
    setSent(true);
  }
  return (
    <main>
      <AwardPageHero eyebrow="Free global nominations" title="What deserves to be celebrated?">Nominate a person, team, company, country or achievement whose success makes the world better.</AwardPageHero>
      <section className="ibs-section nomination-layout"><div><h2>The founding search is open.</h2><p>Nominations are free. We may invite nominated work to complete a verified submission for the Founding Edition.</p></div><form className="award-form" onSubmit={submit}><label>Scale<select name="category" required>{AWARD_CATEGORIES.map((item) => <option key={item.slug}>{item.name}</option>)}</select></label><label>Who or what?<input name="name" required /></label><label>Why is this success beautiful?<textarea name="why" required rows={5} /></label><label>Evidence or supporting link<input name="link" type="url" /></label><label>Your email<input name="email" type="email" required /></label><button className="award-button" type="submit">Prepare nomination</button>{sent && <p>Your email application has opened with the nomination prepared.</p>}</form></section>
    </main>
  );
}
