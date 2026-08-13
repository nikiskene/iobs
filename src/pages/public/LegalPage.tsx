// src/pages/public/LegalPage.tsx
import PolicyPage from '../../components/legal/PolicyPage';

export default function LegalPage() {
  return <PolicyPage eyebrow="Legal notice" title="Imprint">
    <section><h2>Website operator</h2><p>IACy International FZCO<br />Private Freezone Limited Liability Company<br />Dubai Airport Freezone<br />Dubai, United Arab Emirates</p></section>
    <section><h2>Registration</h2><p>Service Licence No. 05573<br />Issuing authority: Dubai Integrated Economic Zones Authority (DIEZA)<br />Company manager: Nikolaus Skene</p></section>
    <section><h2>Contact</h2><p>Email: <a href="mailto:worldos@iacy.com">worldos@iacy.com</a></p><p>The Institute of Beautiful Success and the Beautiful Success Award are initiatives operated by IACy International FZCO.</p></section>
    <section><h2>Responsible for content</h2><p>IACy International FZCO, represented by its company manager, at the address stated above.</p></section>
    <section><h2>Liability and copyright</h2><p>We prepare this website with care, but do not warrant that all information is complete, accurate, or continuously available. Linked third-party websites remain the responsibility of their operators.</p><p>Unless otherwise stated, the content, design, text, and visual materials on this website are protected by intellectual-property law. Reproduction or commercial use requires prior written permission.</p></section>
  </PolicyPage>;
}
