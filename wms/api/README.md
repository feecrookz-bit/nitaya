# Stock system API

The Worker over D1 that the staff app, the site and (later) WooCommerce talk to. The plan is `../PLAN.md`; the pack maths is `../shared`.

## Run it locally

```
npm install
npm run seed             # wms/seed/products.csv -> migrations/0002_seed.sql
npm run migrate:local    # creates the local database and applies every migration
npm run dev              # http://localhost:8787, signed in as DEV_USER from wrangler.toml [env.dev]
node scripts/smoke.mjs   # Phase 0 acceptance, in another terminal
```

Local development signs you in as `DEV_USER` (see `wrangler.toml`, `[env.dev]`); `migrations/0003_first_admin.sql` gives that email the admin role. Nothing is verified locally. In production `DEV_USER` is empty and every staff request must carry a Cloudflare Access token.

## The staff address

One Worker serves both: the staff app's built files (`../app/dist`, the `[assets]` block in `wrangler.toml`) at the root, and this API under `/api/*` (`run_worker_first`). Same hostname, so the app's calls are same-origin and carry the sign-in cookie. **Live since 15 September 2026 at https://nitya-stock-api.coleisha.workers.dev** in the company's Cloudflare account, database created and migrations applied. Once the domain's DNS is on Cloudflare, add `admin.nityastones.co.uk` as a custom domain on this Worker (Settings → Domains & Routes); nothing else changes.

## What is done and what is left

Done: `wrangler d1 create nitya-stock` (id in `wrangler.toml`), `npm run migrate` (0001 schema, 0002 seed, 0003 first admin, whose email was then set to the real first admin's with one `UPDATE`), `npm run build` in `../app`, `npm run deploy`. `/api/public/availability` answers from the seeded stock; every other route answers 401 until Access is in front.

Left, in the dashboard (about ten minutes, needs an account owner):

1. Zero Trust → **Enable Access** (choose a team name; the free plan covers this). The account has never had it on.
2. Access → Applications → Add a self-hosted application for the Worker's hostname (later the custom domain too). Policy: allow the staff emails, or the company's Google Workspace domain if it has one. Sign-in by one-time code to email needs nothing else.
3. Copy the application's **Audience tag** and the team domain (`<team>.cloudflareaccess.com`) into `wrangler.toml` (`ACCESS_AUD`, `ACCESS_TEAM_DOMAIN`), leave `DEV_USER` empty, `npm run deploy`.
4. Check `/api/me` returns the first admin after signing in, then add the rest of the staff on the Users screen with their roles.

The public routes (`/public/*`) take no sign-in and answer only the site's origin (`PUBLIC_ORIGINS`). Put a Cloudflare rate-limit rule in front of them.

To redeploy after a change: `npm run build` in `../app` (if the app changed), then `npm run deploy` here, with `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the environment (the same token as the site's deploy workflow, which needs D1 → Edit as well as Workers Scripts → Edit).

## Routes (Phase 0)

| Method and path | Role | Returns |
|---|---|---|
| `GET /health` | any signed-in | ok and the time |
| `GET /me` | any | email, name, role |
| `GET /products`, `?all=1` | warehouse+ | products with stock; `all` includes retired lines |
| `GET /products/:code` | warehouse+ | one product with its components and packing |
| `POST /products/:code` | director+ | edit name, packing, active, min stock, site id, note; audited |
| `GET /quantify?code=&m2=` | warehouse+ | packs and loose units for an area, the site's maths |
| `GET /stock` | warehouse+ | on hand, allocated, available per product |
| `GET /stock/:code/movements` | warehouse+ | the ledger for one product |
| `GET /users`, `POST /users` | admin | list and upsert staff |
| `GET /public/availability?ids=` or `?codes=` | none | available per product, cached five minutes |

Phase 1 adds movements (goods in, adjustments, counts, transfers); Phase 2 orders; Phase 3 deliveries; Phase 4 the web order route.
