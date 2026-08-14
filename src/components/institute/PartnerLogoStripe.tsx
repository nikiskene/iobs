// src/components/institute/PartnerLogoStripe.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PARTNER_GROUPS, partnerRole } from '../../content/partnerRoles';
import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { useLocale, type Locale } from '../../providers/LocaleProvider';

type PartnerLogo = { id:string; media_url:string; subheadline:string|null };
const GROUP_LABELS: Record<Locale,string[]> = {
  en:['Founding Partners','Partners','Patrons'],de:['Founding Partner','Partner','Patrons'],fr:['Partenaires fondateurs','Partenaires','Mécènes'],ar:['الشركاء المؤسسون','الشركاء','الداعمون'],zh:['创始合作伙伴','合作伙伴','赞助人'],es:['Socios fundadores','Socios','Mecenas'],
};

export default function PartnerLogoStripe() {
  const [logos, setLogos] = useState<PartnerLogo[]>([]);
  const { get } = useAwardSiteContent();
  const { locale, t } = useLocale();
  const intro = get('partners_intro');

  useEffect(() => {
    supabase.from('homepage_sections').select('id,media_url,subheadline')
      .like('section_key', 'partner_logo_%').eq('is_active', true)
      .not('media_url', 'is', null).order('display_order')
      .then(({ data }) => setLogos((data as PartnerLogo[]) || []));
  }, []);

  if (!logos.length) return null;

  return <section className="partner-logo-stripe" aria-label={t('partners.aria')}>
    <h2>{intro?.headline || 'Grateful for our Beautiful Partners'}</h2>
    <div className="partner-logo-groups">{PARTNER_GROUPS.map((group,index) => {
      const groupLogos = logos.filter((logo) => group.roles.includes(partnerRole(logo.subheadline)));
      if (!groupLogos.length) return null;
      return <div className="partner-logo-group" key={group.title}><h3>{GROUP_LABELS[locale][index]}</h3><div>{groupLogos.map((logo) => <img key={logo.id} src={logo.media_url} alt="" loading="lazy" decoding="async" />)}</div></div>;
    })}</div>
  </section>;
}
