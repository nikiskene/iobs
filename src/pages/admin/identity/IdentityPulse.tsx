// src/pages/admin/identity/IdentityPulse.tsx
import type { DailyScanSignal } from '../../../lib/identity/identityApi';

export function IdentityPulse({ signals, date }: { signals: DailyScanSignal[]; date: string }) {
  const what = signals.filter((signal) => signal.final_classification === 'what').length;
  const how = signals.filter((signal) => signal.final_classification === 'how').length;
  const context = signals.length - what - how;
  const total = Math.max(signals.length, 1);
  const whatDegrees = (what / total) * 360;
  const howDegrees = whatDegrees + (how / total) * 360;
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_75%_25%,rgba(14,165,233,0.13),transparent_35%),linear-gradient(135deg,#111,rgba(10,10,10,0.95))] p-6 sm:p-8 lg:p-10">
      <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sky-400">WorldOS identity observatory · {date}</p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">What is the world becoming?</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">A daily reading of institutional self-definition—separating who organizations say they are from how they operate and what merely happened.</p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-wider text-zinc-500"><Key color="bg-sky-400" label={`${what} identity`} /><Key color="bg-violet-400" label={`${how} operating`} /><Key color="bg-zinc-600" label={`${context} context`} /></div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[19rem]">
          <div className="absolute inset-0 animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-sky-400/20" />
          <div className="absolute inset-[12%] rounded-full p-[1px]" style={{ background: `conic-gradient(#38bdf8 0deg ${whatDegrees}deg,#a78bfa ${whatDegrees}deg ${howDegrees}deg,#3f3f46 ${howDegrees}deg 360deg)` }}><div className="flex h-full w-full items-center justify-center rounded-full bg-[#0d0d0e]"><div className="text-center"><p className="font-serif text-6xl text-white">{signals.length}</p><p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-zinc-500">reviewed signals</p></div></div></div>
          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-sky-300 shadow-[0_0_18px_4px_rgba(56,189,248,0.55)]" />
        </div>
      </div>
    </section>
  );
}

function Key({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${color}`} />{label}</span>;
}
