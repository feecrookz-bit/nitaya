# The yard's own stock system: the plan

Written 15 September 2026. Simar's tracker is taking too long to open up, so this is the plan for a stock system of our own, built from what we already hold: the warehouse sheet (109 rows, 72 active product codes), the site's pack maths, the Cloudflare account the company will own, and the shape of the system the yard already uses. WooCommerce is not in this plan; it plugs in later as the till, through the same doorways.

## 1. What it has to do

The system the yard uses today, read from the screen Simar showed: a products list, an inventory, a ledger of stock transactions, staff logins with four roles (Admin, Director, Warehouse Staff, Office Staff), delivery proofs, notifications and PDF reports. Ours does the same jobs, in the same words, so nobody at the yard relearns anything:

| Job | What it means at Mark Road |
|---|---|
| Products | Every line the yard sells, with its packing: slabs per pallet, per box, m² per slab, the four sizes of a mixed pack. Seeded from the warehouse sheet, never typed twice |
| Stock | What is on the ground, by product and by bay: on hand, allocated to orders, available. Computed from the ledger, never edited by hand |
| Transactions | Goods in from the supplier, sales, dispatches, collections, breakages, adjustments after a count, transfers between bays. Every one signed by a user and timed |
| Orders | Counter orders now, web orders when the site is connected, WooCommerce orders later. Quote → confirmed → allocated → picked → dispatched or collected |
| Deliveries | A day board: what goes out on which van, the drop postcode, proof of delivery (photo and signature) |
| Roles | Admin (everything, users, products), Director (everything but users; reports), Office (orders, customers, deliveries, reports), Warehouse (goods in, picks, dispatch, counts) |
| Notifications | Low stock, a web order arriving, a delivery proof filed. Email first; WhatsApp later if wanted |
| Reports | Stock on hand, movements between dates, the day's dispatch sheet, an order confirmation. Printable through the same report shell the site's exports use |

## 2. Principles

- **The ledger is the truth.** Stock on hand is the sum of movements, never a number someone types over. A count that disagrees creates an adjustment movement with a reason, so the history stays honest.
- **One product code everywhere.** The sheet has none today. We define them (section 4), the site maps to them, and WooCommerce SKUs are set to them when it joins.
- **Pack maths lives once.** The `quantify` and `mixFill` functions the site already uses become a shared package the system imports, so an order for 55 m² of Autumn Brown is 3 packs + 2 loose slabs in both places.
- **No secrets in any browser.** The staff app talks to a Worker; the Worker holds the keys.
- **Owned by the company.** Everything sits in the Cloudflare account DEPLOY.md sets up. Nothing on a personal account; nothing that needs a server someone patches.
- **Works on a phone in the yard.** Warehouse screens are thumb-first: big targets, a scan or a tap per action, and a queue that holds a movement until signal returns.

## 3. Architecture

| Part | Choice | Why |
|---|---|---|
| Staff app | A second small React app in this repo (`wms/app`), deployed as its own Cloudflare Pages project at a staff address | Same tooling as the site, same design tokens, same audits |
| API | A Cloudflare Worker (`wms/api`) with a handful of routes | Runs in the same account, no server, scales to nothing when idle |
| Database | Cloudflare D1 (SQLite) | Free tier covers a yard many times over; one file to back up; SQL that any developer reads |
| Files | Cloudflare R2 for delivery-proof photos and signatures | Same account; cheap; private by default |
| Sign-in | Cloudflare Access in front of the staff address: staff sign in with their email (one-time code) or Google; our users table gives each email its role | No passwords to manage; free for a small team; the four roles stay ours |
| Notifications | Email from the Worker via a transactional mail service; the exact one is a decision, not a build | WhatsApp can be added later through the same hook |
| Reports | Server-rendered HTML through the shared MCC-style report shell, printed to PDF by the browser | Nothing to install; the site already does this for its exports |
| Public doorway | Two routes on the same Worker: read availability by code, and record a web order | The site reads stock and posts orders here; WooCommerce later posts to the same order route |

