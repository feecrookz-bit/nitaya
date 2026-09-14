# Deploying: GitHub transfer and Cloudflare Pages

The site is a static build. The preview lives on GitHub Pages behind a password; the live site goes on Cloudflare Pages in an account the company owns. This file is the order of operations. Written 14 September 2026.

## 1. Transfer the GitHub repository

Do this first; Cloudflare connects to wherever the repository ends up.

1. The company creates a GitHub organisation (or a GitHub account in the business's name) and adds Fee and Coleisha as members.
2. On github.com/feecrookz-bit/nitaya: Settings → General → Danger Zone → **Transfer**. Type the new owner. GitHub keeps redirects from the old address, so clones and the Pages workflow keep working.
3. **Secrets do not transfer.** Straight after: Settings → Secrets and variables → Actions → add `SITE_PASSWORD` again. Without it the preview workflow stops with an error rather than publishing the site open; that is by design.
4. Settings → Pages: confirm the source is the `gh-pages` branch, root. The preview address becomes `https://<new-owner>.github.io/nitaya/`; the build path `/nitaya/` is unchanged. Pass the new address on to whoever has the old one.
5. Push any commit (or run the workflow by hand under Actions) and check the preview unlocks.

## 2. Create the Cloudflare Pages project

In a Cloudflare account created with a Nitya Stones email, with Fee and Coleisha added as members (Manage Account → Members).

1. Workers & Pages → Create → Pages → **Connect to Git** → pick the transferred repository, production branch `main`.
2. Build settings:

   | Setting | Value |
   |---|---|
   | Framework preset | None |
   | Root directory | `web` |
   | Build command | `npm run pages` |
   | Build output directory | `publish` |

   Node 22 is pinned by `web/.node-version`; `web/.npmrc` carries the install flag the dependencies need. Nothing else to set.
3. Environment variables (Settings → Environment variables, production):
   - While previewing: `SITE_PASSWORD` = the preview password. The Cloudflare copy is then the same gated site as the GitHub one.
   - At go-live: remove `SITE_PASSWORD` and add `PUBLIC_SITE` = `true`. The build refuses to run with neither, so a lost variable can never publish the site open by accident.
4. Save and deploy. The project gets a `*.pages.dev` address; every push to `main` rebuilds it, exactly as the GitHub preview does.

What the build does (`web/scripts/pages.mjs`): the same steps as the GitHub workflow, at the domain root instead of `/nitaya/`, and without a `404.html`, so Cloudflare serves the site for any address and the router takes over.

## 3. Old addresses

Every address on the current store is mapped in `web/public/_redirects`, which Cloudflare reads and GitHub ignores:

- The 40 product listings go to their new product pages; the four samples to Samples; the category pages to the shop filtered by category; about, contact, wholesale, FAQs, designer and services to their new pages.
- The blog (45 posts), the legal pages (privacy, terms, refunds, delivery terms) and My Account go to WordPress, which stays up on a subdomain until they are moved across. The file uses `wp.nityastones.co.uk` as the working name for that subdomain. **Decide the real name before go-live and replace it in the file** (one find-and-replace).
- Two product addresses on the old store begin with an invisible character (`%e2%81%a0`). Check those two on the first deploy; if Cloudflare does not match the encoded form, add the decoded form beside it.

A path typed without the `#` (`/product/raj-green`) also works: a five-line script in `web/index.html` turns it into the router's address.

`web/public/_headers` sets long caching on the hashed asset files and the usual safety headers.

## 4. Going live

1. Copy, prices and photographs confirmed (HANDOVER.md, "What we need").
2. WooCommerce connected and a test order placed end to end on the `pages.dev` address.
3. WordPress moved to the subdomain chosen in step 3 above; `_redirects` updated; WooCommerce's own address settings updated to match.
4. In Cloudflare Pages → Custom domains, add `nityastones.co.uk` and `www.nityastones.co.uk`. Cloudflare shows the DNS records needed. If the domain's DNS is moved to Cloudflare (recommended: one place for DNS, the site and the WordPress subdomain), it does this itself.
5. Switch `SITE_PASSWORD` for `PUBLIC_SITE=true` and redeploy. Check the home page, a product page, an old product address and an old blog address.
6. Leave the old site reachable on its subdomain until the owner says otherwise. Submit the new address in Google Search Console.

## 5. Ownership at the end

| | Owner | Members |
|---|---|---|
| GitHub repository | Company organisation | Fee, Coleisha |
| Cloudflare account (Pages, DNS) | Company | Fee, Coleisha |
| Domain registrar | Company (as now) | Fee for the DNS work |
| WordPress / WooCommerce | Company (as now) | Fee for the API keys |

Nothing in the deployment depends on Fee's personal accounts once these four are in place.
