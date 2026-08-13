// src/components/awards/AwardMethodSections.tsx
const DIMENSIONS = [
  ['Identity', 'Who are we becoming?'],
  ['Choices', 'What do we choose to do with what we have?'],
  ['Speed', 'How fast do we pursue it - and at what cost?'],
];

const SHIFTS = [
  ['Self-actualization', 'Legacy'],
  ['Esteem', 'Momentum'],
  ['Belonging', 'Echo'],
  ['Safety', 'New focus'],
  ['Basic needs', 'Philanthropy'],
];

export default function AwardMethodSections() {
  return (
    <>
      <section className="award-home-section award-method">
        <div className="award-section-title"><p className="award-label">What does beautiful success mean?</p><h2>Success is shaped before it is measured.</h2></div>
        <p className="award-lead">Beautiful success is the underlying principle of a new Operating System of the World.</p>
        <div className="award-dimensions">{DIMENSIONS.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <p className="award-formula">WorldOS = Identity × Choices × Speed</p>
      </section>
      <section className="award-home-section award-shift">
        <div className="award-section-title"><p className="award-label">From need to offer</p><h2>What happens beyond needs?</h2></div>
        <p className="award-lead">Beautiful success scales individual needs into collective growth - from what we require to what we can offer.</p>
        <div className="award-shift-list">{SHIFTS.map(([need, offer]) => <p key={need}><span>{need}</span><b>→</b><strong>{offer}</strong></p>)}</div>
      </section>
    </>
  );
}
