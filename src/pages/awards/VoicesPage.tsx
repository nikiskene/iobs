// src/pages/awards/VoicesPage.tsx
import AwardPageHero from '../../components/awards/AwardPageHero';

const QUESTIONS = ['Beautiful success is…', 'A success I consider beautiful is…', 'We need to stop celebrating…', 'We should begin celebrating…'];

export default function VoicesPage() {
  return (
    <main>
      <AwardPageHero eyebrow="Founding Voices" title="What does beautiful success mean to you?">A growing global archive of leaders, builders, artists and citizens defining what humanity should celebrate as success.</AwardPageHero>
      <section className="ibs-section voice-prompts"><div><p className="award-label">The Beautiful Success Question</p><h2>Four prompts. One defining conversation.</h2></div><ol>{QUESTIONS.map((question, index) => <li key={question}><span>0{index + 1}</span>{question}</li>)}</ol></section>
      <section className="ibs-section award-cta"><h2>Founding voices will be announced here.</h2><p>Contributions are invitation-led during the founding phase.</p><a className="award-button" href="mailto:hello@worldos.institute?subject=Founding%20Voices">Contribute a perspective</a></section>
    </main>
  );
}
