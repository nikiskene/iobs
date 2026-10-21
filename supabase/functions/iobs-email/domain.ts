export const DOMAIN = "iobs.cc";
export const RESERVED = new Set([
  "admin",
  "administrator",
  "support",
  "security",
  "postmaster",
  "abuse",
  "hello",
  "info",
  "contact",
  "team",
  "office",
  "press",
  "media",
  "billing",
  "finance",
  "events",
  "chapters",
  "noreply",
  "no-reply",
  "root",
  "hostmaster",
  "webmaster",
  "dmarc",
  "mailer-daemon",
  "niki",
]);
export class EmailError extends Error {
  constructor(
    public code: string,
    public status = 400,
  ) {
    super(code);
  }
}
export function username(value: unknown) {
  if (typeof value !== "string") throw new EmailError("invalid_username");
  const local = value.toLowerCase();
  if (
    local.length > 64 ||
    !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(local) ||
    local.includes("..") ||
    RESERVED.has(local)
  )
    throw new EmailError("invalid_username");
  return local;
}
export function existingLocal(value: unknown) {
  if (typeof value !== "string") throw new EmailError("invalid_username");
  const local = value
    .trim()
    .toLowerCase()
    .replace(/@iobs\.cc$/, "");
  if (
    local.length > 64 ||
    !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(local) ||
    local.includes("..")
  )
    throw new EmailError("invalid_username");
  return local;
}
export function validPassword(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 12 &&
    value.length <= 128 &&
    !Array.from(value).some((character) => {
      const n = character.charCodeAt(0);
      return n < 32 || n === 127;
    })
  );
}
// Call only after getUser(token) verifies this exact token with Supabase Auth.
export function recentlyAuthenticated(token: string, now = Date.now() / 1000) {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(
      atob(part.padEnd(Math.ceil(part.length / 4) * 4, "=")),
    );
    return (
      Array.isArray(claims.amr) &&
      claims.amr.some(
        (entry: { method?: string; timestamp?: number }) =>
          ["password", "otp", "oauth", "totp", "webauthn", "sso/saml"].includes(
            entry.method || "",
          ) &&
          typeof entry.timestamp === "number" &&
          entry.timestamp >= now - 300 &&
          entry.timestamp <= now + 30,
      )
    );
  } catch {
    return false;
  }
}
export type ProviderMailbox = {
  local_part: string;
  address: string;
  name: string;
  may_send: boolean;
  may_receive: boolean;
  may_access_imap: boolean;
  identities?: { local_part: string; address?: string }[];
};
export function mailboxStatus(box: ProviderMailbox) {
  return box.may_send === true &&
    box.may_receive === true &&
    box.may_access_imap === true
    ? "active"
    : "disabled";
}
export const marker = (id: string) => `IOBS provisioning ${id}`;
export type Mailbox = {
  id: string;
  member_id: string;
  email_address: string;
  migadu_mailbox_identifier: string;
  status: string;
  operation_id: string;
  provider_create_started_at: string | null;
  lease_token: string;
  lease_until: string | null;
  created_at?: string;
};
export const messages: Record<string, string> = {
  invalid_username:
    "Use 1–64 lowercase letters, numbers, periods or hyphens. Start and end with a letter or number, avoid consecutive periods, and choose a non-reserved name.",
  invalid_password:
    "Choose a mailbox password with 12–128 characters and no control characters.",
  taken: "This email address is already taken. Please choose another.",
  not_eligible: "An IOBS email account has not been enabled for this member.",
  already_exists: "This member already has an IOBS email account.",
  reauthenticate: "Please sign in to IOBS again to continue securely.",
  unauthorized: "Please sign in to IOBS.",
  forbidden: "You do not have access to this email account.",
  disabled:
    "Email account management is not enabled yet. Please try again later.",
  routing_review:
    "An administrator needs to review the existing email routing rules before new addresses can be created.",
  provider_unavailable:
    "The email provider could not be reached. Please try again later.",
  busy: "An email operation is already in progress. Please wait and refresh.",
  rate_limited:
    "Too many attempts. Please wait 15 minutes before trying again.",
  needs_review:
    "We could not confirm the result. Use Verify account to check it safely. Do not create another account.",
  reconciliation_required:
    "This account needs an administrator to verify it before another creation attempt.",
  missing:
    "This mailbox was not found at the email provider. Please contact an administrator.",
  save_failed:
    "The provider operation may have succeeded. Refresh and use Verify account before retrying.",
  invalid_request: "Please check the form and try again.",
};
