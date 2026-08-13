// src/components/institute/PartnerLogoStripe.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type PartnerLogo = { id: string; media_url: string };

export default function PartnerLogoStripe() {
  const [logos, setLogos] = useState<PartnerLogo[]>([]);

  useEffect(() => {
    supabase.from('homepage_sections').select('id,media_url')
      .like('section_key', 'partner_logo_%').eq('is_active', true)
      .not('media_url', 'is', null).order('display_order')
      .then(({ data }) => setLogos((data as PartnerLogo[]) || []));
  }, []);

  if (!logos.length) return null;

  return <section className="partner-logo-stripe" aria-label="Partners">
    <div>{logos.map((logo) => <img key={logo.id} src={logo.media_url} alt="" loading="lazy" decoding="async" />)}</div>
  </section>;
}
