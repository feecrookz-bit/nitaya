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

`admin.nityastones.co.uk`: the staff app (a Cloudflare Pages project with that custom domain) at the root, this Worker under `/api/*` (a route in `wrangler.toml`), and one Cloudflare Access application covering the hostname so both are behind the same sign-in. Both need the domain's DNS on Cloudflare, which DEPLOY.md sets up; until then the Worker deploys to its `workers.dev` address and the app to its `pages.dev` address, and Access is put on those.

## Put it live (once, in the company's Cloudflare account)

1. `npx wrangler login`, then `npx wrangler d1 create nitya-stock`. Paste the id it prints into `wrangler.toml` under `database_id`.
2. Edit `migrations/0003_first_admin.sql` to the real first admin's email, then `npm run migrate`.
3. Zero Trust → Access → Applications → Add a self-hosted application for the staff address (the Pages project the app will deploy to, and this Worker's route). Policy: allow the emails of the staff, or the company's Google Workspace domain. Copy the application's **Audience tag** and the team domain (`<team>.cloudflareaccess.com`).
4. `npx wrangler secret put ACCESS_AUD` and set `ACCESS_TEAM_DOMAIN` in `wrangler.toml` (or as a secret). Leave `DEV_USER` empty.
5. `npm run deploy`. Check `/health` opens and `/me` returns the first admin after signing in through Access.
6. Add the rest of the staff with `POST /users` (the app's Users screen, once built) with their role.

The public routes (`/public/*`) take no sign-in and answer only the site's origin (`PUBLIC_ORIGINS`). Put a Cloudflare rate-limit rule in front of them.

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
