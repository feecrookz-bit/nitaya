# 12. Stock system

The yard's own stock system, planned on 15 September 2026 when the existing tracker was slow to open up. The full plan is `wms/PLAN.md`; this page is the map and the status.

## What exists

| Part | Where | State |
|---|---|---|
| Plan | `wms/PLAN.md` | Written: jobs, principles, architecture, codes, data model, screens, phases, decisions |
| Seed | `wms/seed/products.csv` | The warehouse sheet with a code per line: 109 rows, 72 active codes, 11 flagged |
| Shared pack maths | `wms/shared` (`@nitya/packing`) | `coverOf`, `mixFill`, `quantify`, `packFrom`; nine tests pass |
| API | `wms/api` | Cloudflare Worker over D1: schema, seed migration, Access sign-in with roles, products, quantify, stock, users, public availability |
| Staff app | `wms/app` | Not started (Phase 1) |

## Phase 0: done

Acceptance (`wms/api/scripts/smoke.mjs`, against the local Worker): every seed row in the database (88 products, 78 active, 48 matched to site products, 36 mixed-pack components), the Raj Green mixed pack covers 18.19 m² in 60 slabs, 55 m² of Autumn Brown is 3 packs + 2 loose slabs = 55.01 m² (the same answer the site gives), 26.4 m² of Quartz White is 1 pallet + 9 slabs, the stock view answers for every active product, the public availability route answers by site id, an admin can list users, an unknown route is 404.

Two things learned on the way, both now in the code:

- The sheet rounds m² per slab to two decimals (0.17 for 600 × 290, 0.08 for 290 × 290), which shrinks a mixed pack to 18.08 m². The seed computes m² from the stated dimensions instead, exact to the millimetre, and uses the sheet's figure only where there are no dimensions.
- Wrangler environments do not inherit bindings; the dev environment declares the database again.

## How it fits

The site keeps its own product file for copy and photographs; the stock system is the authority on packing and availability. `site_id` on a product row ties the two. The site's `PACKING` table and the seed agree today; when the shared package is imported by the site (a small change, later), there is one source.

WooCommerce is not in the system. When it joins, its order webhook posts to the web-order route and the Worker pushes availability into its stock field, both on the same Worker.

## Next

Phase 1: the movements routes (goods in, adjustment, count, transfer, breakage) and the first screens of the staff app (Today, Stock, Goods in, Counts). Then orders, deliveries, the site link, notifications and reports, as the plan sets out.
