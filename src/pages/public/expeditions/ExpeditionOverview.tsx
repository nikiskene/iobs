import type { Expedition } from '../../../lib/types';
import ApplicationWizard from './application/ApplicationWizard';

export default function ExpeditionOverview({
  expedition,
}: {
  expedition: Expedition;
}) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          {expedition.short_description && (
            <p className="text-2xl leading-relaxed text-zinc-200">
              {expedition.short_description}
            </p>
          )}

          {expedition.description && (
            <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-zinc-400">
              {expedition.description}
            </p>
          )}
        </div>

        <ApplicationWizard expedition={expedition} />
      </div>
    </section>
  );
}