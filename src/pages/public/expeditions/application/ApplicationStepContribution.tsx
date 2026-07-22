import type { ApplicationData } from './ApplicationWizard';

export default function ApplicationStepContribution({
  data,
  update,
}: {
  data: ApplicationData;
  update: (patch: Partial<ApplicationData>) => void;
}) {
  return (
    <div>
      <h3 className="text-xl font-bold">Your contribution</h3>
      <p className="mt-1 text-sm leading-relaxed text-zinc-500">
        What perspective, experience or question would you bring that could make
        this expedition better for everyone else?
      </p>

      <textarea
        value={data.contribution}
        onChange={(event) => update({ contribution: event.target.value })}
        rows={8}
        className="mt-5 w-full resize-none rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        placeholder="What would you bring into the room?"
      />
    </div>
  );
}