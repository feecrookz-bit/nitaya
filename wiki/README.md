# Nitya Stones website: the build wiki

Reference for the new nityastones.co.uk, written 14 September 2026 for review once the deal is done and for use afterwards. Everything here describes the `main` branch on that date. Where a fact is a decision still owed by the yard, it says so and points at `OPTIONS.md`.

| Page | What it covers |
|---|---|
| [1. Overview](01-overview.md) | What was built, what it is not yet, the numbers, where everything lives |
| [2. Architecture](02-architecture.md) | Stack, file map, the three builds, routing, state, themes, type |
| [3. Data model](03-data-model.md) | Products, packing and the quantity maths, prices, essentials, delivery bands, filters and search |
| [4. Pages and features](04-pages-and-features.md) | Every route and what is on it; the order box, calculator, builder, 3D, gallery, pop-up, checkout calendar |
| [5. Photographs and assets](05-photos-and-assets.md) | The photo pipeline, manifests, studio renders, textures, logo, fonts |
| [6. Build and deploy](06-build-and-deploy.md) | Commands, the password gate, GitHub Pages, Cloudflare, redirects, the path shim |
| [7. Audits](07-audits.md) | Every check, what it catches, how to run it, the go-live audit |
| [8. Integrations](08-integrations.md) | WooCommerce, the stock tracker, the no-secrets rule, the field list |
| [9. Rules, decisions and open items](09-decisions.md) | The rules the site is built to, what the yard still owes, where those lists live |
| [10. Glossary](10-glossary.md) | The words used in the code and the documents |
| [11. History](11-history.md) | The build day by day, from the commit log |
| [12. Stock system](12-stock-system.md) | The yard's own ledger: plan, seed, shared maths, the Worker API, phase status |

The other documents in the repository, and what each is for:

- `HANDOVER.md`: for Coleisha (working on the site) and for the company (where things stand, who does what, what is needed).
- `DEPLOY.md`: the GitHub transfer, Cloudflare, old-address redirects, go-live order, ownership.
- `OPTIONS.md`: every decision and asset still needed from the yard, in full.
- `COMPETITOR.md`: the Royale Stones study and what was taken from it.
- `UPDATES.md`: what changed after the owner meeting, separate from the pack.
- `web/AUDIT.md`: what has been checked, what was found, how to re-run.
- `web/PHOTOGRAPHY.md`: where better photographs come from, range by range.
- `present/`: the owner pack (PDF and source), the presenter script, the stock tracker brief, and a PDF copy of this wiki (`Nitya-Stones-Build-Wiki.pdf`).
