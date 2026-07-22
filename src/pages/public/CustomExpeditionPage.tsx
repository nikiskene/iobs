import Hero from '../../components/customExpedition/Hero';
import IncludedCard from '../../components/customExpedition/IncludedCard';
import InquiryForm from '../../components/customExpedition/InquiryForm';

export default function CustomExpeditionPage() {
  return (
    <main className="bg-[#0A0A0A] pt-16 text-white">
      <Hero />
      <IncludedCard />
      <InquiryForm />
    </main>
  );
}