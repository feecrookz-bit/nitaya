# Launch audit — Nitya Stones demo

Run before the owner presentation, against the build that is now live behind the gate. Every check below is a script in `scripts/audit/` (or `scratchpad` for the two older ones, copied here as noted) so it can be re-run at go-live with one command each. "Clean" means the script exits with no findings on the final build.

| Area | Script | Result |
|---|---|---|
| Typography, fonts, text colours, contrast | `scripts/audit/typo.cjs` | Clean (see notes) |
| Text laid over photographs (scene captions, banners, hero) — 5% worst pixels behind every line box vs the text colour, both themes, 1440 and 400 px | `scripts/audit/overphoto.cjs` | 404 measured, 0 below 4.5:1 (3:1 large) |
| Accessibility (axe-core 4.13, WCAG 2.1 AA + best practice), both themes | `scripts/audit/axe.cjs` | 0 violations |
| Behaviour: keyboard, focus, persistence, edge cases, business details on every page, structured data, gate failure paths | `scripts/audit/flows.cjs` | Clean |
| Route crawl (63 routes), flows, images, labels, one h1 per page | `scripts/audit/crawl.cjs` | Clean |
| Fit at 360 / 400 / 768 / 1024 / 1440 (overflow, clipped text, tap targets ≥ 44 px) | `scripts/audit/fit.cjs` | Clean |
| Visual pass: 17 routes × 3 widths × 2 themes, looked at by eye | `scripts/audit/visual.cjs` → `out/` | Reviewed; fixes below |
| Spelling (en-GB, nspell) and copy consistency over every visible string | `scripts/audit/strings.mjs` + `tools/spell.mjs` | 0 misspellings; consistency fixes below |
| Gate on the live host, desktop and phone viewports | `scratchpad/gatefull.js` | Clean |

## What was found and fixed

**Fonts and type**
- `Geist-700.ttf` was a byte-for-byte copy of the 500 file, so every bold on the site was synthesised. Replaced with the real Geist Bold (weight class 700 verified).
- One `font-weight: 300` with no 300 face; two Cinzel uses at weights other than 600 (the only Cinzel face). All pinned to loaded faces; `b, strong` now 600.
- Type floor raised: nothing under 12 px anywhere (kickers, nav, badges, labels, footer headings, diagram labels were 10.5–11.8 px). Footer paragraph up to 14.4 px on phones.
- Light theme: `--ink-3` (secondary text) and `--gold-2` (kickers) darkened so every text/background pair clears 4.5:1, including kickers on the tinted sand, sage and slate sections. The dark panels (Build Your Patio "Your design", newsletter) had ink-on-ink headings in the light theme, now light text as intended.
- The wet/dry slider handle glyph was white on white.
- Distinct text colours are now 9 per theme, all from the token set.

**Copy**
- Text over photographs: scene captions were dark ink on the dark scrim in the light theme and the scrim was too light for pale stone (down to 3.7:1); captions are now white with a deeper scrim and banner kickers sit on a small dark plate. 0 of 404 line boxes below threshold after the fix.
- 0 spelling errors across 762 visible strings. 80 straight apostrophes and 4 pairs of straight quotes made typographic.
- "3–4 working days" (8 places) and "Three to four" (2) corrected to the store's own published Delivery Terms: 3–5 working days; the M25 band now says orders over £500 travel free.
- "Visa Electron" (discontinued) removed from the payment lines. Indoor finishes "matt or gloss" → "matt, satin or polished" per the listings. One remaining "thickness varies" line in a guide reconciled with calibrated stone. An unverifiable "most patios in Hertfordshire" line removed.
- Reviews on the site are the two on the current store, verbatim.
- Every route has a distinct `<title>` (Projects and Trade were missing). Unknown routes and unknown products get a proper not-found page and title.
- Open Graph and Twitter tags with a 1200×630 image (`public/og.jpg`); `HomeAndConstructionBusiness` JSON-LD generated from the one business record.

**Business details**
- One source of truth: `BUSINESS` in `src/data.js` (phone, mobile, WhatsApp, email, address, postcode, Google Maps link, hours, socials). Header, footer, Contact, About, Checkout, the order confirmation and the structured data all read from it; `flows.cjs` checks every page's footer against it.
- Verified against the current site: 0330 236 9227, 07932 009870 (also the store's WhatsApp number), info@nityastones.co.uk, 34 Mark Road HP2 7BW, Mon–Fri 08:00–18:00, Sat 08:00–13:00. Both phones are `tel:` links everywhere, email is `mailto:`, the address opens Google Maps.
- Socials: Instagram and Facebook (both on the current site) plus WhatsApp. LinkedIn removed (no page of the store's own found). The current site also links a Twitter/X account — owner's call.
- Contact page showed "Sunday · Closed" twice; fixed.

**Accessibility and behaviour**
- axe: gallery thumbnails used `role=tab` with `aria-pressed` (critical); footer `h4` and page `h2` heading jumps; pages without an `h1` (Collections, Build, Guides, About, FAQ, Contact, Samples, Bag, Checkout); marquee images repeating their caption as alt. All fixed; 0 violations in both themes.
- Escape now closes the mobile menu. Lightbox is rendered on the body so the header can never cover its close button. Focus rings present on every interactive element.
- Bag persists across reload; quantity to zero removes the line; checkout stays disabled until name, phone and address are in; delivery estimate handles in-band, out-of-band ("priced by the job") and invalid postcodes; search with no results says so; back/forward and deep-link anchors work; theme is applied before first paint.
- Gate: wrong password shows a message, session is remembered, deep links survive the unlock, the site's fonts load after the swap. The gate page now self-hosts its fonts (no Google Fonts request) and carries share tags and the favicon.

**Performance**
- Gated page 1.0 MB (was 14 MB before the multi-file build). Largest image 322 KB (hero scene). The first hero slide is preloaded. All below-fold images lazy.

**Visual pass**
- Reviewed all 102 frames. Fixed: the hero scroll cue sat over the slide caption on phones (hidden under 640 px); the page banners (Shop, Projects, Trade) needed a heavier gradient for the headline over busy pallet photos.
- Print stylesheet added: chrome, dark grounds, sliders and the 3D scene drop out; product page and guides print black on white.

## Notes and known limits

- The crawl's "broken image" check flags lazily-loaded images that are still below the fold when it looks; scrolling loads them. The script scrolls first and waits, and the count is 0 on the final run.
- Samsung Internet and Safari behaviour through the gate needs a look on a real phone; the automated runs are Chromium.
- Copy facts that come from the store's own listings and still want the owner's confirmation are listed in `OPTIONS.md` item 7.

## Re-running

```
cd web
SINGLE=1 npm run build                          # audit build (file://)
node scripts/audit/typo.cjs
PNGJS=<path to pngjs> node scripts/audit/overphoto.cjs   # captions and headings over photographs
AXE=<path to axe.min.js> node scripts/audit/axe.cjs
node scripts/audit/flows.cjs                    # also needs publish/ served at http://localhost:8765/nitaya/
node scripts/audit/crawl.cjs
node scripts/audit/fit.cjs
node scripts/audit/visual.cjs                   # frames in scripts/audit/out/
node scripts/audit/strings.mjs > /tmp/strings.txt
```
