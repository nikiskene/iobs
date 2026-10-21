import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
export default function AboutPage() {
  const { translate: tr } = useAwardSiteContent();
  return (
    <main className="ibs-about">
      <section className="ibs-page-hero ibs-about-hero">
        <p className="ibs-eyebrow">{tr("01 — The Institute")}</p>
        <div>
          <h1>{tr("Changing what the world celebrates.")}</h1>
          <p>{tr("The Institute of Beautiful Success discovers, defines and celebrates achievements whose positive value grows with their success.")}</p>
        </div>
      </section>
      <section className="ibs-section ibs-about-principle">
        <p className="ibs-eyebrow">{tr("02 — The Principle")}</p>
        <div>
          <h2>{tr("The more successful it becomes,")} <em>{tr("the better the world becomes.")}</em></h2>
          <p>{tr("For humans. For non-humans. For society. For the planet. For what comes after us.")}</p>
        </div>
      </section>
      <section className="ibs-section">
        <div className="ibs-section-head">
          <div><p className="ibs-eyebrow">{tr("03 — What we build")}</p><h2>{tr("Not an event. An institution.")}</h2></div>
          <p>{tr("An operating system for discovering and multiplying Beautiful Success—through recognition, evidence, stories and practical application.")}</p>
        </div>
        <div className="ibs-about-grid">
          <article><span>01</span><h3>{tr("The Award")}</h3><p>{tr("A global stage for achievements whose consequences deserve to be seen and multiplied.")}</p></article>
          <article><span>02</span><h3>{tr("The Principles")}</h3><p>{tr("Five questions that reveal whether success gives, creates, influences, mobilizes and outlasts.")}</p></article>
          <article><span>03</span><h3>{tr("The Scale of Impact")}</h3><p>{tr("A way to understand how far success reaches—from one person to beyond our world.")}</p></article>
          <article><span>04</span><h3>{tr("Cases & Application")}</h3><p>{tr("Stories, research and tools that translate a new definition of success into everyday decisions.")}</p></article>
        </div>
      </section>
      <section className="ibs-section ibs-about-closing">
        <p className="ibs-eyebrow">{tr("04 — The invitation")}</p>
        <h2>{tr("If you could build anything in the world…")} <em>{tr("what would you build?")}</em></h2>
      </section>
    </main>
  );
}
