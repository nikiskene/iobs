import { Link } from "react-router-dom";
import { useEmailAccount } from "../../hooks/useEmailAccount";
export default function SettingsPage() {
  const email = useEmailAccount();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <Link
        to="/dashboard/profile"
        className="block rounded-xl border border-white/15 p-5"
      >
        <h2 className="font-medium">Profile</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Your name, photo and member details.
        </p>
      </Link>
      {(email.allowed || email.mailbox) && (
        <Link
          to="/dashboard/settings/email"
          className="block rounded-xl border border-white/15 p-5"
        >
          <h2 className="font-medium">IOBS Email</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Your official @iobs.cc email account.
          </p>
        </Link>
      )}
      {email.loading && <p role="status">Loading settings…</p>}
      {email.error && (
        <p role="alert">
          {email.error}{" "}
          <button className="underline" onClick={() => void email.refresh()}>
            Retry
          </button>
        </p>
      )}
    </div>
  );
}
