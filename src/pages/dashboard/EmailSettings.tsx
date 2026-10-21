import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useEmailAccount } from "../../hooks/useEmailAccount";
import {
  emailAction,
  EmailActionError,
  EMAIL_STATUS,
} from "../../lib/emailAccounts";
import EmailPasswordInput from "../../components/email/EmailPasswordInput";
import ConfirmEmailAuth from "../../components/email/ConfirmEmailAuth";
import EmailSetupGuide from "../../components/email/EmailSetupGuide";
export default function EmailSettings() {
  const account = useEmailAccount();
  const [local, setLocal] = useState(""),
    [password, setPassword] = useState(""),
    [repeat, setRepeat] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [reauth, setReauth] = useState(false),
    [changing, setChanging] = useState(false);
  const mailbox = account.mailbox,
    hasAccount =
      !!mailbox && ["active", "disabled", "missing"].includes(mailbox.status),
    pending =
      !!mailbox &&
      !hasAccount &&
      !["conflict", "retryable"].includes(mailbox.status);
  async function act(action: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (
        ["create", "password"].includes(action) &&
        (password.length < 12 || password.length > 128 || password !== repeat)
      ) {
        setError(
          "Use 12–128 characters and enter the same mailbox password twice.",
        );
        return;
      }
      const data = await emailAction({
        action,
        username: local,
        password: ["create", "password"].includes(action)
          ? password
          : undefined,
      });
      if (action === "availability")
        setNotice(
          data.available
            ? "This address is available."
            : "This email address is already taken. Please choose another.",
        );
      else {
        setPassword("");
        setRepeat("");
        setChanging(false);
        setNotice(
          action === "create"
            ? "Your IOBS email account has been created."
            : action === "password"
              ? "Your mailbox password has been changed."
              : "Account status refreshed.",
        );
        await account.refresh();
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Please try again later.",
      );
      if (cause instanceof EmailActionError && cause.code === "reauthenticate")
        setReauth(true);
      else if (action === "create") await account.refresh();
    } finally {
      setBusy(false);
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    void act(hasAccount ? "password" : "create");
  }
  if (account.loading) return <p role="status">Loading your email settings…</p>;
  return (
    <div className="max-w-2xl space-y-6 pb-16">
      <Link
        className="inline-flex min-h-11 items-center text-sm text-zinc-400"
        to="/dashboard/settings"
      >
        ← Settings
      </Link>
      <h1 className="text-3xl font-semibold">Your IOBS Email</h1>
      {account.error ? (
        <p role="alert">
          {account.error}{" "}
          <button className="underline" onClick={() => void account.refresh()}>
            Retry
          </button>
        </p>
      ) : (
        <>
          {!account.allowed && !mailbox && (
            <p className="text-zinc-400">
              An IOBS email account has not been enabled for your membership.
            </p>
          )}
          {mailbox && (
            <section className="space-y-3 rounded-xl border border-white/15 p-5">
              <p className="break-all text-xl">{mailbox.email_address}</p>
              <p>
                Status: {EMAIL_STATUS[mailbox.status] || "Verification needed"}
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => void act("status")}
                className="min-h-11 rounded-lg border border-white/20 px-4 disabled:opacity-50"
              >
                {pending ? "Verify account" : "Refresh status"}
              </button>
              {pending && (
                <p className="text-sm text-zinc-400">
                  We are checking whether this account was created. Verification
                  won’t create another mailbox or change a password.
                </p>
              )}
            </section>
          )}
          {hasAccount && (
            <>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://webmail.migadu.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-lg bg-amber-400 px-5 font-medium text-black"
                >
                  Open Webmail
                </a>
                <button
                  type="button"
                  disabled={busy || mailbox?.status === "missing"}
                  onClick={() => setChanging((v) => !v)}
                  className="min-h-11 rounded-lg border border-white/20 px-4"
                >
                  Change Email Password
                </button>
              </div>
              <EmailSetupGuide address={mailbox!.email_address} />
            </>
          )}
          {((account.allowed && !hasAccount && !pending) || changing) && (
            <form
              onSubmit={submit}
              className="space-y-5 rounded-xl border border-white/15 p-5"
            >
              <fieldset disabled={busy || reauth} className="space-y-5">
                {!changing && (
                  <>
                    <p>
                      You are eligible for an official Institute of Beautiful
                      Success email address.
                    </p>
                    <label htmlFor="email-username" className="block text-sm">
                      Choose your preferred email address
                    </label>
                    <div className="flex min-w-0 items-center gap-2">
                      <input
                        id="email-username"
                        required
                        maxLength={64}
                        value={local}
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        onChange={(e) => {
                          setLocal(e.target.value.toLowerCase());
                          setNotice("");
                        }}
                        placeholder="firstname.lastname"
                        className="min-h-11 min-w-0 flex-1 rounded-lg border border-white/20 bg-zinc-900 px-3"
                      />
                      <span className="shrink-0">@iobs.cc</span>
                    </div>
                    <p className="text-sm text-zinc-400">
                      Use letters, numbers, periods or hyphens. Start and end
                      with a letter or number. Administrative addresses are
                      reserved.
                    </p>
                    <button
                      type="button"
                      onClick={() => void act("availability")}
                      disabled={!local}
                      className="min-h-11 rounded-lg border border-white/20 px-4"
                    >
                      Check availability
                    </button>
                  </>
                )}
                <EmailPasswordInput
                  label={
                    changing
                      ? "New mailbox password"
                      : "Choose a mailbox password"
                  }
                  value={password}
                  onChange={setPassword}
                />
                <EmailPasswordInput
                  label="Confirm mailbox password"
                  value={repeat}
                  onChange={setRepeat}
                />
                <p className="text-sm text-zinc-400">
                  Use 12–128 characters. We never store your mailbox password.
                </p>
                <button className="min-h-11 w-full rounded-lg bg-amber-400 px-5 font-semibold text-black disabled:opacity-50">
                  {busy
                    ? "Please wait…"
                    : changing
                      ? "Save Email Password"
                      : "Create My Email Account"}
                </button>
              </fieldset>
            </form>
          )}
          {reauth && (
            <ConfirmEmailAuth
              onDone={() => {
                setReauth(false);
                setNotice("Sign-in confirmed. Submit the email action again.");
              }}
            />
          )}
          {busy && (
            <p role="status">
              Please wait while we contact the email provider…
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-400/30 p-4 text-red-200"
            >
              {error}
            </p>
          )}
          {notice && (
            <p
              role="status"
              className="rounded-lg border border-amber-400/30 p-4"
            >
              {notice}
            </p>
          )}
        </>
      )}
    </div>
  );
}
