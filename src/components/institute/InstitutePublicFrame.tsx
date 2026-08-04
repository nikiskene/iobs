// src/components/institute/InstitutePublicFrame.tsx
import type { PropsWithChildren } from 'react';
import InstituteShell from './InstituteShell';
import './institutePublic.css';

export default function InstitutePublicFrame({ children }: PropsWithChildren) {
  return <InstituteShell><div className="ibs-public-page">{children}</div></InstituteShell>;
}
