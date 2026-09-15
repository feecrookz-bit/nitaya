# 2. Architecture

## Stack

| | |
|---|---|
| Framework | React 19, one page, a tiny hash router written in `App.jsx` |
| Build | Vite 8 (rolldown), `web/vite.config.js` |
| 3D | three.js with react-three-fiber and drei, loaded lazily so the first paint never waits for it |
| Styling | One stylesheet, `web/src/index.css`, tokens at the top; no CSS framework |
| Type | Geist 400/500/700 and Cinzel 600, self-hosted from `web/src/fonts` |
| Lint | oxlint |
| Hosting | GitHub Pages (preview), Cloudflare Workers serving the static build (live) |
| Backend | None. See page 8 for how WooCommerce and the stock tracker attach without one |

No TypeScript, no state library, no router library, no component library. The whole site is eleven source files.

## File map

```
nitaya/
  web/                       the site
    index.html               shell: meta, Open Graph, theme pre-paint, the path-to-hash shim
    src/
      main.jsx               mounts App
      App.jsx                every page and component (1,200 lines), the router, bag, theme
      data.js                products, packing, prices, business details, delivery, filters, search
      content.js             long product copy: features, what is in the pack, laying, care
      guides.js              the nine guides
      Diagrams.jsx           the guides' drawings (SVG, to scale)
      StoneScene.jsx         the 3D slab, laid field and wall
      WetDry.jsx             the wet/dry slider
      Motion.jsx             reveals, count-ups, marquee, parallax; all honour reduced-motion
      Logo.jsx               the mark
      index.css              the whole design
      assets/                graded photographs, renders, textures, logo (21 MB, 211 files)
      fonts/
    public/                  favicon, touch icon, og.jpg, icons.svg, _redirects, _headers
    scripts/
      photos.py              fetch, grade, gallery, textures (page 5)
      photos.json, gallery.json   the two photo manifests
      inline.mjs, protect.mjs     the password gate (page 6)
      pages.mjs              the Cloudflare build
      serve-pages.mjs        a local Cloudflare-style server
      social.py              social post templates in the site's design
      audit/                 the audit scripts (page 7)
    AUDIT.md, PHOTOGRAPHY.md
  present/                   owner pack, presenter script, stock tracker brief
  wiki/                      this
  .github/workflows/pages.yml   the preview deploy
  HANDOVER.md DEPLOY.md OPTIONS.md COMPETITOR.md UPDATES.md README.md
```

`index.html` at the repository root is the very first single-page prototype from 10 September and is not used.

## The three builds

| Command (from `web/`) | Output | For |
|---|---|---|
| `BASE_PATH=/nitaya/ npm run build` | `dist/` | GitHub Pages preview, served under `/nitaya/` |
| `npm run pages` | `publish/` | Cloudflare, at the domain root (page 6) |
| `SINGLE=1 npm run build` | `dist-single/index.html` | One self-contained file with every image inlined; the audits and the pack screenshots run from it over `file://` |

A fourth, `BASE_PATH=./ OUT_DIR=dist-artifact npm run build`, makes a relative-path build for the private web copy.

The default build puts the libraries in their own `vendor` chunk so the app chunk can be folded into the gated page while the lazy 3D chunk still finds React and three as plain files.

## Routing

Addresses are hash routes: `/#/shop`, `/#/product/raj-green`, `/#/guide/laying-indian-sandstone`, `/#/shop?cat=indoor&colour=grey`. The router in `App.jsx` (`useRoute`) reads the hash, splits page, id, query and anchor, and scrolls to the top on change. Every page sets its own `<title>` from a `TITLES` map and the product and guide pages set structured data for search engines.

A path without the hash (`/product/raj-green`) is turned into the hash form by a short script in `index.html` before the app loads, so the redirects from the old store and hand-typed addresses both work.

## State

Everything lives in memory and, for five things, in the browser's local storage under `nitya-` keys:

| Key | Holds |
|---|---|
| `nitya-bag` | The bag: line id and quantity per line |
| `nitya-designs` | Saved patio designs from the builder |
| `nitya-theme` | dark or light |
| `nitya-pc` | The last postcode typed into a delivery estimate |
| `nitya-offer` | When the offer pop-up last showed (it shows once a week) |

Nothing is sent anywhere. The audits set `nitya-offer` before each run so the pop-up cannot intercept a click.

## Themes and type

Dark is the default; a sun/moon button in the header switches, and a two-line script in `index.html` applies the saved theme before the first paint so there is no flash. The light theme is a second token set under `:root[data-theme="light"]`, with its secondary text and kicker gold darkened until every text/background pair clears 4.5:1.

Type floor is 12 px anywhere on the site, 16 px for body text on phones. Tap targets are at least 44 px. Both are checked by script (page 7).
