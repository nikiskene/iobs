// src/components/mobile/MobileLauncherTile.tsx
import type { ElementType } from 'react';
import { Link } from 'react-router-dom';

export type MobileLauncherTile = {
  to: string;
  label: string;
  description: string;
  icon: ElementType;
  image?: string | null;
  highlight?: boolean;
};

export default function LauncherTile({ item }: { item: MobileLauncherTile }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className={`group relative overflow-hidden rounded-[1.25rem] border p-4 transition active:scale-95 ${
        item.highlight
          ? 'min-h-[104px] border-sky-400/30 bg-sky-500/15'
          : 'min-h-[104px] border-white/10 bg-white/[0.04]'
      }`}
    >
      {item.image ? (
        <>
          <img
            src={item.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(56,189,248,0.16),transparent_45%)]" />
      )}

      <div className="relative flex h-full min-h-[72px] flex-col justify-between">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${
            item.highlight ? 'bg-sky-500 text-white' : 'bg-white/12 text-sky-300'
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-base font-bold leading-tight">{item.label}</h2>
          <p className="mt-0.5 text-xs text-zinc-300">{item.description}</p>
        </div>
      </div>
    </Link>
  );
}
