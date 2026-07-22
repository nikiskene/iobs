import type { ApplicationData } from './ApplicationWizard';

export default function ApplicationStepBasics({
  data,
  update,
}: {
  data: ApplicationData;
  update: (patch: Partial<ApplicationData>) => void;
}) {
  return (
    <div className="space-y-4">
      <StepHeader title="Who are you?" body="A few basics so we know who is applying." />

      <Input label="Full Name" value={data.name} onChange={(value) => update({ name: value })} />
      <Input label="Email" value={data.email} onChange={(value) => update({ email: value })} type="email" />
      <Input label="Company" value={data.company} onChange={(value) => update({ company: value })} />
      <Input label="Position" value={data.position} onChange={(value) => update({ position: value })} />
      <Input label="LinkedIn" value={data.linkedin_url} onChange={(value) => update({ linkedin_url: value })} />
    </div>
  );
}

function StepHeader({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{body}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
    </label>
  );
}