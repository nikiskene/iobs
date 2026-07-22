import type { ApplicationData } from './ApplicationWizard';

export default function ApplicationStepCuriosity({
  data,
  update,
}: {
  data: ApplicationData;
  update: (patch: Partial<ApplicationData>) => void;
}) {
  return (
    <div>
      <h3 className="text-xl font-bold">One conversation</h3>
      <p className="mt-1 text-sm leading-relaxed text-zinc-500">
        If you could spend one uninterrupted hour with anyone in the innovation
        ecosystem, who would it be — and what would you ask?
      </p>

      <textarea
        value={data.curiosity_question}
        onChange={(event) => update({ curiosity_question: event.target.value })}
        rows={8}
        className="mt-5 w-full resize-none rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        placeholder="Who would you want to meet, and what would you ask?"
      />
    </div>
  );
}