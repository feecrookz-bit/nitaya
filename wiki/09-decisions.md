# 9. Rules, decisions and open items

## The rules the site is built to

These are why the demo is trusted, and they bind every future change:

1. **Nothing invented.** No reviews, figures, awards, "since" dates, delivery promises, fees or claims that did not come from the yard or its current site. An unconfirmed fact goes in `OPTIONS.md`, not on a page.
2. **Only the yard's own photographs.** Never a competitor's, never stock. Renders and 3D views are made from the yard's photographs and say so.
3. **The original logo**, cleaned, not redesigned.
4. **Pack sizes from the warehouse sheet only**, through `PACKING` in `data.js`. Never a coverage figure typed by hand.
5. **The wet look is simulated** and labelled until the hosed photographs are in.
6. **Delivery bands are indicative** until the real rates arrive; free over £500 inside the M25 and 3 to 5 working days are the store's own terms.
7. **The offer pop-up** reads the real was/now prices, never shows on the bag, checkout or builder, once a week, Escape closes it. Not a discount code the yard has not agreed.
8. **Text over photographs stays readable**, measured; nothing under 12 px.
9. **Both themes, three widths** checked before anything visual is pushed.
10. **No secrets in the front end.**
11. **The gate scripts, the workflow and the photo script** are not edited by hand.

## What the yard still owes

The full list with detail is `OPTIONS.md`; the short form is `HANDOVER.md` "What we need". In three groups:

- **Access (for Fee)**: WooCommerce REST key; payment plugins and test keys; shipping rates; a WordPress admin or staging login; view access to the sheet and the script's web app URL; DNS access nearer the day.
- **Answers (for Coleisha to put on the site)**: cladding colourway names; delivery terms today and any split-pack or cutting charge; the copy confirmations ("since 2016", price match, own quarries, £5 samples, what a trade account includes); the five store listings to correct so they match the sheet; Sinai Pearl added to the sheet; whether WooCommerce stays as the till; the WordPress subdomain name.
- **Assets (for Coleisha)**: the photograph originals; the logo as a vector; a reviews link; prices for the fifteen Essentials lines.

## Deliberately left alone

From the Royale Stones study (`COMPETITOR.md`): showrooms, the £80 split-pallet fee and other fees, a paid cutting service, Trustpilot and its reviews, size variants in a dropdown, bathrooms and pergolas, quantity discounts at checkout, a price-range slider. Each waits on the yard's own answer, not on a build.

## Decisions already made

- The mixed patio pack is sold honestly: the pack is 16/16/16/12 = 18.19 m² and the calculator never rounds it away; every pack splits.
- Cladding is six products, one per colourway photograph.
- Dark is the default theme; the owner can choose light.
- WooCommerce stays as the till, with the sheet syncing to it, rather than the site talking to the sheet.
- Cloudflare for the live site (a Worker serving the static build, since Cloudflare now creates new projects as Workers rather than Pages), GitHub Pages for the preview; no Vercel. Deployed 15 September into the company's own account.
- The blog moves under Guides with redirects rather than being dropped.
- The preview is open (15 September, after the first payment), with a noindex tag; the gate can be restored by removing one variable.
- The yard gets a stock system of its own rather than waiting on the tracker; the tracker's data seeds it, and its maintainer's remaining jobs need no code.
