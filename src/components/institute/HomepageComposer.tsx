// src/components/institute/HomepageComposer.tsx

import EntranceHero from './EntranceHero';

export default function HomepageComposer() {
  return (
    <>
      <EntranceHero />
      <section className="method-preview" id="method">
        <p className="section-index">The Institute · 01</p>
        <div>
          <p className="section-kicker">A method for beautiful success</p>
          <h2>Identity becomes choice.<br />Choice becomes a world.</h2>
        </div>
        <p className="method-copy">
          worldOS is the Institute’s method for turning imagination into lived
          reality—from one life to the systems shaping us all.
        </p>
      </section>
    </>
  );
}
