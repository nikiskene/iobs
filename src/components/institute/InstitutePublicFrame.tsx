// src/components/institute/InstitutePublicFrame.tsx
import type { PropsWithChildren } from 'react';
import InstituteShell from './InstituteShell';
import './institutePublic.css';
import InstituteFooter from './InstituteFooter';

export default function InstitutePublicFrame({ children }: PropsWithChildren) {
  return <InstituteShell><div className="ibs-public-page">{children}<InstituteFooter /></div></InstituteShell>;
}
