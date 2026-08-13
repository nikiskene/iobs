// src/pages/public/PrivacyPage.tsx
import PolicyPage from '../../components/legal/PolicyPage';

export default function PrivacyPage() {
  return <PolicyPage eyebrow="Data protection" title="Privacy policy">
    <section><h2>Who is responsible</h2><p>IACy International FZCO, Dubai Airport Freezone, Dubai, United Arab Emirates, is the controller of personal data processed through this website. Contact us at <a href="mailto:worldos@iacy.com">worldos@iacy.com</a>.</p></section>
    <section><h2>Data we process</h2><ul><li>Technical information required to deliver and secure the website, such as IP address, device, browser, access time, and error logs.</li><li>Account and profile information when you register or sign in.</li><li>Information submitted through contact, nomination, entry, membership, event, expedition, or other forms.</li><li>Messages and content shared through community features.</li></ul></section>
    <section><h2>Why we process it</h2><p>We process data to provide and secure the service, respond to enquiries, administer accounts, entries and events, communicate about requested services, meet legal obligations, and pursue legitimate interests in operating and improving the Institute. Where required, we rely on consent and you may withdraw it at any time.</p></section>
    <section><h2>Service providers and transfers</h2><p>We use suppliers including Supabase for database, authentication, and storage services, and our website hosting and email providers. They process data only as needed to provide their services. Because we operate internationally, data may be processed outside your country. Where required, we use appropriate contractual or legal safeguards for international transfers.</p></section>
    <section><h2>Retention</h2><p>We keep personal data only for as long as necessary for the purpose for which it was collected, including legal, accounting, security, and dispute-resolution requirements. We then delete or anonymise it. You may request deletion, subject to mandatory retention duties.</p></section>
    <section><h2>Your rights</h2><p>Depending on the law that applies to you, including the GDPR where applicable, you may request access, correction, deletion, restriction, objection, or portability; withdraw consent; and complain to your competent data-protection authority. To exercise a right, email us. We may need to verify your identity.</p></section>
    <section><h2>Security and children</h2><p>We use organisational and technical safeguards appropriate to the nature of the data. No internet service can guarantee absolute security. Our services are not directed to children under 16, and we do not knowingly collect their data without appropriate authorisation.</p></section>
    <section><h2>Changes</h2><p>We may update this policy as the Institute and its services evolve. The current version and its update date will remain available here.</p></section>
  </PolicyPage>;
}
