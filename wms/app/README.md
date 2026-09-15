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

1. Workers & Pages → Create → Pages → connect the repository. Root directory `wms/app`, build command `npm run build`, output `dist`.
2. Custom domains → add `admin.nityastones.co.uk` (the domain's DNS must be on Cloudflare; DEPLOY.md).
3. The Worker's route `admin.nityastones.co.uk/api/*` (in `../api/wrangler.toml`) puts the API next to the app on the same hostname, so calls are same-origin and carry the sign-in cookie.
4. Zero Trust → Access → Applications → one self-hosted application for `admin.nityastones.co.uk` (covering `/api/*` too). Policy: the staff emails or the company's Google Workspace domain. Its audience tag goes into the Worker's `ACCESS_AUD`.

## Screens (Phase 0)

Today (counts from the ledger), Stock (search, available, on hand, allocated), a product (packing, stock, the area calculator with the site's maths, movements), Users (admin: who signs in, with which role).
