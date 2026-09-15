# 6. Build and deploy

The full step-by-step for the transfer and go-live is `DEPLOY.md`. This page explains the pieces.

## Commands (from `web/`)

| | |
|---|---|
| `npm ci` | Install. `.npmrc` carries the flag the dependencies need; `.node-version` pins Node 22 |
| `npm run dev` | Local site with live reload |
| `npm run build` | Static build to `dist/`; `BASE_PATH=/nitaya/` for the GitHub preview |
| `SINGLE=1 npm run build` | One self-contained file to `dist-single/` for the audits |
| `npm run pages` | The Cloudflare build to `publish/` |
| `npm run preview:pages` | Serve `publish/` locally the way Cloudflare does, on port 8788 |
| `npm run lint` | oxlint |

## The password gate

Two scripts, both under "things not to touch" in the handover:

- `scripts/inline.mjs` folds the built page's own script and stylesheet into one HTML file, and deletes them from `dist/`, so nothing the gate protects is also published in the clear. Images, fonts and the lazy 3D chunk stay as hashed files and load on demand: about 1 MB to unlock rather than 25.
- `scripts/protect.mjs` encrypts that file with AES-256-GCM under a key derived from the password (PBKDF2-SHA256, 250,000 iterations, random salt). What is published is ciphertext plus a small unlock form; the browser derives the key and decrypts locally. There is no back door: a lost password means republishing with a new one. The unlock remembers for the tab, and a deep link survives the gate.

## GitHub Pages (the preview)

`.github/workflows/pages.yml` runs on every push to `main`: install, build under `/nitaya/`, inline, protect with the `SITE_PASSWORD` secret, add `404.html` and `.nojekyll`, publish to the `gh-pages` branch. If the secret is missing it stops with an error rather than publishing the site open. The repository variable `PUBLIC_PREVIEW=true` publishes it open on purpose, with a noindex tag; the preview has been open since 15 September 2026 (the owner's decision after the first payment). Remove the variable and the gate returns on the next deploy. A deploy takes about half a minute; the audit compares the size of the live gate page with the local build to confirm it landed.

## Cloudflare Pages (the live site)

`scripts/pages.mjs` does the same job at the domain root, for Cloudflare to run on each push: gated when `SITE_PASSWORD` is set, open only when `PUBLIC_SITE=true`, and it refuses with neither. It writes no `404.html` on purpose: without one, Cloudflare serves the site with a 200 for any address, which the router and the path shim rely on.

Project settings: root directory `web`, build command `npm run pages`, output `publish`. Everything else is in the repository.

## Old addresses

`web/public/_redirects` maps every address on the current store: 40 products to their new pages, the four samples to Samples, categories to the filtered shop, about, contact, wholesale, FAQs, designer and services to their new pages, and the 45 blog posts, the legal pages and My Account to WordPress on a subdomain. The subdomain is written as `wp.nityastones.co.uk`, a working name to replace once decided.

Two of the old product addresses begin with an invisible character (`%e2%81%a0`); `DEPLOY.md` explains the check to run on the first deploy and the one-line fix if it fails.

`web/public/_headers` caches the hashed asset files for a year and sets the usual safety headers.

## The path shim

Five lines in `web/index.html` turn a path like `/product/raj-green` into the router's `/#/product/raj-green` before the app loads, keeping the query string. It is what makes the redirects and hand-typed addresses land on the right page.

## Ownership

At the end the GitHub repository is in a company organisation, the Cloudflare account and DNS are the company's, and Fee and Coleisha are members of both. Nothing depends on a personal account. `DEPLOY.md` section 6 has the table.
