# Stock system: the staff app

The screens the yard and the office use, at `admin.nityastones.co.uk`. Talks to the Worker in `../api` under `/api`.

## Run it locally

```
(cd ../api && npm run dev)     # the Worker on 8787
npm install
npm run dev                    # http://localhost:5173, proxied to the Worker as /api
```

You are signed in as the Worker's `DEV_USER` (an admin), so every screen shows.

## Put it live

The app is served by the API Worker (`../api/wrangler.toml`, `[assets]` block) from this folder's `dist`, so there is no separate project: `npm run build` here, then `npm run deploy` in `../api`. Live at https://nitya-stock-api.coleisha.workers.dev; `admin.nityastones.co.uk` is added as a custom domain on that Worker once the domain's DNS is on Cloudflare. Sign-in is one Cloudflare Access application on the hostname, covering `/api/*` too (see `../api/README.md`, "What is done and what is left").

## Screens (Phase 0)

Today (counts from the ledger), Stock (search, available, on hand, allocated), a product (packing, stock, the area calculator with the site's maths, movements), Users (admin: who signs in, with which role).
