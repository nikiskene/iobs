# Public team page

`/team` presents Founders, Team, Supporters, and Advisory Board. `/our-team` redirects there. The shared homepage footer links to Team; primary navigation is unchanged.

Admin → Members → Member Directory is the single place to manage a person’s public details, team category, team-page visibility, and linked login accounts. Public entries do not require a login account; a person may have more than one login account.

The public category (for example, Founder) is independent of each login account’s access role. A linked account can be an Explorer, have workspace access, or be an Admin without changing the person’s public category.

## Database release — 2026-09-24

Applied `20260924120000_public_team.sql` to the existing Supabase project. Existing active team profiles that opted into public visibility retain published status; private profiles are imported as drafts. Categories default to Team without inferring roles. Account permissions are unchanged.

Recovered `20260813203000_update_knob_assets.sql` from the live migration history. The team migration was applied from a temporary release directory containing exactly the fetched remote history and the new migration. The dry run confirmed only the team migration was pending. No historical migrations were replayed or marked repaired. Older local migrations may still differ from remotely recorded history; review the complete pending list before future broad database pushes.

## Verification

- Typecheck, focused ESLint, production build and whitespace checks passed.
- Anonymous reads return the three original people: Silje Hoegmark, Dietmar Dahmen, Niki Skene.
- Temporary draft and archived entries were hidden from anonymous reads; anonymous insert was rejected, and an anonymous update affected zero rows. Temporary test data was removed and the final row count is three.
- The public team photo bucket exists with a 5 MB limit and JPG/PNG/WebP support. Upload and deletion policies require an administrator.
- Photos are public assets; draft status hides an entry, not a previously shared image URL.
- Browser visual QA and authenticated admin upload/save checks remain unverified because the browser tool could not verify its security policy.

## Member consolidation — 2026-09-25

Applied `20260924210000_unified_members.sql`. Every login profile now belongs to one canonical member record, and shared personal details update every linked login profile. The previous public-team and profile-access tabs have been replaced with one list and one editor.

Dietmar Dahmen’s two existing login accounts are linked to a single published Founder member. Their existing workspace permissions and account-linked history remain intact. The earlier duplicate member record is archived and points to the canonical record for auditability.
