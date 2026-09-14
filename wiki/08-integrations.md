# 8. Integrations

The site has no backend and holds no secrets. The two systems it must work with, and how, without changing that.

## The rule

Anything in the front end is readable by anyone who opens the page. So the WooCommerce key and the stock tracker's shared secret never go in the site's code, and the design avoids needing them in the browser at all.

## WooCommerce: the till

WooCommerce stays as the system of record for orders and payments, on a subdomain after go-live.

- The site reads products, stock and creates the cart through WooCommerce's **Store API**, which is built to be called from a browser without a key.
- Payment happens on the gateway's hosted form (Stripe, PayPal, Klarna or WooPayments, whichever the store has). The checkout page in the demo has the same fields and hands over at the last step.
- What Fee needs from the company: a REST API key (for setup and the stock sync, not for the browser), the payment plugins and their test keys, shipping zones and rates, an admin or staging login. All listed in `HANDOVER.md`.

## The stock tracker: the warehouse

A Google Sheet with an Apps Script, maintained by Simar, with roles for Admin, Director, Warehouse and Office. He changes it regularly, so the connection is to a fixed doorway, not to his script.

- **Orders out**: WooCommerce's built-in webhook posts each paid order to the script's web app. No hosting on our side.
- **Stock in**: the script runs on a timer and writes available quantities into WooCommerce's stock field using the REST key, which lives in the script's properties. The site then reads stock from WooCommerce like everything else.
- **What stays fixed**: the web app address (deploy once, publish new versions to the same deployment), the shared secret, the two entry point names, and the field names. Everything else in the sheet and script is Simar's to change; a Changelog tab announces changes.
- **The field list** is in `present/Nitya-Stones-Stock-Tracker-Link.pdf`: read stock (code, name, size, thickness, base unit, mode, per pallet, per box, m² per unit, available, active), record order (order number, placed at, customer, fulfilment, day, postcode, lines with code, quantity, unit and slab-size counts for a split mixed pack, notes), and the reply (ok or a reason the site can show).
- **First job**: a product code on every row of the Database Products tab, matching the WooCommerce SKU. The sheet has no codes today, and no quantity column; both are decisions in that brief.

## Sinai Pearl and the cladding

Sinai Pearl is missing from the sheet; the six cladding colourways are one row. Both need rows with codes before the sync can carry them.

## Order of connection

1. Simar's test copy of the sheet and script, with made-up stock.
2. The site's `pages.dev` address pointed at a WooCommerce staging copy; a test order end to end.
3. Live sheet and live WooCommerce.

Fee does this work as part of the build, up to and including go-live, and is paid for it. Once the build is paid for, the site belongs to Nitya Stones, and Coleisha maintains it on their behalf: copy, photographs, prices, the look.
