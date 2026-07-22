export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      {children}
    </div>
  );
}