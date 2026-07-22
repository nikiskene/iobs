import { Sparkles } from 'lucide-react';

export default function IncludedCard() {
  return (
    <section className="border-b border-white/5 px-6 py-20">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">
            How it works
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Not a tour. A curated field study.
          </h2>

          <p className="mt-6 max-w-xl leading-relaxed text-zinc-400">
            We design the expedition around your strategic question, your
            industry, your delegation and the ecosystem that can give you the
            strongest signal.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
            <Sparkles className="h-6 w-6" />
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold">Included</h3>

              <div className="mt-5 space-y-3 text-zinc-300">
                <p>Program curation</p>
                <p>Speaker and expert fees</p>
                <p>Transport during the expedition</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold">Excluded</h3>

              <div className="mt-5 space-y-3 text-zinc-500">
                <p>Travel to the destination</p>
                <p>Accommodation</p>
                <p>Meals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}