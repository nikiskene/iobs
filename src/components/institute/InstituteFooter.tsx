// src/components/institute/InstituteFooter.tsx
import { Link } from 'react-router-dom';
import { AWARD_ASSETS } from '../../content/awardAssets';
import { useAwardSiteContent } from '../../providers/AwardSiteContentProvider';
import { useLocale } from '../../providers/LocaleProvider';
import PartnerLogoStripe from './PartnerLogoStripe';

export default function InstituteFooter() {
  const { t } = useLocale();
  const { get } = useAwardSiteContent();
  const claim = get('site_claim');
  const columns = [
    [t('footer.award'), [[t('footer.categories'), '/categories'], [t('footer.judging'), '/judging'], [t('footer.nominate'), '/nominate'], [t('footer.enter'), '/enter']]],
    [t('footer.institute'), [[t('footer.voices'), '/voices'], [t('footer.assembly'), '/assembly'], [t('footer.experiences'), '/expeditions'], [t('footer.contact'), '/contact']]],
    [t('footer.institutional'), [[t('footer.foundingPartners'), '/partners'], [t('footer.governance'), '/judging'], [t('footer.partnerBriefing'), '/partners'], [t('footer.contact'), '/contact']]],
  ];

  return <>
    <PartnerLogoStripe />
    <footer className="award-footer">
      <div className="award-footer-inner">
        <div className="award-footer-intro"><img src={AWARD_ASSETS.twoLineDark} alt="Beautiful Success Award" />{claim?.headline && <p>{claim.headline}</p>}</div>
        <div className="award-footer-columns">{columns.map(([title, links]) => <div key={title as string}><h3>{title as string}</h3>{(links as string[][]).map(([label, href]) => <Link to={href} key={`${label}-${href}`}>{label}</Link>)}</div>)}</div>
        <div className="award-footer-base"><span>© {new Date().getFullYear()} Institute of Beautiful Success</span><span>{t('footer.edition')}</span></div>
      </div>
    </footer>
  </>;
}
