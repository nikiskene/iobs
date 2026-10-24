import { AWARD_ASSETS } from '../content/awardAssets';
import './instituteLogo.css';

const INSTITUTE_LOGOS = {
  negative: 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/logo/IOBS%20Complete%20Logo%20neg.png',
  positive: 'https://bunfdlazirfheomhvjdz.supabase.co/storage/v1/object/public/homepage-media/logo/IOBS%20Complete%20Logo.png',
};

/** Keep the artwork's intrinsic proportions; theme follows its actual surface. */
export default function InstituteLogo({ tone = 'negative', compactOnMobile = false, footer = false }: {
  tone?: keyof typeof INSTITUTE_LOGOS;
  compactOnMobile?: boolean;
  footer?: boolean;
}) {
  return <picture className={`institute-brand${compactOnMobile ? ' institute-brand-responsive' : ''}`}>
    {compactOnMobile && <source media="(max-width: 479px)" srcSet={tone === 'negative' ? AWARD_ASSETS.circleDark : AWARD_ASSETS.circleLight} />}
    <img src={INSTITUTE_LOGOS[tone]} alt="Institute of Beautiful Success" width={tone === 'negative' ? 1739 : 1726} height={tone === 'negative' ? 471 : 472} loading={footer ? 'lazy' : 'eager'} decoding="async" />
  </picture>;
}
