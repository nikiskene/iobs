// src/pages/admin/theses/ThesisScaleSelector.tsx
import { SCALE_WORLDS } from '../../../components/institute/scaleWorlds';

export default function ThesisScaleSelector({ selected, onChange }: { selected: string[]; onChange: (slugs: string[]) => void }) {
  const toggle = (slug: string) => {
    onChange(selected.includes(slug) ? selected.filter((item) => item !== slug) : [...selected, slug]);
  };

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-zinc-300">Scale worlds</legend>
      <p className="mb-3 text-xs text-zinc-500">A case may appear in more than one world.</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {SCALE_WORLDS.map((world) => (
          <label key={world.slug} className="flex cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-300">
            <input type="checkbox" checked={selected.includes(world.slug)} onChange={() => toggle(world.slug)} />
            {world.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
