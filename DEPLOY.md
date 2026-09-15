# Deploying: GitHub transfer and Cloudflare Pages

The site is a static build. The preview lives on GitHub Pages behind a password; the live site goes on Cloudflare Pages in an account the company owns. This file is the order of operations. Written 14 September 2026.

## 1. Transfer the GitHub repository

Do this first; Cloudflare connects to wherever the repository ends up.

1. The company creates a GitHub organisation (or a GitHub account in the business's name) and adds Fee and Coleisha as members.
2. On github.com/feecrookz-bit/nitaya: Settings → General → Danger Zone → **Transfer**. Type the new owner. GitHub keeps redirects from the old address, so clones and the Pages workflow keep working.
3. **Secrets and variables do not transfer.** Straight after: Settings → Secrets and variables → Actions → add the secret `SITE_PASSWORD` again, and the repository variable `PUBLIC_PREVIEW` = `true` if the preview is to stay open. With neither set the preview workflow stops with an error rather than publishing the site open; that is by design.
4. Settings → Pages: confirm the source is the `gh-pages` branch, root. The preview address becomes `https://<new-owner>.github.io/nitaya/`; the build path `/nitaya/` is unchanged. Pass the new address on to whoever has the old one.
5. Push any commit (or run the workflow by hand under Actions) and check the preview unlocks.

## 2. Create the Cloudflare Pages project

In a Cloudflare account created with a Nitya Stones email, with Fee and Coleisha added as members (Manage Account → Members).

**The way it is set up now (no dashboard clicks):** the site runs as a Cloudflare Worker serving the static build (`web/wrangler.jsonc`: assets from `publish/`, unknown paths served by `index.html` for the router). `.github/workflows/cloudflare.yml` builds and deploys it with wrangler on every push to `main`; by hand it is `npx wrangler deploy` from `web/`. It needs two repository secrets, `CLOUDFLARE_API_TOKEN` (an API token with Account → Workers Scripts → Edit) and `CLOUDFLARE_ACCOUNT_ID`. First deployed 15 September 2026 into the company's own account (Coleisha's company email), at https://nitya-stones.coleisha.workers.dev, open with a noindex tag like the GitHub preview; the go-live audit against it reports no findings. The gate follows the same variables as the GitHub preview (`PUBLIC_PREVIEW`, `SITE_PASSWORD`, and `PUBLIC_SITE` for go-live). Custom domains are added in the dashboard under the Worker's Settings → Domains & Routes (section 5).

**The dashboard way, if preferred instead:**

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
   - While previewing: `SITE_PASSWORD` = the preview password, or `PUBLIC_PREVIEW` = `true` for the open preview with a noindex tag. The Cloudflare copy is then the same site as the GitHub one.
   - At go-live: remove `SITE_PASSWORD` and add `PUBLIC_SITE` = `true`. The build refuses to run with neither, so a lost variable can never publish the site open by accident.
4. Save and deploy. The project gets a `*.pages.dev` address; every push to `main` rebuilds it, exactly as the GitHub preview does.

What the build does (`web/scripts/pages.mjs`): the same steps as the GitHub workflow, at the domain root instead of `/nitaya/`, and without a `404.html`, so Cloudflare serves the site for any address and the router takes over.

## 3. Old addresses

Every address on the current store is mapped in `web/public/_redirects`, which Cloudflare reads and GitHub ignores:

- The 40 product listings go to their new product pages; the four samples to Samples; the category pages to the shop filtered by category; about, contact, wholesale, FAQs, designer and services to their new pages.
- The blog (45 posts), the legal pages (privacy, terms, refunds, delivery terms) and My Account go to WordPress, which stays up on a subdomain until they are moved across. The file uses `wp.nityastones.co.uk` as the working name for that subdomain. **Decide the real name before go-live and replace it in the file** (one find-and-replace).
- Two product addresses on the old store need a check on the first deploy. See "The two odd addresses" below.

A path typed without the `#` (`/product/raj-green`) also works: a five-line script in `web/index.html` turns it into the router's address.

`web/public/_headers` sets long caching on the hashed asset files and the usual safety headers.

### The two odd addresses

On the current store, Noor Grigio Porcelain and Light Grey Porcelain were typed in with an invisible character at the start of their names (the kind that comes along when a name is pasted from a phone). WordPress builds a product's web address from its name, so those two addresses carry the invisible character too. In the address bar it appears as `%e2%81%a0`:

```
https://nityastones.co.uk/product/%e2%81%a0noor-grigio-porcelain/
https://nityastones.co.uk/product/%e2%81%a0light-grey-porcelain/
```

