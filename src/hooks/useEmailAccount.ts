import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { MAILBOX_FIELDS, type EmailMailbox } from "../lib/emailAccounts";
import { useAuth } from "./useAuth";
export function useEmailAccount(memberId?: string) {
  const { user, profile } = useAuth();
  const ownMember = profile?.member_id;
  const mid = memberId || ownMember;
  const uid = user?.id;
  const [allowed, setAllowed] = useState(false),
    [mailbox, setMailbox] = useState<EmailMailbox | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    if (!uid || !mid) {
      setLoading(false);
      return;
    }
    try {
      const [p, m] = await Promise.all([
        supabase
          .from("member_email_permissions")
          .select("email_creation_allowed")
          .eq("member_id", mid)
          .maybeSingle(),
        supabase
          .from("iobs_mailboxes")
          .select(MAILBOX_FIELDS)
          .eq("member_id", mid)
          .maybeSingle(),
      ]);
      if (p.error || m.error) throw new Error();
      setAllowed(p.data?.email_creation_allowed === true);
      setMailbox(m.data as EmailMailbox | null);
    } catch {
      setError("Email settings could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [uid, mid]);
  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);
  return { allowed, mailbox, loading, error, refresh: load };
}
