export default function ApplicationSuccess() {
  return (
    <aside className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-7">
      <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
        Application received
      </p>

      <h2 className="mt-4 text-3xl font-bold text-white">
        Thank you.
      </h2>

      <div className="mt-5 space-y-4 text-sm leading-relaxed text-emerald-100/80">
        <p>Every application is reviewed personally.</p>

        <p>
          We do not curate expeditions around job titles or company logos. We
          curate them around the conversations they make possible.
        </p>

        <p>We will review your application and get back to you shortly.</p>
      </div>
    </aside>
  );
}