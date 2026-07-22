import { Globe, Target, Eye, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-[#0A0A0A] text-white pt-16">
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About WorldOS</h1>
          <p className="mt-6 text-xl text-zinc-400 leading-relaxed">
            WorldOS is a public platform designed to help governments, institutions, and individuals
            start conversations about systems that no longer fit the world they are supposed to serve.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="flex gap-6">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Our Mission</h2>
              <p className="mt-3 text-zinc-400 leading-relaxed">
                We believe the most important step in changing any system is having the courage to
                question it. WorldOS exists to make that step possible — by giving thinkers, builders,
                and leaders a place to articulate what they see, propose what could be, and invite
                others into the conversation.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Eye className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Our Vision</h2>
              <p className="mt-3 text-zinc-400 leading-relaxed">
                The systems we inherited were designed for a world that no longer exists. WorldOS is
                not a blueprint — it is an invitation. An invitation to think clearly, speak honestly,
                and build together toward systems that serve the many, not the few.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Our Approach</h2>
              <p className="mt-3 text-zinc-400 leading-relaxed">
                Every conversation on WorldOS begins with a thesis — a clear, reasoned argument about
                what is broken and what could be better. Theses are organized by category, open to
                challenge, and built to evolve. This is not opinion without structure. It is conviction
                with rigor.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Why Now</h2>
              <p className="mt-3 text-zinc-400 leading-relaxed">
                The gap between the systems we have and the systems we need has never been wider.
                Climate, governance, education, health — the old architectures are failing. The
                conversation about what replaces them cannot wait. WorldOS is where it begins.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Built for Serious People</h2>
          <p className="mt-4 text-zinc-400 text-lg max-w-2xl mx-auto">
            WorldOS is not a social network. It is not a think tank. It is a structured space for
            structured thinking — where the quality of the argument matters more than the volume of
            the voice.
          </p>
        </div>
      </section>
    </div>
  );
}
