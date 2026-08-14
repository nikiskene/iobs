// src/components/institute/PartnerLogoStripe.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PARTNER_GROUPS, partnerRole } from '../../content/partnerRoles';

type PartnerLogo = { id:string; media_url:string; subheadline:string|null };

export default function PartnerLogoStripe() {
  const [logos, setLogos] = useState<PartnerLogo[]>([]);

  useEffect(() => {
    supabase.from('homepage_sections').select('id,media_url,subheadline')
      .like('section_key', 'partner_logo_%').eq('is_active', true)
      .not('media_url', 'is', null).order('display_order')
      .then(({ data }) => setLogos((data as PartnerLogo[]) || []));
  }, []);

  if (!logos.length) return null;

  return <section className="partner-logo-stripe" aria-label="Partners">
    <h2>Grateful for our Beautiful Partners</h2>
    <div className="partner-logo-groups">{PARTNER_GROUPS.map((group) => {
      const groupLogos = logos.filter((logo) => group.roles.includes(partnerRole(logo.subheadline)));
      if (!groupLogos.length) return null;
      return <div className="partner-logo-group" key={group.title}><h3>{group.title}</h3><div>{groupLogos.map((logo) => <img key={logo.id} src={logo.media_url} alt="" loading="lazy" decoding="async" />)}</div></div>;
    })}</div>
  </section>;
}
