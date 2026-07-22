import { Brain, Handshake, Globe2 } from 'lucide-react';
import type { ApplicationData } from './ApplicationWizard';

export default function ApplicationStepCommitment({
  data,
  update,
}: {
  data: ApplicationData;
  update: (patch: Partial<ApplicationData>) => void;
}) {
  return (
    <div>
      <h3 className="text-xl font-bold">The commitment</h3>
      <p className="mt-1 text-sm leading-relaxed text-zinc-500">
        Expeditions are deliberately small. The quality depends on the people in
        the room.
      </p>

      <div className="mt-6 grid gap-3">
        <CommitmentCard icon={Brain} title="Curiosity" body="I come to learn, not to perform certainty." />
        <CommitmentCard icon={Handshake} title="Contribution" body="I actively contribute to the quality of the group." />
        <CommitmentCard icon={Globe2} title="Respect" body="I value openness, diversity and thoughtful dialogue." />
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <input
          type="checkbox"
          checked={data.commitment_accepted}
          onChange={(event) => update({ commitment_accepted: event.target.checked })}
          className="mt-1"
        />
        <span className="text-sm leading-relaxed text-zinc-300">
          I commit to these principles.
        </span>
      </label>
    </div>
  );
}

function CommitmentCard({
  icon,
  title,
  body,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  const Icon = icon;

  return (
    <div className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500">{body}</p>
      </div>
    </div>
  );
}