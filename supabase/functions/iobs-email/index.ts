import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { SupabaseEmailStore } from "./store.ts";
import { MigaduProvider } from "./migadu.ts";
import { createEmailHandler } from "./service.ts";
const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const user = Deno.env.get("MIGADU_API_USER") || "",
  key = Deno.env.get("MIGADU_SECRET_KEY") || "";
Deno.serve(
  createEmailHandler(
    new SupabaseEmailStore(db),
    new MigaduProvider(user, key),
    {
      configured: !!user && !!key,
      enabled: Deno.env.get("IOBS_EMAIL_ENABLED") === "true",
    },
  ),
);
