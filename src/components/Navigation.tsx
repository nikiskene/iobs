import InstituteHeader from './institute/InstituteHeader';
import { LocaleProvider } from '../providers/LocaleProvider';
import './institute/instituteHome.css';
import './workspaceHeader.css';

// Protected and legacy subsection routes share the public site's header.
export default function Navigation() {
  return <LocaleProvider>
    <div className="iobs-workspace-header">
      <div className="iobs-workspace-header-inner"><InstituteHeader /></div>
    </div>
  </LocaleProvider>;
}
