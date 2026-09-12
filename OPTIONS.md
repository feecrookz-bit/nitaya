# Nitya Stones — website upgrade: what the demo is, and the options on the table

Preview: https://feecrookz-bit.github.io/nitaya/ (password-gated)  ·  Repo: web/

## What the demo already does (no backend)

- Full storefront: shop by range, 36 product pages with live shop prices,
  samples, bag, checkout flow, Build Your Patio, Collections, Guides, About,
  FAQ, Contact. Studio-rendered product imagery from the yard's own photos,
  cinematic customer-garden photography, 3D slab, wet/dry slider, delivery
  estimate by postcode, guide diagrams.
- Everything runs in the browser. Nothing is charged; nothing is emailed;
  nothing is stored beyond the visitor's own device.

## What "going live" adds (the commit)

| Item | What it is | Indicative cost |
|---|---|---|
| Payments + orders | Wire checkout to WooCommerce (existing) or Stripe; order emails; stock counts | Build time only; Stripe/Woo fees ~1.5–2% per card payment |
| Hosting + domain | Point nityastones.co.uk at the new build; SSL | Free on GitHub Pages / Cloudflare Pages; domain already owned |
| Delivery rates | Replace the indicative bands in `web/src/data.js` (DELIVERY) with the yard's real per-pallet rates | None — yard's figures |
| Photography | Straight-down shots of Bodo White, Fossil Mint, HS Beige, Himalayan White; one hosed-slab photo per sandstone for the wet/dry slider; a 20-second phone video for the hero | Half a day at the yard |
| Newsletter | Connect the form to a list (Mailchimp/Brevo free tiers) | Free at their volume |
| Reviews | Google Business review link on order confirmation; import to the site | Free |
| Instagram feed | Switch the account to Business, embed the feed | Free |
| Password | Remove the preview gate at launch (or keep for staging) | None |

## Option: "See it laid" visualiser

Customers upload a photo of their garden and see the stone laid on it — the
paving equivalent of virtual try-on. Three routes:

| Route | Customer experience | Cost | Notes |
|---|---|---|---|
| Roomvo (used by Quorn Stone) | Upload a photo or pick a demo room; tool lays the tile on the floor plane | Free for dealers (Roomvo PRO for lead tracking is paid) | One-line embed; SKUs need a seamless top-down texture each; indoor-first; leads live in Roomvo's system |
| Paid SaaS (TilesView, Tile Visualizer, Tiles Display) | Same, plus 360° rooms and QR flows | ~£70–£190 / month (TilesView $87–$234) | Interior-first; monthly fee forever |
| Built into this site | Photo → tap the four corners of the patio → real laying pattern in the chosen stone, joint and finish is perspective-mapped onto the photo; save and share | No licence; ~2–3 days of build | Uses textures and pattern engine already in the site; needs the remaining straight-down textures. No automatic masking of furniture unless a segmentation API is added (~1–5p per photo) |
| Add-on: AR single slab | "See it in your garden" via Apple Quick Look / Android Scene Viewer | Free | Exports the existing 3D slab as GLB; one slab, not a laid patio |

Recommendation if the owner wants it: build it into the site (no fee,
on-brand, drives the £5 sample), add the free AR slab, and trial Roomvo in
parallel as a zero-cost benchmark.
