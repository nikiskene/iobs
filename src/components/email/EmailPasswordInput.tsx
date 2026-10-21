import { useId, useState } from "react";
export default function EmailPasswordInput({
  label,
  value,
  onChange,
  autoComplete = "new-password",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const id = useId(),
    [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm">
        {label}
      </label>
      <div className="flex min-w-0 gap-2">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          maxLength={128}
          onChange={(e) => onChange(e.target.value)}
          required
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-white/20 bg-zinc-900 px-3 text-white"
        />
        <button
          type="button"
          aria-controls={id}
          aria-pressed={visible}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          onClick={() => setVisible((v) => !v)}
          className="min-h-11 rounded-lg border border-white/20 px-3 text-sm"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
