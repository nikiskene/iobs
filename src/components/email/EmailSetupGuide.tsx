import { useEffect, useId, useRef } from "react";

export default function EmailSetupGuide({
  address,
  onClose,
}: {
  address: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const openerRef = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      const opener = openerRef.current;
      requestAnimationFrame(() => {
        if (!dialog?.open && opener?.isConnected) opener.focus();
      });
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto overscroll-contain rounded-xl border border-white/20 bg-zinc-950 p-5 text-white shadow-2xl backdrop:bg-black/75 sm:p-8"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id={titleId} className="text-2xl font-semibold">
          Set Up Email on Your Device
        </h2>
        <button
          type="button"
          autoFocus
          aria-label="Close setup instructions"
          onClick={onClose}
          className="min-h-11 min-w-11 shrink-0 rounded-lg border border-white/20 text-xl"
        >
          ×
        </button>
      </div>
      <p className="mt-3 break-all font-medium text-amber-300">{address}</p>
      <ol className="my-5 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
        <li>Open your email app’s settings and choose Add Account.</li>
        <li>
          Choose Other or Manual setup, then IMAP. These settings work in Apple
          Mail, Outlook, Thunderbird and other email apps.
        </li>
        <li>
          Enter your name, your full IOBS email address and the mailbox password
          you chose. Use the server settings below, then save the account.
        </li>
      </ol>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["Incoming email", "IMAP", "imap.migadu.com", "993"],
          ["Outgoing email", "SMTP", "smtp.migadu.com", "465"],
        ].map(([title, protocol, server, port]) => (
          <section key={protocol} className="rounded-lg bg-white/5 p-4">
            <h3 className="font-medium">{title}</h3>
            <dl className="mt-3 space-y-2 text-sm">
              {[
                ["Protocol", protocol],
                ["Server", server],
                ["Port", port],
                ["Security", "SSL/TLS"],
                ["Authentication", "Normal password"],
                ["Username", address],
                ["Password", "Your mailbox password"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-zinc-400">{label}</dt>
                  <dd className="break-all">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <p className="mt-5 text-sm text-zinc-300">
        Outgoing (SMTP) authentication must be enabled. Use the same full email
        address and mailbox password for both servers. Your mailbox password is
        separate from your IOBS website password.
      </p>
      <p className="mt-3 text-sm text-zinc-300">
        You can reopen these instructions anytime in Settings → IOBS Email.
      </p>
      <a
        href="https://www.migadu.com/guides/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex min-h-11 items-center text-sm text-amber-300 underline"
      >
        Email app setup guides
      </a>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 min-h-11 w-full rounded-lg bg-amber-400 px-5 font-semibold text-black"
      >
        Done
      </button>
    </dialog>
  );
}
