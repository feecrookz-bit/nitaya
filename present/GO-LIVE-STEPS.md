# Finishing the job: from the preview to nityastones.co.uk

For the developer who looks after the current WordPress site and the domain, and for Coleisha at the yard. Written by Fee, 15 September 2026.

The new site is built, audited and open at the preview address (https://feecrookz-bit.github.io/nitaya/). It is not yet connected to WooCommerce, not on the company's own accounts, and the domain still points at the old site. This document is every step between here and go-live, in order, with who does each. The old site stays up throughout; customers see nothing change until the last stage, and that stage is reversible.

## Who does what

| | |
|---|---|
| Coleisha | Opens the company accounts, adds members, closes the yard's answers |
| The developer | WooCommerce key, payment plugins and test keys, shipping rates, admin login, the WordPress subdomain, the registrar login or the nameserver change |
| Fee | Builds the Cloudflare project, connects WooCommerce, moves the DNS, runs the audits, goes live |
| The owner | Confirms the copy and the go-live day |

Anything secret (keys, passwords, logins) goes by phone or WhatsApp. Never in an email chain.

## Stage 1. Accounts in the company's name (Coleisha, about 40 minutes)

1. **Cloudflare.** Done. The company's account exists on Coleisha's company email, and the new site is already deployed into it (stage 3). Manage Account → Members → invite Fee as Administrator so the DNS work in stage 5 can be done without passing tokens around.
2. **GitHub.** At github.com, create an organisation (or an account) on the company email. Add Fee and Coleisha's own login as members. Fee then transfers the site's code into it.
3. **A test email address.** An address on the domain for test orders, sign-ins and developer accounts: ask the developer to add test@nityastones.co.uk in the existing host's mail panel (free). If that is not possible, a free Gmail in the company's name does for now. Once the domain is on Cloudflare, a free forwarding address on the domain replaces either.

These three are the only things nothing else can start without.

## Stage 2. What the developer provides (about 30 minutes)

1. **WooCommerce REST API key.** WordPress admin → WooCommerce → Settings → Advanced → REST API → Add key. Description "New site", user an administrator, permissions Read/Write. The consumer key and secret show once. Send by phone.
2. **Payment plugins.** Which are installed (Stripe, PayPal, Klarna, WooPayments) and their test-mode keys, so trial orders charge nobody.
3. **Shipping.** The zones and rates as they should be, either set under WooCommerce → Settings → Shipping or written down for Fee to enter.
4. **An administrator login** to WordPress, or a staging copy if the host provides one, for moving the blog and legal pages and for the WooCommerce address settings later.
5. **The WordPress subdomain.** The blog, the legal pages and My Account keep running on WordPress at a subdomain after go-live. The redirects use wp.nityastones.co.uk as the working name. Confirm that name or give another, and confirm the host can serve the site on it.
6. **The registrar.** Who holds the login where nityastones.co.uk is renewed. The nameserver change in stage 5 needs it.

## Stage 3. Build the new home and transfer the code (Fee; the build is done)

1. **Done 15 September.** The site is deployed into the company's Cloudflare account at https://nitya-stones.coleisha.workers.dev, open with a noindex tag like the GitHub preview. The go-live audit against it reports no findings: every old-address redirect (including the two old product addresses that begin with an invisible character), the headers and the pages.
2. Every push to the code now redeploys it, once the deploy token is stored as a GitHub secret (`CLOUDFLARE_API_TOKEN`, an API token with Workers Scripts → Edit). Until then Fee deploys by hand.
3. Transfer the repository from Fee's GitHub to the company organisation. GitHub keeps redirects from the old address, so nothing breaks. Re-add the Actions secrets and variables that do not transfer (the preview password, the open-preview variable, the Cloudflare token and account id) and check both previews still come up.

## Stage 4. Connect WooCommerce (Fee, about a week)

1. Products, prices and stock on the new site read from the store through the REST key. The preview then shows the store's live prices.
2. Checkout hands to WooCommerce on the test-mode payment keys, carrying the bag, delivery or collection and the chosen day. Trial orders are placed and checked in WooCommerce.
3. Real shipping rates entered. Blog and legal pages moved onto the WordPress subdomain; the redirects file updated with the confirmed subdomain name.
4. The owner sees the final site on the workers.dev address and agrees the go-live day.

## Stage 5. Move the domain to Cloudflare (Fee and the developer, one day plus a day to settle)

1. In the Cloudflare account: Add a domain → nityastones.co.uk. Cloudflare copies the existing DNS records and shows two nameservers.
2. Before changing anything, check the copied records include the mail records (MX and any SPF or DKIM text records). Mail is the one thing that can break silently here. Add any that are missing.
3. Add a record for the WordPress subdomain pointing at the old host. Tell WordPress its new address in its own general settings, and update WooCommerce's store address settings to match.
4. At the registrar, replace the nameservers with the two Cloudflare gave. Allow up to a day to settle. The old site keeps working as before throughout, because the records are the same, just served from Cloudflare.

## Stage 6. Go-live morning (Fee, one morning, reversible)

1. In Cloudflare, Workers & Pages → nitya-stones → Settings → Domains & Routes, add nityastones.co.uk and www.nityastones.co.uk. Cloudflare sets the records itself now that DNS is with it.
2. Set the repository variable `PUBLIC_SITE` to `true` (and remove `PUBLIC_PREVIEW`), and push or run the Cloudflare workflow, so the build loses the noindex tag. The build refuses to run with neither set, so a lost variable can never publish the site open by accident.
3. Check the home page, a product page, an old product address and an old blog address in a browser. Run the go-live audit against https://nityastones.co.uk. It must report no findings.
4. Place a real order and refund it.
5. Submit the new address in Google Search Console. Leave the old site reachable on its subdomain until the owner says otherwise.

Rolling back: up to stage 6, nothing has changed for customers, so rolling back is not doing the next step. After stage 6, it is removing the two custom domains from the Worker and pointing the records back at the old host, a few minutes.

## Stage 7. After go-live

- **The stock system** at admin.nityastones.co.uk goes into the same Cloudflare account: a second Worker for the staff app, one for the API with its database, and Cloudflare Access in front so only staff emails get in. It is a separate job of about fifteen working days, after the connection.
- **Changes to the site** are arranged through Coleisha from then on. Once the build is paid for, Nitya Stones owns everything on the site.

## Time scale

Working days, one person, from the day the keys and accounts arrive.

| Days | What | Done when |
|---|---|---|
| 1 | Stage 3: the deploy token in GitHub, the repository transfer | Every push redeploys the workers.dev copy; the audit reports no findings |
| 2–5 | Stage 4: WooCommerce read, checkout on test keys, trial orders | A test order placed on the new site appears in WooCommerce with the right lines, day and address |
| 6–7 | Stage 4: blog and legal pages, shipping rates, redirects confirmed | Every old address lands on the right page |
| 8–9 | Stage 5: domain onto Cloudflare, nameservers settled | The old site still serves normally, from Cloudflare DNS |
| Go-live day | Stage 6 | Live, audit clean, a real order placed and refunded |

About two working weeks, with the switch itself a morning. What stretches it: a payment plugin that needs its own hosted page (Klarna usually does, Stripe does not), nameservers taking a day to settle, and answers from the yard arriving late. The copy confirmations and the five listings to correct must be in before the switch.

## Checklist for the developer

- [ ] WooCommerce REST key (Read/Write), sent by phone
- [ ] Payment plugins listed, test-mode keys sent by phone
- [ ] Shipping zones and rates set or written down
- [ ] WordPress administrator or staging login
- [ ] test@nityastones.co.uk created in the host's mail panel
- [ ] WordPress subdomain name confirmed and serving
- [ ] Registrar login holder named, ready for the nameserver change
