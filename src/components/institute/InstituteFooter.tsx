// src/components/institute/InstituteFooter.tsx
import { Link } from 'react-router-dom';

const COLUMNS = [
  ['The Award', [['Categories', '/categories'], ['Judging', '/judging'], ['Nominate', '/nominate'], ['Enter', '/enter']]],
  ['The Institute', [['Founding Voices', '/voices'], ['Assembly', '/assembly'], ['Experiences', '/expeditions'], ['Contact', '/contact']]],
  ['Institutional', [['Founding Partners', '/partners'], ['Governance', '/judging'], ['Partner Briefing', '/partners'], ['Press', '/contact']]],
];

export default function InstituteFooter() {
  return (
    <footer className="award-footer">
      <div className="award-footer-intro"><h2>Institute of Beautiful Success</h2><p>Recognizing achievements whose positive value grows through their success.</p></div>
      <div className="award-footer-columns">{COLUMNS.map(([title, links]) => <div key={title as string}><h3>{title as string}</h3>{(links as string[][]).map(([label, href]) => <Link to={href} key={label}>{label}</Link>)}</div>)}</div>
      <div className="award-footer-base"><span>© {new Date().getFullYear()} Institute of Beautiful Success</span><span>Founding Edition</span></div>
    </footer>
  );
}
