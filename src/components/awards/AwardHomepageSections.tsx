// src/components/awards/AwardHomepageSections.tsx
import { Link } from 'react-router-dom';
import { AWARD_TEST, RECOGNITION_LEVELS } from '../../content/awardContent';
import AwardMethodSections from './AwardMethodSections';

export default function AwardHomepageSections() {
  return (
    <>
      <section className="award-principle">
        <p className="award-label">The Beautiful Success Principle</p>
        <h2>The more successful it becomes, the better the world becomes.</h2>
        <p>Not every success deserves to be celebrated. We recognize achievements whose positive value compounds as they grow.</p>
      </section>
      <AwardMethodSections />
      <section className="award-home-section">
        <div className="award-section-title"><p className="award-label">A new social contract, measured</p><h2>Recognition begins where ordinary success metrics end.</h2></div>
        <div className="award-test-grid">{AWARD_TEST.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div>
        <Link className="award-text-link" to="/judging">Explore the judging standard →</Link>
      </section>
      <section className="award-home-section">
        <div className="award-section-title"><p className="award-label">Recognition</p><h2>Scarce by design.</h2></div>
        <div className="recognition-list">{RECOGNITION_LEVELS.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="founding-voices">
        <p className="award-label">The Beautiful Success Question</p>
        <h2>What does beautiful success mean to you?</h2>
        <p>Founding voices from business, culture, science and public life will help define what humanity should celebrate as success.</p>
        <Link className="award-button" to="/voices">Discover Founding Voices</Link>
      </section>
      <section className="award-home-section founding-edition">
        <div className="award-section-title"><p className="award-label">The Founding Edition</p><h2>One global search. Seven scales. One Grand Prix.</h2></div>
        <p>Dubai · Shenzhen · Hong Kong · Vienna · London · San Francisco · Lithuania</p>
        <div><Link className="award-button" to="/nominate">Nominate a beautiful success</Link><Link className="award-text-link" to="/partners">Become a Founding Partner →</Link></div>
      </section>
    </>
  );
}
