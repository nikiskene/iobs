import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import EmailPasswordInput from "./EmailPasswordInput";
export default function ConfirmEmailAuth({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [password, setPassword] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function confirm() {
    if (!user?.email) return;
    setBusy(true);
    setError("");
    const entered = password;
    setPassword("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: entered,
      });
      if (error)
        setError("We could not confirm your IOBS sign-in. Please try again.");
      else onDone();
    } catch {
      setError("Sign-in could not be confirmed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          void confirm();
        }
      }}
      className="my-4 space-y-4 rounded-xl border border-amber-400/30 p-4"
    >
      <h3 className="font-semibold">Confirm your IOBS sign-in</h3>
      <p className="text-sm text-zinc-400">
        For security, confirm your website password, then submit the email
        action again.
      </p>
      <EmailPasswordInput
        label="IOBS website password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />
      {error && (
        <p role="alert" className="text-red-300">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={() => void confirm()}
        disabled={busy}
        className="min-h-11 rounded-lg bg-amber-400 px-4 text-black disabled:opacity-50"
      >
        {busy ? "Confirming…" : "Confirm sign-in"}
      </button>
      <p className="text-sm">
        <Link className="underline" to="/login">
          Use another sign-in method
        </Link>
      </p>
    </section>
  );
}