A redirect only fires when the address matches exactly. Some systems compare the spelled-out form (`%e2%81%a0…`); others turn it back into the invisible character first, and then the two no longer look the same. Which way Cloudflare goes can only be seen once the project exists.

To check, once the project has its `pages.dev` address:

1. In a browser, open the project address with the old path on the end:
   `https://<project>.pages.dev/product/%e2%81%a0noor-grigio-porcelain/`
2. If the Noor Grigio product page opens, the redirect works. Do the same for Light Grey and stop here.
3. If the home page opens instead, the match failed. Open `web/public/_redirects`, find the two lines that begin `/product/%e2%81%a0`, and add a copy of each line directly beneath with the real invisible character in place of `%e2%81%a0` (paste it from the old product's address bar). Push, wait for the rebuild, and open the address again.

The other thirty-eight product addresses are ordinary letters and dashes and need no check.

**Found on the first Cloudflare deploy (15 September 2026):** browsers send the invisible character's encoding in capitals (`%E2%81%A0`) and Cloudflare matches the rule text literally, so a rule written in lower case only worked from tools like curl. Both spellings are now in the file, and the audit checks both. Nothing further to do here.

## 3a. The staff address: admin.nityastones.co.uk

The stock system (`wms/`) lives at `admin.nityastones.co.uk`, in the same Cloudflare account, once the domain's DNS is on Cloudflare:

1. A second Pages project from the same repository: root directory `wms/app`, build command `npm run build`, output `dist`; custom domain `admin.nityastones.co.uk`.
2. The Worker (`wms/api`): `npx wrangler d1 create nitya-stock`, the id into `wrangler.toml`, `npm run migrate`, `npm run deploy`. Its route `admin.nityastones.co.uk/api/*` is in the file, so the API sits next to the app on one hostname.
3. Zero Trust → Access → Applications → a self-hosted application for `admin.nityastones.co.uk`, policy: the staff emails or the company's Google Workspace domain. Its audience tag becomes the Worker's `ACCESS_AUD`. Nobody outside that policy sees a byte of the staff app or the API.
4. The first admin's email is in `wms/api/migrations/0003_first_admin.sql` before the migrations run; that admin adds everyone else from the Users screen.

Until the DNS is on Cloudflare there is no `admin.nityastones.co.uk`: the app deploys to its `pages.dev` address and the Worker to its `workers.dev` address, and Access goes on those instead. The step-by-step is in `wms/api/README.md` and `wms/app/README.md`.

## 4. The final audit

One script checks everything in sections 2 and 3 against the deployed site, including the two odd addresses. Run it from `web/` after the first Cloudflare deploy and again after go-live:

```
BASE=https://<project>.pages.dev node scripts/audit/golive.cjs
BASE=https://nityastones.co.uk EXPECT=open node scripts/audit/golive.cjs
```

It prints one line per check and "NO FINDINGS" at the end, or a FAILED list saying exactly which redirect, header or page is wrong. To rehearse it before the Cloudflare project exists: `PUBLIC_SITE=true npm run pages`, then `npm run preview:pages` in one terminal and `EXPECT=open node scripts/audit/golive.cjs` in another.

## 5. Going live

1. Copy, prices and photographs confirmed (HANDOVER.md, "What we need").
2. WooCommerce connected and a test order placed end to end on the `pages.dev` address.
3. WordPress moved to the subdomain chosen in step 3 above; `_redirects` updated; WooCommerce's own address settings updated to match.
4. In Cloudflare, Workers & Pages → nitya-stones → Settings → Domains & Routes, add `nityastones.co.uk` and `www.nityastones.co.uk`. Cloudflare shows the DNS records needed. If the domain's DNS is moved to Cloudflare (recommended: one place for DNS, the site and the WordPress subdomain), it does this itself.
5. Switch `SITE_PASSWORD` for `PUBLIC_SITE=true` and redeploy. Check the home page, a product page, an old product address and an old blog address.
6. Leave the old site reachable on its subdomain until the owner says otherwise. Submit the new address in Google Search Console.

## 6. Ownership at the end

| | Owner | Members |
|---|---|---|
| GitHub repository | Company organisation | Fee, Coleisha |
| Cloudflare account (Pages, DNS) | Company | Fee, Coleisha |
| Domain registrar | Company (as now) | Fee for the DNS work |
| WordPress / WooCommerce | Company (as now) | Fee for the API keys |

Nothing in the deployment depends on Fee's personal accounts once these four are in place. Once the build is paid for, Nitya Stones owns everything on the site; upgrades and changes are arranged through Coleisha.