The staff app, the Worker and the database deploy from `main` like the site does. A push builds and publishes; the database schema is versioned in `wms/api/migrations`.

## 4. Product codes

Family, colour, size, thickness, all upper case, hyphenated:

| Pattern | Example | Reads as |
|---|---|---|
| `SS-<colour>-MIX-22` | `SS-RAJGREE-MIX-22` | Sandstone, Raj Green, mixed patio pack, 22 mm |
| `SS-<colour>-<size>-22` | `SS-KANDGREY-600X900-22` | Sandstone, Kandla Grey, 900 × 600, 22 mm |
| `PC-<colour>-<size>-20` | `PC-QUARWHIT-600X900-20` | Porcelain, Quartz White, 900 × 600, 20 mm |
| `IN-<colour>-<size>-8` | `IN-CALABLAN-600X1200-8` | Indoor tile |
| `CL-<colour>-600X150-22` | `CL-KANDGREY-600X150-22` | Cladding |
| `CH-<name>-15KG` | `CH-JOINBLAC-15KG` | Joint-Tec Pitch Black, 15 kg bucket |
| `ST-`, `ED-`, `GR-`, `CK-` | | Steps, edging, granite, circle kit |

A mixed pack is one code with four component rows (the sheet lists them as four rows already). `wms/seed/products.csv` is the sheet turned into this scheme: 109 rows, 72 active codes, 11 rows flagged for the yard to look at (a colour listed twice at the same size, and the four porcelains whose sheet names differ from the store's). Sinai Pearl, the six cladding colourways and the sample pieces are not in the sheet and are added by hand in the seed.

## 5. Data model

Twelve tables. Names are the yard's words.

| Table | Holds |
|---|---|
| `products` | code, name, family, colour, size, thickness, base unit (slab, box, bucket, piece), mode (fixed, mixed), per pallet, per box, m² per unit, active, site id |
| `components` | for mixed packs: code, size, per pack, m² per slab |
| `bays` | where stock sits: Front yard, Back yard, Racking A, the office shelf; free text, Admin edits |
| `movements` | the ledger: id, at, user, type (goods_in, sale, dispatch, collection, breakage, adjustment, transfer, return, web_reserve, web_release), code, bay, quantity in base units, and for a split mixed pack the four counts, reference (order, delivery note, count), note |
| `stock` | a view over movements: per code and bay, on hand, allocated, available |
| `customers` | name, phone, email, postcode, trade flag, notes |
| `orders` | number, source (counter, web, woocommerce), status, customer, fulfilment (delivery, collection), day, postcode, access notes, totals, created by |
| `order_lines` | order, code, quantity, unit (pallet, box, slab, bucket, set), the four counts for a split mixed pack, unit price, allocated movement id |
| `deliveries` | day, van, order, sequence, status (planned, out, delivered, failed), proof photo, signature, signed name, delivered at |
| `purchase_orders` and `po_lines` | expected goods in: supplier, reference, code, quantity, expected day, received day |
| `users` | email, name, role, active; Cloudflare Access supplies the identity, this table supplies the role |
| `audit` | every change to products, users and order status, who and when |

Stock never goes negative without an Admin override, and the override is itself a movement with a note.

## 6. Screens

Mobile first for the yard, desktop for the office. Each is one page in the staff app.

1. **Today**: dispatches due, collections due, goods in expected, low stock (below a per-product minimum), web orders waiting. Role-aware: Warehouse sees the first three, Office all five.
2. **Stock**: search by code or name; per product on hand, allocated, available, by bay; tap through to its movements. The number the site will show is the same "available".
3. **Goods in**: pick the purchase order or type the supplier reference, tap each line to receive the quantity delivered, photo of the delivery note, done. Creates goods_in movements.
4. **Orders**: list by status; new counter order (customer, lines by code with the pack maths, delivery or collection, day); allocate (reserves stock); pick list (Warehouse ticks lines); dispatch or collect (moves stock out, files the proof). A split mixed pack records its four counts on the line.
5. **Deliveries**: the day board, orders in van order, tap a drop to record proof: photo, signature on the shared signature pad, signed name. A failed drop reschedules.
6. **Counts**: choose a bay, walk it, enter what is there; variances become adjustment movements with a reason, in one confirmation.
7. **Products** (Admin, Director): the seed list with packing; edit, add, retire; minimum stock per product.
8. **Users** (Admin): email, role, active.
9. **Reports**: stock on hand, movements between dates, dispatch sheet for a day, an order confirmation; each printable.

The site's checkout gains nothing new on screen; behind it, "Place order" posts to the Worker as a web order with status new, and the product page reads "available" for its code.

## 7. Phases

Build by module, test each before the next. Days are working days for one person.

| Phase | What ships | Done when |
|---|---|---|
| 0. Foundation (2 days) | Repo folders, Worker, D1 schema and migrations, seed import from `products.csv`, Cloudflare Access on the staff address, the users table, the shared pack-maths package | Every seed row is in the database and `quantify` gives the same answer in the site and the API for 55 m² of Autumn Brown |
| 1. Stock (3 days) | Movements ledger, the stock view, bays, Stock and Goods in screens, Counts | A pallet received, half sold as loose slabs and the rest counted shows the right on hand in every bay, and the history explains every number |
| 2. Orders (4 days) | Customers, orders, lines with pack maths, allocate, pick, dispatch and collect, order confirmation report | A counter order for 26.4 m² of Quartz White allocates 1 pallet + 9 slabs, the pick list shows it, dispatch takes it out of stock, the confirmation prints |
| 3. Deliveries (2 days) | Day board, van order, proof of delivery with photo and signature, failed-drop reschedule | A day's drops recorded from a phone in the yard with proof visible in the office |
| 4. Site link (2 days) | Availability route (cached five minutes), web order route with Turnstile, "available" on product pages, checkout posts orders | A test order placed on the preview appears in Orders as a web order and reserves stock |
| 5. Notifications and reports (2 days) | Low stock and web-order emails, stock and movement reports | The office is told of a web order within a minute; a stock report prints for a Friday count |
| 6. WooCommerce (later, 2 days) | Its order webhook posts to the web order route; the Worker pushes "available" to its stock field on a timer | An order paid in WooCommerce appears in Orders and reserves stock; its product pages show the same availability |

Fifteen working days to a system the yard runs on, before WooCommerce.

## 8. What we reuse

- `PACKING`, `quantify`, `mixFill`, `exVat` from the site, lifted into a shared package.
- The photo pipeline's graded product images for the product list.
- The report shell and print styles for every PDF.
- The audit scripts' approach: flows, fit, axe and typo run against the staff app too.
- The Cloudflare account, the deploy pattern and DEPLOY.md's ownership table.
- Simar's vocabulary and roles, so the yard's habits carry over. If his system is opened later, its transactions import into our ledger as movements with their original dates.

## 9. Decisions for the yard

Short, and none of them stop Phase 0.

1. Bay names: how the yard is divided today (front, back, racking, the covered area).
2. Who holds which role, by email address.
3. Does stock drop when an order is allocated or when it leaves the yard? (Recommended: allocated counts against available; on hand drops at dispatch.)
4. Minimum stock per range that should raise a flag.
5. Whether delivery proof needs a signature or a photo is enough.
6. Which email service, and whether WhatsApp notifications matter.
7. The eleven flagged seed rows: which of the duplicated lines is current, and the four porcelain names that differ from the store's.

## 10. Not in this plan

Pricing and invoicing (WooCommerce and the accountant), supplier accounts, barcode labels (worth adding once codes are settled), a customer portal, and anything Simar's system does that the yard has not asked for. Each is a phase that can follow the same pattern.
