import {
  CUSTOM_EXPEDITION_HERO_IMAGE,
} from './constants';

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="absolute inset-0">
        <img
          src={CUSTOM_EXPEDITION_HERO_IMAGE}
          alt="Custom Expedition"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(56,189,248,0.18),transparent_45%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[70vh] max-w-7xl items-center px-6 py-24">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300/80">
            Custom Expedition
          </p>

          <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Build the expedition your organization actually needs.
          </h1>

          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-zinc-300">
            Every expedition starts with a decision your organization has to
            make. We then curate the founders, researchers, companies and
            conversations that help you make that decision with confidence.
          </p>
        </div>
      </div>
    </section>
  );
}