# Where we are

Nitya Stones website upgrade, 15 September 2026. One page on what is done, what is waiting on whom, and what comes next.

## Done

- **The site.** A complete new front end for nityastones.co.uk: every range and price from the store, 136 of the yard's own photographs, ordering by the pack or by the area from the warehouse's pack sizes, split packs, a patio builder, calculator, guides, projects, trade, offers, filters and search, dark and light themes, and every stone in 3D, dry or wet. Viewable at the preview address; password by phone.
- **Checked.** Behaviour, accessibility, typography, layout at five widths, spelling, text over photographs and the password gate all pass by script, re-run after every change.
- **The documents.** The owner pack (PDF), the presenter script, the handover for Coleisha and the company, the deploy guide, the competitor study, the decisions list, the build wiki, all in the repository.
- **Ready to host.** The site builds for Cloudflare Pages, every old store address has a redirect to the new site, and a go-live audit checks the live site in one command.

## Waiting on the company

- A Cloudflare account and a GitHub organisation in the company's name, with Fee added (Coleisha, on the company email).
- WooCommerce: a REST API key, the payment plugins and their test keys, shipping rates, an administrator login (the WordPress administrator).
- The domain's nameservers moved to Cloudflare (whoever holds the registrar login).
- The yard's answers and assets: cladding colour names, delivery terms, the copy confirmations, five listings to correct, prices for the fifteen Essentials, the photograph originals, the logo as a vector (Coleisha closes these across the counter).

## Then, in order

1. Fee connects the site to WooCommerce on the test keys and places a trial order end to end.
2. Blog and legal pages move across; the redirects are already written.
3. Real delivery rates entered.
4. Go-live day: the domain switches, the password comes off, the go-live audit runs against the real address. The old site stays up until the owner says otherwise.

## Time scale, from the day the keys arrive

Working days, one person, assuming the Cloudflare and GitHub accounts exist and the yard's answers come in alongside.

| Days | Work | Done when |
|---|---|---|
| 1–2 | Cloudflare Pages project, Worker, the site on its temporary address; WooCommerce read on the test key: products, prices and stock on the site come from the store | The preview shows the store's live prices and stock |
| 3–5 | Checkout hands to WooCommerce on test-mode payments; cart, delivery, collection and the chosen day carried through; trial orders placed and seen in WooCommerce | A test order placed on the new site appears in WooCommerce with the right lines, day and address |
| 6–7 | Blog and legal pages moved, redirects live, real shipping rates in, the go-live audit run against the temporary address | Every old address lands on the right page; the audit reports no findings |
| 8 | Nameservers settled, custom domain added, the switch rehearsed and the password taken off on a staging copy | The owner has seen the final site and agreed the day |
| Go-live day | Domain switched in the morning, the go-live audit run against nityastones.co.uk, a real order placed and refunded, the old site left up | Live |

About two working weeks from the keys to go-live, with the switch itself a morning. What stretches it: a payment plugin that needs its own hosted page (Klarna usually does; Stripe does not), nameservers taking a day to settle, and answers from the yard arriving late (the copy confirmations and the five listings to correct must be in before the switch).

## After the connection: the stock system

A stock system of the yard's own is planned and its foundation built, so the yard's own tracker no longer holds anything up. It runs in the same Cloudflare account at admin.nityastones.co.uk: a ledger of every movement, products seeded from the warehouse sheet with a code per line, orders, deliveries with proof, and four staff roles behind a sign-in by email. The first screens exist and the pack maths is shared with the site. It is an after-connection job: roughly fifteen working days of build, in phases, each tested before the next.

## Who does what

| | |
|---|---|
| Fee | The connection to WooCommerce, the DNS switch, go-live; then the stock system |
| Coleisha | The company accounts, the yard's answers and assets, and every change to the site after go-live |
| The WordPress administrator | The WooCommerce key, plugin list, shipping rates, admin login |
| The owner | The decisions in the pack, and the go-live day |
