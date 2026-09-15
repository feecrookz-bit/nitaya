# The yard's stock system: a note for Simar

15 September 2026. From Fee, for Simar, who maintains the "stock tracker main" sheet and script.

## What we have built

Nitya Stones now has a stock system of its own, built from the warehouse sheet you sent. Nothing is waiting on the tracker any more, and none of what follows needs code from you.

| Part | State |
|---|---|
| Products and packing | Every line of the sheet with a product code, slabs per pallet, per box, m² per slab, and the four sizes of a mixed pack. 88 lines, 78 active |
| The ledger | Every stock movement recorded and signed: goods in, sale, dispatch, collection, breakage, adjustment, transfer, return. Stock on hand, allocated and available are computed from it, never typed over |
| Pack maths | Shared with the website, so 55 m² of Autumn Brown is 3 packs + 2 loose slabs in both places |
| Sign-in and roles | By email, four roles (admin, director, office, warehouse), every change audited |
| Screens today | Today, Stock with search, a product page with packing, stock, an area calculator and the movement history, Users |
| Next | Goods in, counts and adjustments; then orders, deliveries with proof, the website posting orders, notifications and reports |

## Where it will live

It is on the internet now, in the company's Cloudflare account, at https://nitya-stock-api.coleisha.workers.dev. It moves to admin.nityastones.co.uk once the domain's DNS is on Cloudflare. You sign in with your email address after an admin adds you; there is no password to keep. Until the sign-in is switched on (a dashboard step for Coleisha) the address shows the app but lets nobody in.

## The product codes

Family, colour, size, thickness: `SS-RAJGREE-MIX-22` is sandstone, Raj Green, mixed patio pack, 22 mm; `PC-QUARWHIT-600X900-20` is porcelain, Quartz White, 900 × 600, 20 mm; `CH-JOINBLAC-15KG` is Joint-Tec Pitch Black in a 15 kg bucket. A mixed pack is one code; its four sizes are rows under it. The full list is the spreadsheet sent with this note.

## Four things we need from you

1. **Check the flagged rows.** The table below lists every row that needs a decision: a colour listed twice at the same size and thickness (which is current?), and the four porcelain names that differ from the store's listings.
2. **A stock count as the opening balance.** The quantity on the ground for every active line, in slabs, boxes or buckets, counted on one agreed day. This becomes the first movement per product, so the ledger starts true. Your inventory tab is the natural source.
3. **Add the code column to your sheet.** One column, so both systems name things the same while both exist.
4. **When convenient, an export of your stock transactions tab** (date, product, quantity, type), so past movements can be imported with their real dates. Optional.

## The flagged rows

| Code | Colour | Size | Sheet says | Question |
|---|---|---|---|---|
| `PC-CLORMIDN-600X600-16` | Clorado Light Midnight | 600/600 · 16 mm | active | name differs from the store listing |
| `PC-CLORSUMM-600X600-16` | Clorado Light Summer | 600/600 · 16 mm | active | name differs from the store listing |
| `PC-CLORGREY-600X600-16` | Clorado Dusk Grey | 600/600 · 16 mm | active | name differs from the store listing |
| `SS-AUTOBROW-MIX-22` | Autom Brown | 600/900 · 22 mm | active | name differs from the store listing |
| `SS-AUTOBROW-MIX-22` | Autom Brown | 600/600 · 22 mm | active | name differs from the store listing |
| `SS-AUTOBROW-MIX-22` | Autom Brown | 290/600 · 22 mm | active | name differs from the store listing |
| `SS-AUTOBROW-MIX-22` | Autom Brown | 290/290 · 22 mm | active | name differs from the store listing |
| `SS-AUTOBROW-MIX-18` | Autom Brown | 600/900 · 18 mm | inactive | name differs from the store listing |
| `SS-AUTOBROW-MIX-18` | Autom Brown | 600/600 · 18 mm | inactive | name differs from the store listing |
| `SS-AUTOBROW-MIX-18` | Autom Brown | 290/600 · 18 mm | inactive | name differs from the store listing |
| `SS-AUTOBROW-MIX-18` | Autom Brown | 290/290 · 18 mm | inactive | name differs from the store listing |

The store lists the 16 mm 600 × 600 pallets as Beige, Light Grey and Black; the sheet has Clorado Light Summer, Dusk Grey and Light Midnight. We have matched them in that order. Please confirm.

## If the tracker stays alongside

Then the two entry points in the earlier brief still apply, on the same terms: a fixed web app address, a shared secret, and stable field names. Nothing waits on them now.
