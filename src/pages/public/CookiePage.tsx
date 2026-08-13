// src/pages/public/CookiePage.tsx
import PolicyPage from '../../components/legal/PolicyPage';

export default function CookiePage() {
  return <PolicyPage eyebrow="Technology" title="Cookie policy">
    <section><h2>Our approach</h2><p>We currently do not use advertising cookies or third-party behavioural analytics on this website. We do not sell personal data.</p></section>
    <section><h2>Essential browser storage</h2><p>When you sign in, essential browser storage is used to keep your session secure and remember authentication state. Some forms may also store a temporary reference so an unfinished or submitted enquiry can be recognised. These functions are necessary to provide features you request.</p></section>
    <section><h2>Managing storage</h2><p>You can clear or block cookies and local storage through your browser settings. Blocking essential storage may prevent login, community, administration, or form features from working correctly.</p></section>
    <section><h2>If this changes</h2><p>If we introduce non-essential analytics, advertising, or similar tracking, we will update this notice and request consent before activating it where the law requires.</p></section>
    <section><h2>Contact</h2><p>Questions about browser storage or privacy can be sent to <a href="mailto:hello@worldos.institute">hello@worldos.institute</a>.</p></section>
  </PolicyPage>;
}
