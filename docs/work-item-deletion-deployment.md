# Work item deletion

Run `work-item-deletion-supabase-release.sql` manually in the IOBS Supabase SQL Editor. It installs permission checks and records migration 20261021180000; it does not delete any existing Work item or document. Both currently active Admin accounts receive the capability, as requested. Future Admin accounts do not receive it automatically.

Then run `work-item-deletion-supabase-verify.sql`. The expected active Admin count is 2 and both unprivileged-write flags must be false. After verification, merge the Work deletion branch and confirm publication on www.iobs.cc.

To delete: open a Work item, choose Delete item, then confirm. The item disappears from Work lists, totals and the archived Facts view. Its documents remain accessible in the Work repository. The retained database row records who removed it and when; it is hidden from normal Work queries. There is no user-facing restore action in this release. Physical deletes through the browser are blocked, including the legacy broad Admin delete policy.

Validation: 24 database checks cover active/inactive permissions, denial of self-granting and direct-update bypasses, document/history preservation, hidden deleted rows, manual installation and migration history. Browser checks cover cancellation, successful deletion at 320/390/1440px, access denial, revoked access and retained documents. Production verification must not delete real items merely to test the feature.
