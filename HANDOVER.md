# Handover — the Nitya Stones website upgrade

Two readers: **Coleisha**, who takes over day-to-day changes to the site using Claude Code, and **Nitya Stones**, who need to know what exists, what it still needs from them, and who is doing what. Fee keeps the DNS switch and the API connections.

Written 14 September 2026. Everything below is true of the `main` branch on that date.

---

## Part 1 — For Coleisha: working on the site

### What it is and where it lives

- **The code**: github.com/feecrookz-bit/nitaya, branch `main`. Every push to `main` rebuilds and redeploys the preview by itself in about half a minute (GitHub Actions, `.github/workflows/pages.yml`).
- **The preview**: https://feecrookz-bit.github.io/nitaya/ behind a password (`nitya2026!!`). The password lives as a repository secret called `SITE_PASSWORD`; change it there, never in the code. Don't forward the password in email chains; give it by phone or in person.
- **The owner pack**: `present/Nitya-Stones-Website-Upgrade-Pack.pdf`, and the presenter one-pager `present/SCRIPT.md`.
- **The lists that matter**: `OPTIONS.md` (every decision and asset still needed from the yard), `COMPETITOR.md` (the Royale Stones study), `AUDIT.md` (what has been checked and how to re-run it), `DEPLOY.md` (the GitHub transfer, Cloudflare Pages, old-address redirects and go-live).

### Setting up a laptop

1. Install Git, Node 22 and Python 3.
2. `git clone https://github.com/feecrookz-bit/nitaya` then `cd nitaya/web` and `npm ci --legacy-peer-deps`.
3. `npm run dev` opens the site locally at the address it prints. Changes show as you save.
4. For the photo scripts: `pip install pillow`. For the audits: Playwright's Chromium (`npx playwright install chromium`), only if you want to run them locally; the important checks are quick to run through Claude Code anyway.
5. Sign in to Claude Code in that folder. It reads this file and `CLAUDE.md` is not used here (that file belongs to another project); the rules that apply are the ones in this document.

### Where things are

