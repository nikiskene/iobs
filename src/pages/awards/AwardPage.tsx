// src/pages/awards/AwardPage.tsx
import AwardPageHero from '../../components/awards/AwardPageHero';
import { RECOGNITION_LEVELS } from '../../content/awardContent';

export default function AwardPage() {
  return (
    <main>
      <AwardPageHero eyebrow="The Beautiful Success Awards" title="Recognizing the success the world needs more of.">The Founding Edition celebrates achievements whose positive value grows through their success—from one life to beyond our world.</AwardPageHero>
      <section className="ibs-section award-copy-grid"><h2>Why another award?</h2><div><p>Because achievement alone is not enough. A beautiful success creates value without extracting it from people, society or the planet.</p><p>The Institute exists to establish a demanding, global standard for what deserves recognition.</p></div></section>
      <section className="ibs-section"><div className="award-section-title"><p className="award-label">Recognition</p><h2>One standard. Four levels.</h2></div><div className="recognition-list">{RECOGNITION_LEVELS.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    </main>
  );
}
