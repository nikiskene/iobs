export default function EstimateCard({
  estimatedPrice,
  durationDays,
  dailyRate,
}: {
  estimatedPrice: number;
  durationDays: string;
  dailyRate: number;
}) {
  return (
    <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-6">
      <p className="text-sm uppercase tracking-[0.25em] text-sky-300">
        Preliminary estimate
      </p>

      <p className="mt-3 text-4xl font-bold">
        USD {estimatedPrice.toLocaleString()}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        Based on {durationDays} day(s) × USD {dailyRate.toLocaleString()} per
        day for up to 10 participants. This is not a final quote. The final
        proposal depends on program design.
      </p>

      <div className="mt-5 grid gap-4 text-sm text-zinc-300 md:grid-cols-2">
        <div>
          <p className="font-semibold text-white">Included</p>
          <p className="mt-2 text-zinc-400">
            Program curation, speaker fees and local transportation.
          </p>
        </div>

        <div>
          <p className="font-semibold text-white">Excluded</p>
          <p className="mt-2 text-zinc-400">
            Flights, hotels, meals and personal expenses.
          </p>
        </div>
      </div>
    </div>
  );
}