| You want to change | File |
|---|---|
| A price, a sale price, a pack size, a product name or blurb, which ranges are "editor's picks" | `web/src/data.js` |
| The long product copy: features, what's in the pack, laying and care notes | `web/src/content.js` |
| Phone numbers, email, address, hours, social links | `BUSINESS` at the top of `web/src/data.js`, nowhere else; header, footer, contact, checkout and the search-engine data all read from it |
| Wording on any page, the order of sections, a new page | `web/src/App.jsx` (every page is a function in this one file) |
| Colours, fonts, spacing, light and dark theme | `web/src/index.css`; the colour tokens are at the top and again under the light theme block |
| The guides | `web/src/guides.js` and the drawings in `web/src/Diagrams.jsx` |
| The 3D slab and laid views | `web/src/StoneScene.jsx` |
| Essentials (jointing, primer, steps, edging, granite): the lines and their packing | `ESSENTIALS` in `web/src/data.js`; add a `price` once the yard gives one |
| Project photographs | `web/scripts/photos.json` (add the photo's URL or file with a `scene-` name), run `python3 scripts/photos.py grade` from `web/`, then add a line to `SCENES` in `data.js` |
| Product gallery photographs | `web/scripts/gallery.json`, then `python3 scripts/photos.py gallery` |
| The owner pack | `present/content.js` for the words, then `node shoot.mjs new`, `python3 prep.py`, `node build.mjs` in `present/` |

### How a change goes out

Ask Claude Code to make the change, then to do these four things, in this order:

1. `cd web && npm run build` (and `SINGLE=1 npm run build` if it is going to run the audits).
2. Run the audits that touch what changed. The quick ones: `node scripts/audit/flows.cjs` (behaviour), `node scripts/audit/typo.cjs` (text sizes and colours), and the accessibility check in `AUDIT.md`. Flows needs the gated build served locally; `AUDIT.md` says how.
3. Commit with a plain message saying what changed and why.
4. `git push origin main`. Wait a minute, open the preview, check the page you changed on a phone as well as the laptop.

If something breaks on the preview, `git revert` the last commit and push; the site goes back to how it was.

### Rules that keep the site honest

These are the reason the demo is trusted. Please keep them.

- **Nothing invented.** No reviews, figures, awards, "since" dates, delivery promises or claims that did not come from the yard or its current site. If a fact is unconfirmed it goes in `OPTIONS.md`, not on a page.
- **Only the yard's own photographs.** Never a competitor's, never stock. Renders and the 3D views are built from the yard's photos and say so.
- **The original logo** stays. It is cleaned up, not redesigned.
- **Pack sizes come from the warehouse spreadsheet**, through `PACKING` in `data.js`. Never type a coverage figure by hand; the calculator, the builder, the bag and the checkout all compute from that one table.
- **The wet look is simulated** and labelled as such until the yard's hosed photographs are in.
- **The delivery bands** in `data.js` are marked indicative until the real rates arrive. Free over £500 inside the M25 and 3–5 working days are the store's own published terms.
- **The offer pop-up** reads the real was/now prices. It never shows on the bag, checkout or builder, only once a week per visitor, and Escape closes it. Don't turn it into a discount code the yard hasn't agreed.
- **Text over photographs** must stay readable: `node scripts/audit/overphoto.cjs` measures it. Small print never below 12 px.
- **Both themes, three widths.** Check dark and light, and 400 px, 768 px and 1440 px, before pushing anything visual.

### Things not to touch

- `web/scripts/protect.mjs`, `web/scripts/inline.mjs` and the workflow file: they are the password gate. If the gate breaks, the site is either open or blank.
- `web/scripts/photos.py` beyond adding entries to its two manifests.
- Anything under `present/shots/` by hand; it is regenerated.

---

## Part 2 — For Nitya Stones: where things stand

### What exists

A complete new front end for nityastones.co.uk, viewable now at the preview link above (password from Fee or Coleisha).

- All 36 ranges as listed on the current store, with every price and sale price, plus the cladding shown as its six colourways. 136 of the store's own photographs, graded to sit together, and a studio render of every slab.
- Every product page: unit table (per m², per slab, per pack), order by the pack or by the area, loose slabs to make up the metreage (mixed packs in their four sizes), delivery date, collection line, the photographs, and the stone in 3D: one slab, laid in its pattern, dry or wet.
- The shop, collections, offers, samples, a patio builder, an area calculator, nine guides with drawings, 23 project photographs, trade and contact pages, dark and light themes, and a pop-up built from the real offers.
- A bag and a checkout that stop at the last step. **No payment is taken and nothing is stored.**
- A twenty-three page owner pack (PDF) with the current site beside the new one, the decisions needed, and a presenter script.

### What it is not yet

Connected. The site does not talk to WooCommerce or to the warehouse stock tracker, so it cannot take an order. The blog (45 articles) and the legal pages are not moved. The domain still points at the old site.

### Who is doing what

| | |
|---|---|
| **Fee** | The DNS switch on go-live day, and connecting the site to WooCommerce and to the warehouse script. |
| **Coleisha** | Everything on the site itself from now on: copy, photographs, prices when they change, the look, the pack. Works from the yard, so she can check facts across the counter. |
| **Nitya Stones** | The answers and assets in the next section, and a WordPress/WooCommerce administrator to issue keys. |

### What we need from Nitya Stones

**Access (for Fee)**
1. A WooCommerce REST API key (WooCommerce → Settings → Advanced → REST API → Add key, Read/Write): the consumer key and secret.
2. The payment plugins in use (Stripe, PayPal, Klarna, WooPayments) and their test-mode keys.
3. Shipping zones and rates entered in WooCommerce, or the rates on paper for us to enter.
4. A WordPress admin login or a staging copy, for the blog and legal pages and the redirects.
5. View access to the "stock tracker main" Google Sheet and the web app's deployment URL, and who maintains the script.
6. Nearer the day: DNS access for nityastones.co.uk.

**Answers (for Coleisha to put on the site)**
7. Cladding: which of the six colourway photographs is Mandawar, Kandla Grey, Jack Black and Rock Face Mint, and what the other two are called.
8. Delivery today: still 3–5 working days and free over £500 inside the M25? Any charge to split a pack? Any cutting to size?
9. Copy to confirm or strike: "trading since 2016", "price match", "own quarries in India", samples at £5, what a trade account includes.
10. Five store listings to correct so they match the warehouse sheet: Kandla Grey 900 × 600 (18.90 → 21.60 m²), Black Limestone (18 m² at 20 mm → 38 slabs at 22 mm), Bodo White, Noor Grigio and HS Beige (28.08 → 21.60 m²), Fossil Mint (mixed pack → 900 × 600 pack of 37), the 16 mm pallets (28.08 → 28.80 m²). And add Sinai Pearl to the sheet; it is the one range missing.
11. Which WooCommerce stays as: the till (recommended), with each order copied to the sheet, or retired in favour of the sheet plus a hosted payment page.

**Assets (for Coleisha)**
12. The photographs the yard already has, as full-size originals rather than through WhatsApp: straight-down slab shots dry and hosed, laid patios, finished gardens. A shared folder or a memory stick at the yard.
13. The logo as a vector or a large file, for print and the favicon.
14. A Google Business or Trustpilot link if one exists, and any written reviews with the customer's permission.
15. Prices for the fifteen Essentials lines (Joint-Tec and Por-Tec jointing compounds, primer, step treads, edging, granite setts and cobbles). They are on the site now from the warehouse sheet, marked "priced at the counter"; a customer can ask for a price with their order. With prices they become ordinary products.

### Hosting and ownership

The site is a static build and needs no server of its own. The preview runs on GitHub Pages, which is right for a password-gated demo and wrong for the live site (no redirect rules, no custom-domain tooling, a bandwidth cap). For go-live:

- **Cloudflare Pages**, in an account created with a Nitya Stones email, with Fee and Coleisha as members. Free for commercial use; builds from GitHub on every push as the preview does now; custom domain, HTTPS and redirect rules for the old blog addresses; server functions on the same plan if one is ever needed. Vercel would work but its free tier forbids commercial use.
- **The GitHub repository** transferred to an organisation the company owns, or Coleisha added as a collaborator until then.
- **WordPress stays** as the till and the blog, moved to a subdomain; the new site takes the main address. Nothing is deleted until the redirects are in.
- **No secrets in the front end.** The WooCommerce key and the stock tracker's shared secret never go in the site's code. The stock tracker syncs with WooCommerce (orders out by WooCommerce webhook, stock in by a timed push from the script), and the site talks only to WooCommerce's public Store API. See `present/Nitya-Stones-Stock-Tracker-Link.pdf`. The step-by-step is in `DEPLOY.md`.

### Going live, in order

1. Copy confirmed and corrected (Nitya Stones, Coleisha).
2. Photographs in; simulated wet view replaced (Coleisha).
3. WooCommerce and the stock sheet connected; a test order placed end to end (Fee).
4. Blog and legal pages moved across with redirects from every old address (Coleisha, with Fee for the redirects).
5. Real delivery rates entered (Nitya Stones, Coleisha).
6. Domain switched; the old site stays up until the owner says otherwise (Fee).

### Reading

- `wiki/README.md`: the build wiki, the reference for everything here in more depth.
- `COMPETITOR.md`: Royale Stones, what they do well, what the site took from them and what it left alone, and the yard's price position against them.
- `OPTIONS.md`: the full decisions list, in more detail than above.
- `AUDIT.md`: every check the site has passed and how to run it again.
- The owner pack PDF, for the screen-by-screen story.
