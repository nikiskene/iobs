export default function EmailSetupGuide({ address }: { address: string }) {
  return (
    <details className="rounded-xl border border-white/15 p-4">
      <summary className="min-h-11 cursor-pointer font-medium">
        Set Up Email on Your Device
      </summary>
      <p className="my-4 text-sm text-zinc-400">
        Use these settings in Apple Mail, Outlook, Thunderbird or your phone’s
        email app. Choose IMAP when adding an account.
      </p>
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
      <p className="mt-4 text-sm">
        Your mailbox password is separate from your IOBS website password.
      </p>
    </details>
  );
}
