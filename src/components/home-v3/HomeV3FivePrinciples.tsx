import { HOME_V3_PRINCIPLES } from '../../content/homeV3Content';

export default function HomeV3FivePrinciples() {
  return <section className="home-v3-principles" aria-labelledby="five-principles-title">
    <header className="home-v3-section-head">
      <p className="home-v3-label">03 — THE FIVE PRINCIPLES</p>
      <h2 id="five-principles-title">WHAT MAKES SUCCESS BEAUTIFUL?</h2>
    </header>
    <div className="home-v3-principle-territories">
      {HOME_V3_PRINCIPLES.map((principle) => <article className={`tone-${principle.tone}`} key={principle.number}>
        <div><span>{principle.number}</span><h3>{principle.name}</h3></div>
        <p>{principle.question}</p>
      </article>)}
    </div>
  </section>;
}
