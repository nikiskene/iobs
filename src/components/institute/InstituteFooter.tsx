// src/components/institute/InstituteFooter.tsx
import { Link } from 'react-router-dom';
import { AWARD_ASSETS, optimizedAwardAsset } from '../../content/awardAssets';
import PartnerLogoStripe from './PartnerLogoStripe';

const COLUMNS = [
  ['The Award', [['Categories', '/categories'], ['Judging', '/judging'], ['Nominate', '/nominate'], ['Enter', '/enter']]],
  ['The Institute', [['Founding Voices', '/voices'], ['Assembly', '/assembly'], ['Experiences', '/expeditions'], ['Contact', '/contact']]],
  ['Institutional', [['Founding Partners', '/partners'], ['Governance', '/judging'], ['Partner Briefing', '/partners'], ['Contact', '/contact'], ['Login', '/login']]],
  ['Legal', [['Imprint', '/legal'], ['Privacy', '/privacy'], ['Cookies', '/cookies'], ['Terms', '/terms']]],
];

export default function InstituteFooter() {
  return (
    <><PartnerLogoStripe /><footer className="award-footer">
      <div className="award-footer-intro"><img src={optimizedAwardAsset(AWARD_ASSETS.twoLineDark, 600)} alt="Beautiful Success Award" loading="lazy" decoding="async" /><p>Celebrating Beautiful Success globally.</p></div>
      <div className="award-footer-columns">{COLUMNS.map(([title, links]) => <div key={title as string}><h3>{title as string}</h3>{(links as string[][]).map(([label, href]) => <Link to={href} key={label}>{label}</Link>)}</div>)}</div>
      <div className="award-footer-base"><span>© {new Date().getFullYear()} Institute of Beautiful Success</span><span>Founding Edition</span></div>
    </footer></>
  );
}
