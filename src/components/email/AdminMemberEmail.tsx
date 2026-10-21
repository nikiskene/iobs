import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useEmailAccount } from "../../hooks/useEmailAccount";
import {
  emailAction,
  EmailActionError,
  EMAIL_STATUS,
} from "../../lib/emailAccounts";
import ConfirmEmailAuth from "./ConfirmEmailAuth";
export default function AdminMemberEmail({ memberId }: { memberId: string }) {
  const account = useEmailAccount(memberId);
  const [eligibilityDraft, setEligibilityDraft] = useState<boolean | null>(
    null,
  );
  const [busy, setBusy] = useState(false),
    [local, setLocal] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [reauth, setReauth] = useState(false);
  async function allow(allowed: boolean) {
    setEligibilityDraft(allowed);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { error } = await supabase.rpc("email_admin_set_eligibility", {
        mid: memberId,
        allowed,
      });
      if (error) throw new Error();
      await account.refresh();
      setNotice("Email eligibility saved.");
    } catch {
      setError("Email eligibility could not be saved. Please retry.");
    } finally {
      setEligibilityDraft(null);
      setBusy(false);
    }
  }
  async function action(kind: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await emailAction({
        action: kind,
        member_id: memberId,
        username: local,
      });
      setNotice(
        kind === "check_provider"
          ? data.ready
            ? "Provider access and domain readiness confirmed."
            : "The domain is not ready to send and receive email."
          : kind === "link"
            ? "Existing mailbox linked. Its password was not changed."
            : "Account status refreshed.",
      );
      await account.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
      if (cause instanceof EmailActionError && cause.code === "reauthenticate")
        setReauth(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      onKeyDown={(e) => {
        if (
          e.key === "Enter" &&
          (e.target as HTMLElement).tagName === "INPUT"
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className="space-y-4 rounded-xl border border-white/10 p-5"
    >
      <h2 className="text-lg font-semibold">IOBS Email</h2>
      {account.loading ? (
        <p role="status">Loading email settings…</p>
      ) : account.error ? (
        <p role="alert">
          {account.error}{" "}
          <button
            type="button"
            onClick={() => void account.refresh()}
            className="underline"
          >
            Retry
          </button>
        </p>
      ) : (
        <>
          <label className="flex min-h-11 items-start gap-3 text-sm">
            <input
              type="checkbox"
              disabled={busy}
              checked={eligibilityDraft ?? account.allowed}
              onChange={(e) => void allow(e.target.checked)}
              className="mt-1"
            />
            Allow this member to create an @iobs.cc email account
          </label>
          <p className="text-sm text-zinc-400">
            This setting saves immediately. Turning it off does not delete or
            disable an existing mailbox.
          </p>
          {account.mailbox ? (
            <div className="space-y-2 rounded-lg border border-white/15 p-4">
              <p className="break-all font-medium">
                {account.mailbox.email_address}
              </p>
              <p>
                Status:{" "}
                {EMAIL_STATUS[account.mailbox.status] || "Verification needed"}
              </p>
              <p className="text-sm text-zinc-400">
                {account.mailbox.linked_existing ? "Linked" : "Created"}:{" "}
                {new Date(account.mailbox.created_at).toLocaleDateString()}
              </p>
              <button
                type="button"
                disabled={busy}
                className="min-h-11 rounded-lg border border-white/20 px-4"
                onClick={() => void action("status")}
              >
                Verify account
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm">This member has not created a mailbox.</p>
              <details className="rounded-lg border border-white/15 p-4">
                <summary className="min-h-11 cursor-pointer text-sm">
                  Link an existing Migadu mailbox
                </summary>
                <p className="my-3 text-sm text-zinc-400">
                  Use this only after confirming the mailbox belongs to this
                  person. Linking does not create a mailbox or change its
                  credentials.
                </p>
                <label className="block text-sm">
                  Existing @iobs.cc address
                  <input
                    value={local}
                    onChange={(e) => {
                      setLocal(e.target.value.toLowerCase());
                      setConfirmed(false);
                    }}
                    placeholder="niki@iobs.cc"
                    className="mt-2 min-h-11 w-full rounded-lg border border-white/20 bg-zinc-900 px-3"
                  />
                </label>
                <label className="my-4 flex min-h-11 items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  I have verified that this mailbox belongs to this member.
                </label>
                <button
                  type="button"
                  disabled={busy || !local || !confirmed}
                  className="min-h-11 rounded-lg border border-white/20 px-4 disabled:opacity-50"
                  onClick={() => void action("link")}
                >
                  Link existing mailbox
                </button>
              </details>
            </>
          )}
          <button
            type="button"
            disabled={busy}
            className="min-h-11 rounded-lg border border-white/20 px-4"
            onClick={() => void action("check_provider")}
          >
            Check provider connection
          </button>
        </>
      )}
      {reauth && (
        <ConfirmEmailAuth
          onDone={() => {
            setReauth(false);
            setNotice("Sign-in confirmed. Submit the email action again.");
          }}
        />
      )}
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-amber-200">
          {notice}
        </p>
      )}
    </section>
  );
}
