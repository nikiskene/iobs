import type { ApplicationData } from './ApplicationWizard';

export default function ApplicationStepMotivation({
  data,
  update,
}: {
  data: ApplicationData;
  update: (patch: Partial<ApplicationData>) => void;
}) {
  return (
    <div>
      <h3 className="text-xl font-bold">Why now?</h3>
      <p className="mt-1 text-sm leading-relaxed text-zinc-500">
        Why do you believe this expedition matters for you right now?
      </p>

      <textarea
        value={data.motivation}
        onChange={(event) => update({ motivation: event.target.value })}
        rows={8}
        className="mt-5 w-full resize-none rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        placeholder="What makes this the right moment?"
      />
    </div>
  );
}