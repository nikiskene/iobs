# Institute logo placement audit — 24 October 2026

Inspected the deployed https://www.iobs.cc/ homepage and the `nikiskene/iobs` checkout. The bare domain redirects to www. Production inspection confirmed a circular award logo plus text in the header and the two-line award logo in the footer.

## Placement decisions

| Placement | Implementation |
| --- | --- |
| Shared public header (`InstituteHeader`) | Full horizontal negative logo, 236px wide, intrinsic aspect ratio. 200px from 480–600px. |
| Shared public footer (`InstituteFooter`) | Full horizontal negative logo, 260px wide, linked home. On phones, place the claim below the logo instead of squeezing both into the old 120px logo column. |
| Member, dashboard, chapter-office, work and admin navigation (`Navigation` → `InstituteHeader`) | Inherits the updated shared public header. Preserve current account, BEAU, email and translated navigation. |
| Legacy public footer (`Footer`, including member pages) | Same full negative logo; replace generic alt text and identify the Institute in copyright text. |
| Header below 480px | Preserve existing circular compact artwork at 46×46px. The full artwork's small Institute line would be too small alongside language, acknowledgement, login/account and menu controls. |
| Favicon and Apple touch icon (`index.html`) | Preserve existing square IOBS artwork. |
| Open Graph / Twitter preview (`index.html`) | Preserve existing square artwork; do not insert a narrow transparent wordmark directly into a square preview. |
| Partner stripe and nomination/company logos | Preserve: these identify other organizations, not the Institute. |
| Award artwork constants | Preserve for award-specific use and compact artwork. |

All current logo-bearing header/footer surfaces are dark, including every selectable impact-scale theme. The supplied positive logo is available through `InstituteLogo tone="positive"` for a light surface; no current placement requires it. Theme follows the actual background, not the visitor's OS color preference. Both supplied PNGs have transparency and were inspected at their original proportions (negative 1739×471, positive 1726×472).

The shared public navigation switches to its menu at 1280px and below to leave room for the wider mark. Protected workspace navigation inherits the same breakpoint. No artwork is stretched, cropped or recolored. Footer images load lazily; header images load immediately. Explicit image dimensions reserve space.

## Verification

- Production homepage inspected in Chromium before changes.
- Local production build and TypeScript checks passed.
- 35 browser checks: `/`, `/about`, `/acknowledgement`, `/members`, `/login`, each at 320, 390, 480, 768, 1121, 1280 and 1440px. Header artwork loaded, stayed within the header, and did not overlap navigation/actions.
- Mobile menu opened successfully. Desktop/mobile footer and header screenshots visually inspected, including Arabic RTL header after image decoding.
- Changed-file lint has no errors. An existing InstituteHeader effect dependency warning remains unrelated to branding.
- Protected layouts were changed through their shared component; authenticated member/admin sessions were not exercised.
- Release prepared on current production `main`; deployed-site verification is performed after the release push.

## Remaining recommendations

1. Supply SVG versions for the fine lettering and strokes, with smaller downloads than the original 585KB / 741KB PNGs. The current PNGs have sufficient resolution at the implemented sizes.
2. Create a dedicated social preview card with appropriate background and spacing if full branding is desired in link previews. Preserve compact browser icons.
3. The admin Design & Site Settings logo upload still stores `site_settings.logo_url`; shared Institute branding now uses the explicit approved artwork instead. A future settings cleanup should distinguish legacy settings from the Institute's positive/negative/compact asset set.
4. Authenticated account-menu checks should use a real authorized account. Public desktop/mobile checks are repeated after publishing.
