// src/pages/admin/identity/methodPrimitives.tsx
import type { ElementType } from 'react';

type SectionProps = {
  id: string;
  icon: ElementType;
  title: string;
  children: React.ReactNode;
};

export function Section({ id, icon: Icon, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-zinc-300">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-4 border-l border-white/10 pl-5">{children}</div>
    </section>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      {children}
    </div>
  );
}
