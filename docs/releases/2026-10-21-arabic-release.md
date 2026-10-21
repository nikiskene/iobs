# Arabic CMS release

The release includes 231 exact-source Arabic translations from the currently published CMS content, 25 Arabic Site Copy records, Arabic public interface labels, shared language selection, and right-to-left layout. Homepage hero portraits alone are reflected horizontally in Arabic. Proper names, emails, URLs, identifiers, payment amounts and permissions retain their original values.

## Publication sequence

1. Validate and publish the frontend to the existing production site. Bundled Arabic translations work immediately, before the content import.
2. In the Supabase SQL Editor, run `2026-10-21-arabic-cms.sql` manually. This is a content import, with no schema, role, policy or function changes. It adds 256 Arabic rows and preserves existing rows on conflict. English copy and media are untouched. Repeating it is safe.
3. Refresh the website and choose AR, or open `https://www.iobs.cc/?lang=ar`.
4. Edit translations in Admin → Content → Site Copy → Arabic. Search using English source or Arabic text. Homepage fields have their normal Site Copy entries; other editorial content appears under CMS translations. Explicit Arabic Site Copy entries take precedence over shared exact-source translations.

No SQL was executed on production by this release. No Edge Function or secret changes are required. No OpenAI API is used for translation.

## Editorial maintenance

The catalog translates exact source text, never guesses using keywords. New or changed English text needs a corresponding Arabic translation. Existing named Site Copy entries can be edited normally in Arabic. For other new source text, add an Arabic record in `award_site_content` with section `translations`, the exact English source in `label`, and its Arabic translation in `body`; use a unique content key ending `__ar` and locale `ar`. Only public approved text belongs in this shared catalog. Private member content and private conversations are excluded.

Legal copy is translated from the existing CMS source, including its existing entity details, contact address and privacy placeholder. This release does not revise the underlying legal text.

## Validation

- TypeScript and production build.
- Catalog completeness, exact matching, source immutability and preservation of IDs, URLs, identities and payment amounts.
- SQL executed twice in local PostgreSQL-compatible PGlite: 256 Arabic entries, preserved English media and a pre-existing Arabic override.
- Browser checks at 320, 390, 768 and 1440 pixels: RTL, no horizontal overflow, English/Arabic switching, route persistence, chapter translations, unchanged non-hero images, and both hero images mirrored during crossfade.
- Mocked Admin save verifies locale `ar`, stable translation key and unchanged English source. Public live data was inspected in the local preview; production publication is verified separately.
