import { supabase } from "./supabase";
export type EmailMailbox = {
  id: string;
  member_id: string;
  email_address: string;
  migadu_mailbox_identifier: string;
  linked_existing: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};
export const MAILBOX_FIELDS =
  "id,member_id,email_address,migadu_mailbox_identifier,linked_existing,status,created_at,updated_at";
export const EMAIL_STATUS: Record<string, string> = {
  active: "Active",
  disabled: "Disabled at email provider",
  missing: "Needs administrator attention",
  provisioning: "Creation in progress",
  needs_review: "Verification needed",
  retryable: "Creation did not complete — please try again",
  conflict: "Address unavailable",
};
export class EmailActionError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}
export async function emailAction(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("iobs-email", {
    body,
  });
  if (error) {
    let payload: { error?: string; code?: string } = {};
    try {
      if (error.context instanceof Response)
        payload = await error.context.json();
    } catch {
      /* only safe application errors are displayed */
    }
    throw new EmailActionError(
      payload.error ||
        "Email account management is unavailable. Please try again later.",
      payload.code || "unavailable",
    );
  }
  if (data?.error)
    throw new EmailActionError(data.error, data.code || "unavailable");
  return data;
}
