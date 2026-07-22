export default function ProgressBar({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  return (
    <div className="mt-6">
      <div className="flex gap-2">
        {Array.from({ length: total }).map((_, index) => {
          const active = index + 1 <= step;

          return (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full ${
                active ? 'bg-sky-400' : 'bg-white/10'
              }`}
            />
          );
        })}
      </div>

      <p className="mt-2 text-xs text-zinc-600">
        Step {step} of {total}
      </p>
    </div>
  );
}