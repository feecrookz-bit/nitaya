# 7. Audits

Tests are the definition of done here. Every check is a script in `web/scripts/audit/`, run from `web/`, and `web/AUDIT.md` records what each found and fixed. Most run against the single-file build (`SINGLE=1 npm run build`); the two that need the gate run against the gated build served locally.

## Before a push

| Script | Checks | Needs |
|---|---|---|
| `flows.cjs` | Behaviour: keyboard, focus, bag persistence, quantity edge cases, checkout validation, the ordering maths on the product page, calculator, builder, bag and checkout, the pop-up, business details on every page, structured data, route titles, the gate's failure paths | The gated `publish/` served at `http://localhost:8765/nitaya/` |
| `gate.cjs` | Unlock, wrong password, remembered session, deep link through the gate | Same |
| `typo.cjs` | Fonts loaded, weights covered, nothing under 12 px, every text colour from the token set, every text/background pair at 4.5:1 (3:1 large), both themes | dist-single |
| `axe.cjs` | axe-core accessibility over 17 routes in both themes; 0 violations is the bar | dist-single, `AXE=` path to axe.min.js |
| `crawl.cjs` | 69 routes: no console errors, no failed requests, one h1, alt on every image, a label on every field | dist-single |

## Before a design change goes out

| Script | Checks |
|---|---|
| `fit.cjs` | 360, 400, 768, 1024, 1440 px: no horizontal overflow, no clipped text, tap targets at least 44 px |
| `overphoto.cjs` | Every line of text laid over a photograph, measured against the pixels behind it, both themes, 1440 and 400 px (`PNGJS=` path to pngjs) |
| `visual.cjs` | Contact sheets of 17 routes × 3 widths × 2 themes in `out/`, for a human look, plus two pages printed to PDF |
| `strings.mjs` + `spell.mjs` | Every visible string extracted and spell-checked (en-GB), and checked for consistency: m², ×, en dashes, curly apostrophes, one spelling of the name |

## At go-live

`golive.cjs` runs against the deployed site rather than a local build:

```
BASE=https://nitya-stones.coleisha.workers.dev EXPECT=open node scripts/audit/golive.cjs
BASE=https://nityastones.co.uk EXPECT=open node scripts/audit/golive.cjs
```

It checks the gate is up or down as expected, the safety headers, that an unknown path serves the site with a 200, that hashed assets are cached immutable, the favicon and share image, every one of the 114 fixed redirects and the two wildcards, the two invisible-character addresses, and, on an open site, that old product addresses land on the right product page in a real browser and the checkout loads without errors. It passes against the local Cloudflare-style server (`npm run preview:pages`) for both the open and the gated build.

## Running the local server for flows and gate

```
mkdir -p /tmp/srv && ln -sfn "$PWD/publish" /tmp/srv/nitaya
(cd /tmp/srv && python3 -m http.server 8765 &)
```

The server dies between sessions; restart it before `flows.cjs` and `gate.cjs`. All the scripts set the offer pop-up's storage key before each run so it cannot intercept a click; the pop-up has its own test in flows.

## What the audits have caught so far

A synthesised bold (the 700 font file was a copy of the 500), a font weight with no face, text under 12 px in eleven places, kicker gold and secondary text failing contrast in the light theme, ink-on-ink headings in the dark panels, a white-on-white slider handle, gallery thumbnails with the wrong role, heading jumps, pages without an h1, unlabeled fields, a class name clash between the mixed-pack hint and the delivery estimate, the 3D badge losing contrast through a dimmed thumbnail, and the WhatsApp button outside any landmark. All fixed; the log is in `web/AUDIT.md`.
